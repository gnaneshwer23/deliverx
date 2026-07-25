/**
 * Persistence for Learning Intelligence.
 * Always sets capability_assigned=false and learning_not_capability=true.
 * Never touches capability / ScoreRun / Verified tables.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { appendEvidence } from "@/lib/evidence-ledger/append";
import {
  advanceLearningLevel,
  deriveJustifiedLevel,
} from "@/lib/learning-intelligence/levels";
import { recommendLearningFromGaps } from "@/lib/learning-intelligence/recommendations";
import type {
  ApplicationTrigger,
  CreateLearningItemInput,
  LearningEvidenceLevel,
  LearningItemKind,
  LearningItemRecord,
  LearningPathRecord,
  LearningPathStep,
  LearningPathStatus,
  LearningRecommendation,
} from "@/lib/learning-intelligence/types";
import { isLearningItemKind } from "@/lib/learning-intelligence/types";

function mapItem(row: Record<string, unknown>): LearningItemRecord {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    kind: row.kind as LearningItemKind,
    title: row.title as string,
    topic: (row.topic as string) ?? "",
    source: (row.source as string) ?? "",
    consumedOn: (row.consumed_on as string | null) ?? null,
    concepts: (row.concepts as string[]) ?? [],
    reflection: (row.reflection as string) ?? "",
    relevanceToRole: (row.relevance_to_role as string) ?? "",
    relevanceToGaps: (row.relevance_to_gaps as string[]) ?? [],
    targetCompetencyCodes: (row.target_competency_codes as string[]) ?? [],
    evidenceLevel: row.evidence_level as LearningEvidenceLevel,
    evidenceId: (row.evidence_id as string | null) ?? null,
    learningPathId: (row.learning_path_id as string | null) ?? null,
    applicationEvidenceIds: ((row.application_evidence_ids as string[]) ?? []).map(String),
    applicationHref: (row.application_href as string | null) ?? null,
    capabilityAssigned: false,
    learningNotCapability: true,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapPath(row: Record<string, unknown>): LearningPathRecord {
  const trigger = row.application_trigger as ApplicationTrigger | Record<string, unknown> | null;
  let applicationTrigger: ApplicationTrigger | null = null;
  if (
    trigger &&
    typeof trigger === "object" &&
    typeof (trigger as ApplicationTrigger).href === "string" &&
    typeof (trigger as ApplicationTrigger).title === "string"
  ) {
    applicationTrigger = trigger as ApplicationTrigger;
  }

  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    rationale: (row.rationale as string) ?? "",
    targetGap: (row.target_gap as string | null) ?? null,
    competencyCodes: (row.competency_codes as string[]) ?? [],
    status: row.status as LearningPathStatus,
    applicationTrigger,
    steps: (row.steps as LearningPathStep[]) ?? [],
    sourceSnapshotId: (row.source_snapshot_id as string | null) ?? null,
    sourceScoreRunId: (row.source_score_run_id as string | null) ?? null,
    frameworkVersionId: (row.framework_version_id as string | null) ?? null,
    outcomeSupported: Boolean(row.outcome_supported),
    outcomeEvidenceId: (row.outcome_evidence_id as string | null) ?? null,
    capabilityAssigned: false,
    learningNotCapability: true,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listLearningItems(
  supabase: SupabaseClient,
  userId: string,
): Promise<LearningItemRecord[]> {
  const { data, error } = await supabase
    .from("pi_learning_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map((r) => mapItem(r as Record<string, unknown>));
}

export async function listLearningPaths(
  supabase: SupabaseClient,
  userId: string,
): Promise<LearningPathRecord[]> {
  const { data, error } = await supabase
    .from("pi_learning_paths")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["offered", "accepted", "in_progress", "unproven"])
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((r) => mapPath(r as Record<string, unknown>));
}

/**
 * Create a learning item and append knowledge evidence to the ledger.
 * Never assigns capability. Never triggers ScoreRun.
 */
