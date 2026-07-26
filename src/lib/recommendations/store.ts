/**
 * B2 recommendation persistence — self-only rows in pi_recommendations.
 * Transitions are validated here for typed errors and enforced again by the
 * 0098 DB trigger, which also appends the append-only lifecycle audit rows.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { loadRecentSnapshotClaims } from "@/lib/capability-engine/snapshot-claims";
import {
  assertRecommendationDraftSafe,
  buildRecommendationDraftsFromSnapshot,
} from "@/lib/recommendations/generate";
import {
  decideRecommendationTransition,
  RECOMMENDATION_STATUS_TIMESTAMP,
} from "@/lib/recommendations/state-machine";
import type {
  RecommendationAction,
  RecommendationEventRecord,
  RecommendationRecord,
  RecommendationStatus,
  RecommendationTransitionResult,
} from "@/lib/recommendations/types";

export class RecommendationNotFoundError extends Error {
  constructor() {
    super("Recommendation not found");
    this.name = "RecommendationNotFoundError";
  }
}

export class RecommendationTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecommendationTransitionError";
  }
}

const ACTIVE_STATUSES: RecommendationStatus[] = ["generated", "viewed", "accepted"];

function mapRecommendationRow(
  row: Record<string, unknown>,
  evidenceReferences: string[] = [],
): RecommendationRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    status: row.status as RecommendationStatus,
    title: String(row.title),
    rationale: String(row.rationale),
    competencyId: (row.competency_id as string | null) ?? null,
    href: String(row.href),
    sourceType: "capability_snapshot",
    sourceId: String(row.source_id),
    sourceSnapshotId: (row.source_snapshot_id as string | null) ?? null,
    sourceScoreRunId: (row.source_score_run_id as string | null) ?? null,
    dedupeKey: String(row.dedupe_key),
    evidenceReferences,
    payload: (row.payload as Record<string, unknown>) ?? {},
    capabilityAssigned: false,
    verificationChanged: false,
    generatedAt: String(row.generated_at),
    viewedAt: (row.viewed_at as string | null) ?? null,
    acceptedAt: (row.accepted_at as string | null) ?? null,
    dismissedAt: (row.dismissed_at as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

async function attachEvidenceReferences(
  supabase: SupabaseClient,
  userId: string,
  rows: Record<string, unknown>[],
): Promise<RecommendationRecord[]> {
  const ids = rows.map((r) => String(r.id));
  if (!ids.length) return [];

  const { data: links, error } = await supabase
    .from("pi_recommendation_evidence")
    .select("recommendation_id, evidence_reference")
    .eq("user_id", userId)
    .in("recommendation_id", ids);
  if (error) throw error;

  const byRec = new Map<string, string[]>();
  for (const link of links ?? []) {
    const recId = String(link.recommendation_id);
    const refs = byRec.get(recId) ?? [];
    refs.push(String(link.evidence_reference));
    byRec.set(recId, refs);
  }

  return rows.map((row) =>
    mapRecommendationRow(row, byRec.get(String(row.id)) ?? []),
  );
}

/**
 * Idempotently materialise recommendations from the user's latest capability
 * snapshot. Existing rows (any status) are never overwritten — dismissing a
 * recommendation stays dismissed across syncs.
 */
export async function syncRecommendationsFromLatestSnapshot(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ created: number }> {
  const { latest } = await loadRecentSnapshotClaims(supabase, userId, 1);
  if (!latest) return { created: 0 };

  const drafts = buildRecommendationDraftsFromSnapshot(latest);
  if (!drafts.length) return { created: 0 };
  for (const draft of drafts) assertRecommendationDraftSafe(draft);

  const { data: inserted, error } = await supabase
    .from("pi_recommendations")
    .upsert(
      drafts.map((d) => ({
        user_id: userId,
        status: "generated",
        title: d.title.trim(),
        rationale: d.rationale.trim(),
        competency_id: d.competencyId,
        href: d.href,
        source_type: d.sourceType,
        source_id: d.sourceId,
        source_snapshot_id: d.sourceSnapshotId,
        source_score_run_id: d.sourceScoreRunId,
        dedupe_key: d.dedupeKey,
        payload: {
          ...(d.payload ?? {}),
          capabilityAssigned: false,
          verificationChanged: false,
        },
        capability_assigned: false,
        verification_changed: false,
      })),
      { onConflict: "user_id,dedupe_key", ignoreDuplicates: true },
    )
    .select("id, dedupe_key");
  if (error) throw error;

  const insertedRows = inserted ?? [];
  if (insertedRows.length) {
    const draftByKey = new Map(drafts.map((d) => [d.dedupeKey, d]));
    const links = insertedRows.flatMap((row) => {
      const draft = draftByKey.get(String(row.dedupe_key));
      return (draft?.evidenceReferences ?? []).map((reference) => ({
        recommendation_id: String(row.id),
        user_id: userId,
        evidence_reference: reference,
      }));
    });
    if (links.length) {
      const { error: linkError } = await supabase
        .from("pi_recommendation_evidence")
        .upsert(links, {
          onConflict: "recommendation_id,evidence_reference",
          ignoreDuplicates: true,
        });
      if (linkError) throw linkError;
    }
  }

  return { created: insertedRows.length };
}

