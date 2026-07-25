/**
 * Development-loop interventions MVP.
 * Coach recommends; never auto-acts; never writes capability.
 * Traceability: interventions cite evidence IDs; outcomes associate snapshot deltas.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  InterventionDraft,
  InterventionKind,
  InterventionRecord,
  InterventionStatus,
} from "@/lib/workspace-observation/types";

const GAP_CODE_RE = /^(comp\.[a-z0-9_]+)/i;

export function extractCompetencyCode(gap: string): string | null {
  const m = gap.match(GAP_CODE_RE);
  return m ? m[1].toLowerCase() : null;
}

/**
 * Map ScoreRun gaps + accumulated evidence into targeted intervention drafts.
 * Pure — no I/O, no capability writes.
 */
export function mapGapsToInterventionDrafts(input: {
  gaps: string[];
  evidenceIds?: string[];
  workspaceEvidenceCount?: number;
}): InterventionDraft[] {
  const drafts: InterventionDraft[] = [];
  const evidenceIds = input.evidenceIds ?? [];
  const hasWorkspaceEvidence = (input.workspaceEvidenceCount ?? 0) > 0 || evidenceIds.length > 0;

  for (const gap of input.gaps.slice(0, 4)) {
    const code = extractCompetencyCode(gap);
    const competencyCodes = code ? [code] : [];
    const gapLower = gap.toLowerCase();

    // Prefer scenario practice when workspace evidence exists (apply in context)
    if (hasWorkspaceEvidence && (gapLower.includes("emerging") || gapLower.includes("insufficient"))) {
      drafts.push({
        kind: "scenario_suggestion",
        title: `Practice gap in Experience: ${code ?? gap.slice(0, 48)}`,
        rationale: `ScoreRun highlights “${gap}”. A targeted Experience scenario produces comparable practice evidence. Association only — not proven causation.`,
        targetGap: gap,
        competencyCodes,
        href: "/experience/app",
        triggeringEvidenceIds: evidenceIds.slice(0, 8),
        payload: { surface: "experience", capabilityAssigned: false },
      });
    }

    drafts.push({
      kind: "reflection_prompt",
      title: `Reflect on: ${code ?? "your top gap"}`,
      rationale: `Open Coach and capture a short reflection on “${gap}”. Reflections are knowledge evidence; pair with practice for capability movement.`,
      targetGap: gap,
      competencyCodes,
      href: "/workspace/coach",
      triggeringEvidenceIds: evidenceIds.slice(0, 8),
      payload: {
        surface: "coach",
        prompt: `What decision or risk response last week demonstrated (or avoided) progress on: ${gap}?`,
        capabilityAssigned: false,
      },
    });

    if (drafts.filter((d) => d.kind === "learning_pointer").length < 2) {
      drafts.push({
        kind: "learning_pointer",
        title: `Learning pointer for ${code ?? "gap"}`,
        rationale:
          "A learning activity alone is not competency proof. Log focused learning on /learning, reflect, then apply it in Workspace or Experience so ScoreRun can interpret practice evidence.",
        targetGap: gap,
        competencyCodes,
        href: `/learning?gap=${encodeURIComponent(code ?? gap.slice(0, 64))}`,
        triggeringEvidenceIds: evidenceIds.slice(0, 8),
        payload: {
          surface: "learning",
          note: "Learning Intelligence — knowledge evidence only; never assigns capability.",
          capabilityAssigned: false,
          learningNotCapability: true,
        },
      });
    }
  }

  // Deduplicate by kind+targetGap
  const seen = new Set<string>();
  return drafts.filter((d) => {
    const key = `${d.kind}:${d.targetGap}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 6);
}

function mapInterventionRow(row: Record<string, unknown>): InterventionRecord {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    kind: row.kind as InterventionKind,
    status: row.status as InterventionStatus,
    title: row.title as string,
    rationale: (row.rationale as string) ?? "",
    targetGap: (row.target_gap as string | null) ?? null,
    competencyCodes: (row.competency_codes as string[]) ?? [],
    href: (row.href as string | null) ?? null,
    sourceSnapshotId: (row.source_snapshot_id as string | null) ?? null,
    sourceScoreRunId: (row.source_score_run_id as string | null) ?? null,
    triggeringEvidenceIds: ((row.triggering_evidence_ids as string[]) ?? []).map(String),
    capabilityAssigned: false,
    offeredAt: row.offered_at as string,
    acceptedAt: (row.accepted_at as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
  };
}

export async function offerInterventions(
  supabase: SupabaseClient,
  input: {
    userId: string;
    drafts: InterventionDraft[];
    sourceSnapshotId?: string | null;
    sourceScoreRunId?: string | null;
  },
): Promise<InterventionRecord[]> {
  if (!input.drafts.length) return [];

  const rows = input.drafts.map((d) => ({
    user_id: input.userId,
    kind: d.kind,
    status: "offered",
    title: d.title,
    rationale: d.rationale,
    target_gap: d.targetGap,
    competency_codes: d.competencyCodes,
    href: d.href,
    source_snapshot_id: input.sourceSnapshotId ?? null,
    source_score_run_id: input.sourceScoreRunId ?? null,
    triggering_evidence_ids: d.triggeringEvidenceIds,
    payload: { ...(d.payload ?? {}), capabilityAssigned: false },
    capability_assigned: false,
  }));

  const { data, error } = await supabase
    .from("pi_interventions")
    .insert(rows)
    .select("*");
  if (error) throw error;
  return (data ?? []).map((r) => mapInterventionRow(r as Record<string, unknown>));
}

export async function listActiveInterventions(
  supabase: SupabaseClient,
  userId: string,
): Promise<InterventionRecord[]> {
  const { data, error } = await supabase
    .from("pi_interventions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["offered", "accepted"])
    .order("offered_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((r) => mapInterventionRow(r as Record<string, unknown>));
}

export async function transitionIntervention(
  supabase: SupabaseClient,
  input: {
    userId: string;
    interventionId: string;
    to: "accepted" | "dismissed" | "completed";
  },
): Promise<InterventionRecord> {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status: input.to,
    updated_at: now,
  };
  if (input.to === "accepted") patch.accepted_at = now;
  if (input.to === "completed") patch.completed_at = now;
  if (input.to === "dismissed") patch.dismissed_at = now;

  const { data, error } = await supabase
    .from("pi_interventions")
    .update(patch)
    .eq("id", input.interventionId)
    .eq("user_id", input.userId)
    .select("*")
    .single();
  if (error) throw error;

  await supabase.from("pi_intervention_outcomes").insert({
    intervention_id: input.interventionId,
    user_id: input.userId,
    outcome_kind: input.to,
    association_only: true,
    note: "Status transition — not a capability assignment.",
  });

  return mapInterventionRow(data as Record<string, unknown>);
}

/**
 * Associate an intervention with a subsequent snapshot delta (traceability).
 * Reports association with cited evidence — never proven causation.
 */
export async function recordInterventionSnapshotDelta(
  supabase: SupabaseClient,
  input: {
    userId: string;
    interventionId: string;
    beforeSnapshotId?: string | null;
    afterSnapshotId: string;
    citedEvidenceIds?: string[];
    readinessDelta?: number | null;
    gapsClosed?: string[];
  },
) {
  const { data, error } = await supabase
    .from("pi_intervention_outcomes")
    .insert({
      intervention_id: input.interventionId,
      user_id: input.userId,
      outcome_kind: "snapshot_delta",
      before_snapshot_id: input.beforeSnapshotId ?? null,
      after_snapshot_id: input.afterSnapshotId,
      cited_evidence_ids: input.citedEvidenceIds ?? [],
      readiness_delta: input.readinessDelta ?? null,
      gaps_closed: input.gapsClosed ?? [],
      association_only: true,
      note: "Associated with snapshot delta via cited evidence IDs — not proven causation.",
    })
    .select("id")
    .single();
  if (error) throw error;
  return { outcomeId: data.id as string, associationOnly: true as const };
}

/**
 * Ensure interventions exist for current gaps when workspace evidence has accumulated.
 * Idempotent-ish: skips if an open intervention already targets the same gap+kind.
 */
export async function ensureInterventionsForGaps(
  supabase: SupabaseClient,
  input: {
    userId: string;
    gaps: string[];
    evidenceIds?: string[];
    workspaceEvidenceCount?: number;
    sourceSnapshotId?: string | null;
    sourceScoreRunId?: string | null;
  },
): Promise<InterventionRecord[]> {
  if (!input.gaps.length) return listActiveInterventions(supabase, input.userId);

  const existing = await listActiveInterventions(supabase, input.userId);
  const existingKeys = new Set(
    existing.map((i) => `${i.kind}:${i.targetGap ?? ""}`),
  );

  const drafts = mapGapsToInterventionDrafts({
    gaps: input.gaps,
    evidenceIds: input.evidenceIds,
    workspaceEvidenceCount: input.workspaceEvidenceCount,
  }).filter((d) => !existingKeys.has(`${d.kind}:${d.targetGap}`));

  if (!drafts.length) return existing;

  const offered = await offerInterventions(supabase, {
    userId: input.userId,
    drafts,
    sourceSnapshotId: input.sourceSnapshotId,
    sourceScoreRunId: input.sourceScoreRunId,
  });

  return [...offered, ...existing];
}