export async function createLearningItem(
  supabase: SupabaseClient,
  userId: string,
  input: CreateLearningItemInput,
): Promise<{ item: LearningItemRecord; evidenceId: string; capabilityAssigned: false }> {
  if (!input.title?.trim()) throw new Error("Title is required");
  if (!isLearningItemKind(input.kind)) throw new Error("Invalid learning item kind");

  const justified = deriveJustifiedLevel({
    reflection: input.reflection,
    concepts: input.concepts,
  });
  // Creation never jumps to applied+ — those require practice evidence links.
  let evidenceLevel: LearningEvidenceLevel = justified;
  if (
    evidenceLevel === "applied" ||
    evidenceLevel === "repeatedly_applied" ||
    evidenceLevel === "outcome_supported"
  ) {
    evidenceLevel = hasReflectionOrConcepts(input)
      ? input.reflection && input.reflection.trim().length >= 20
        ? "reflected_upon"
        : "understood"
      : "consumed";
  }

  const { data: row, error } = await supabase
    .from("pi_learning_items")
    .insert({
      user_id: userId,
      kind: input.kind,
      title: input.title.trim(),
      topic: (input.topic ?? "").trim(),
      source: (input.source ?? "").trim(),
      consumed_on: input.consumedOn ?? null,
      concepts: input.concepts ?? [],
      reflection: (input.reflection ?? "").trim(),
      relevance_to_role: (input.relevanceToRole ?? "").trim(),
      relevance_to_gaps: input.relevanceToGaps ?? [],
      target_competency_codes: input.targetCompetencyCodes ?? [],
      evidence_level: evidenceLevel,
      learning_path_id: input.learningPathId ?? null,
      capability_assigned: false,
      learning_not_capability: true,
      metadata: { createdVia: "learning-intelligence-v1" },
    })
    .select("*")
    .single();

  if (error) throw error;

  const itemId = row.id as string;

  const append = await appendEvidence(supabase, {
    userId,
    sourceType: "learning_activity",
    category: "knowledge",
    title: `Learning: ${input.title.trim()}`,
    summary: [
      input.topic?.trim(),
      input.relevanceToRole?.trim(),
      input.reflection?.trim()?.slice(0, 240),
    ]
      .filter(Boolean)
      .join(" · "),
    rawContent: {
      learningItemId: itemId,
      kind: input.kind,
      topic: input.topic ?? "",
      source: input.source ?? "",
      concepts: input.concepts ?? [],
      reflection: input.reflection ?? "",
      relevanceToRole: input.relevanceToRole ?? "",
      relevanceToGaps: input.relevanceToGaps ?? [],
      targetCompetencyCodes: input.targetCompetencyCodes ?? [],
      evidenceLevel,
      learningNotCapability: true,
      capabilityAssigned: false,
      notice: "Learning evidence is knowledge-only. ScoreRun interprets practice evidence for capability.",
    },
    sourceRecordType: "pi_learning_items",
    sourceRecordId: itemId,
    confidentiality: "private",
    consentStatus: "analysis_allowed",
    idempotencyKey: `learning-item:${itemId}`,
    provenance: {
      actorType: "user",
      actorUserId: userId,
      userContribution: {
        kind: input.kind,
        title: input.title.trim(),
        reflection: input.reflection ?? "",
        concepts: input.concepts ?? [],
      },
      aiContribution: {},
      promptSlug: "learning-intelligence",
      promptVersion: "v1",
    },
  });

  const { data: updated, error: updErr } = await supabase
    .from("pi_learning_items")
    .update({
      evidence_id: append.evidenceId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (updErr) throw updErr;

  return {
    item: mapItem(updated as Record<string, unknown>),
    evidenceId: append.evidenceId,
    capabilityAssigned: false,
  };
}

function hasReflectionOrConcepts(input: CreateLearningItemInput): boolean {
  return Boolean(
    (input.concepts && input.concepts.length > 0) ||
      (input.reflection && input.reflection.trim().length >= 20),
  );
}

export async function updateLearningItem(
  supabase: SupabaseClient,
  userId: string,
  itemId: string,
  patch: {
    reflection?: string;
    concepts?: string[];
    relevanceToRole?: string;
    relevanceToGaps?: string[];
    applicationEvidenceIds?: string[];
    applicationHref?: string | null;
    advance?: boolean;
    measuredLevelChange?: boolean;
  },
): Promise<LearningItemRecord> {
  const { data: existing, error: loadErr } = await supabase
    .from("pi_learning_items")
    .select("*")
    .eq("id", itemId)
    .eq("user_id", userId)
    .single();
  if (loadErr) throw loadErr;

  const current = mapItem(existing as Record<string, unknown>);
  const reflection = patch.reflection ?? current.reflection;
  const concepts = patch.concepts ?? current.concepts;
  const applicationEvidenceIds =
    patch.applicationEvidenceIds ?? current.applicationEvidenceIds;

  const progression = advanceLearningLevel({
    current: current.evidenceLevel,
    reflection,
    concepts,
    applicationEvidenceIds,
    evidenceId: current.evidenceId,
    measuredLevelChange: patch.measuredLevelChange ?? false,
    advance: patch.advance,
  });

  if (!progression.ok && patch.advance) {
    throw new Error(progression.reason);
  }

  const nextLevel = progression.ok ? progression.to : current.evidenceLevel;

  const { data, error } = await supabase
    .from("pi_learning_items")
    .update({
      reflection: reflection.trim(),
      concepts,
      relevance_to_role:
        patch.relevanceToRole !== undefined
          ? patch.relevanceToRole.trim()
          : current.relevanceToRole,
      relevance_to_gaps: patch.relevanceToGaps ?? current.relevanceToGaps,
      application_evidence_ids: applicationEvidenceIds,
      application_href:
        patch.applicationHref !== undefined
          ? patch.applicationHref
          : current.applicationHref,
      evidence_level: nextLevel,
      capability_assigned: false,
      learning_not_capability: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return mapItem(data as Record<string, unknown>);
}

/**
 * Persist recommended paths from ScoreRun gaps (idempotent-ish by gap+user open status).
 */
export async function ensureLearningPathsFromGaps(
  supabase: SupabaseClient,
  input: {
    userId: string;
    gaps: string[];
    targetRole?: string | null;
    experienceHref?: string | null;
    sourceSnapshotId?: string | null;
    sourceScoreRunId?: string | null;
    frameworkVersionId?: string | null;
  },
): Promise<{ paths: LearningPathRecord[]; recommendations: LearningRecommendation[] }> {
  const recommendations = recommendLearningFromGaps({
    gaps: input.gaps,
    targetRole: input.targetRole,
    experienceHref: input.experienceHref,
  });

  const existing = await listLearningPaths(supabase, input.userId);
  const existingGaps = new Set(existing.map((p) => p.targetGap ?? ""));

  const toInsert = recommendations.filter((r) => !existingGaps.has(r.targetGap));
  if (!toInsert.length) {
    return { paths: existing, recommendations };
  }

  const rows = toInsert.map((r) => ({
    user_id: input.userId,
    title: r.pathTitle,
    rationale: r.rationale,
    target_gap: r.targetGap,
    competency_codes: r.competencyCodes,
    status: "offered" as const,
    application_trigger: r.applicationTrigger,
    steps: r.concepts.map((c, i) => ({
      id: `step-${i + 1}`,
      title: c,
      kind: r.suggestedKinds[0] ?? "article",
      prompt: `Learn and reflect: ${c}`,
      applicationTrigger: r.applicationTrigger,
    })),
    source_snapshot_id: input.sourceSnapshotId ?? null,
    source_score_run_id: input.sourceScoreRunId ?? null,
    framework_version_id: input.frameworkVersionId ?? null,
    outcome_supported: false,
    capability_assigned: false,
    learning_not_capability: true,
  }));

  const { data, error } = await supabase
    .from("pi_learning_paths")
    .insert(rows)
    .select("*");
  if (error) throw error;

  const created = (data ?? []).map((r) => mapPath(r as Record<string, unknown>));
  return { paths: [...created, ...existing], recommendations };
}

/** Highest evidence level across the user's learning items (for Profile CTA). */
export async function loadLearningSummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<{
  itemCount: number;
  highestLevel: LearningEvidenceLevel | null;
  reflectedUponOrHigher: boolean;
  capabilityAssigned: false;
}> {
  const items = await listLearningItems(supabase, userId);
  if (!items.length) {
    return {
      itemCount: 0,
      highestLevel: null,
      reflectedUponOrHigher: false,
      capabilityAssigned: false,
    };
  }
  const order = [
    "consumed",
    "understood",
    "reflected_upon",
    "applied",
    "repeatedly_applied",
    "outcome_supported",
  ] as const;
  let bestIdx = 0;
  for (const item of items) {
    const idx = order.indexOf(item.evidenceLevel);
    if (idx > bestIdx) bestIdx = idx;
  }
  const highestLevel = order[bestIdx];
  return {
    itemCount: items.length,
    highestLevel,
    reflectedUponOrHigher: bestIdx >= order.indexOf("reflected_upon"),
    capabilityAssigned: false,
  };
}