export async function listRecommendations(
  supabase: SupabaseClient,
  userId: string,
  options: { activeOnly?: boolean; limit?: number } = {},
): Promise<RecommendationRecord[]> {
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 50);
  let query = supabase
    .from("pi_recommendations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (options.activeOnly !== false) {
    query = query.in("status", ACTIVE_STATUSES);
  }
  const { data, error } = await query;
  if (error) throw error;
  return attachEvidenceReferences(
    supabase,
    userId,
    (data ?? []) as Record<string, unknown>[],
  );
}

/**
 * Deterministic, idempotent lifecycle transition.
 * - Requesting the current state is a successful no-op.
 * - Invalid transitions raise RecommendationTransitionError.
 * - Concurrency is handled optimistically; a racing identical transition
 *   resolves as idempotent success.
 */
export async function transitionRecommendation(
  supabase: SupabaseClient,
  input: {
    userId: string;
    recommendationId: string;
    to: RecommendationAction;
  },
): Promise<RecommendationTransitionResult> {
  const { data: row, error } = await supabase
    .from("pi_recommendations")
    .select("*")
    .eq("id", input.recommendationId)
    .eq("user_id", input.userId)
    .maybeSingle();
  if (error) throw error;
  if (!row) throw new RecommendationNotFoundError();

  const current = mapRecommendationRow(row as Record<string, unknown>);
  const decision = decideRecommendationTransition(current.status, input.to);
  if (decision.kind === "noop") {
    return { record: current, idempotent: true };
  }
  if (decision.kind === "invalid") {
    throw new RecommendationTransitionError(decision.reason);
  }

  const patch: Record<string, unknown> = { status: input.to };
  const timestampColumn = RECOMMENDATION_STATUS_TIMESTAMP[input.to];
  if (timestampColumn) patch[timestampColumn] = new Date().toISOString();

  const { data: updated, error: updateError } = await supabase
    .from("pi_recommendations")
    .update(patch)
    .eq("id", input.recommendationId)
    .eq("user_id", input.userId)
    .eq("status", current.status)
    .select("*")
    .maybeSingle();
  if (updateError) throw updateError;

  if (!updated) {
    // Lost a race — re-read and resolve deterministically.
    const { data: refreshed, error: refreshError } = await supabase
      .from("pi_recommendations")
      .select("*")
      .eq("id", input.recommendationId)
      .eq("user_id", input.userId)
      .maybeSingle();
    if (refreshError) throw refreshError;
    if (!refreshed) throw new RecommendationNotFoundError();
    const record = mapRecommendationRow(refreshed as Record<string, unknown>);
    if (record.status === input.to) {
      return { record, idempotent: true };
    }
    throw new RecommendationTransitionError(
      `Recommendation changed concurrently (now "${record.status}").`,
    );
  }

  return {
    record: mapRecommendationRow(updated as Record<string, unknown>),
    idempotent: false,
  };
}

/**
 * Bulk "seen it" marker for surfaces: generated → viewed only.
 * Safe to repeat; rows in any other state are untouched.
 */
export async function markRecommendationsViewed(
  supabase: SupabaseClient,
  userId: string,
  recommendationIds: string[],
): Promise<number> {
  if (!recommendationIds.length) return 0;
  const { data, error } = await supabase
    .from("pi_recommendations")
    .update({ status: "viewed", viewed_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "generated")
    .in("id", recommendationIds)
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

/** Append-only lifecycle history for one recommendation (audit surface). */
export async function listRecommendationEvents(
  supabase: SupabaseClient,
  userId: string,
  recommendationId: string,
): Promise<RecommendationEventRecord[]> {
  const { data, error } = await supabase
    .from("pi_recommendation_events")
    .select("*")
    .eq("user_id", userId)
    .eq("recommendation_id", recommendationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: String(row.id),
    recommendationId: String(row.recommendation_id),
    userId: String(row.user_id),
    fromStatus: (row.from_status as RecommendationStatus | null) ?? null,
    toStatus: row.to_status as RecommendationStatus,
    actor: row.actor as "user" | "system",
    note: String(row.note ?? ""),
    createdAt: String(row.created_at),
  }));
}
