import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrchestratorResult } from "@/lib/capability-engine/types";
import {
  ALGORITHM_VERSION,
  DEFAULT_MODEL_VERSION,
  DEFAULT_PROMPT_VERSION,
} from "@/lib/capability-engine/types";
import type { FrameworkVersionPin } from "@/lib/admin-framework/rubric-bridge";
import type { RubricResolveSource } from "@/lib/capability-engine/rubric-resolve-policy";

export type ScoreRunKind = "standard" | "baseline" | "final" | "transfer";

export type PersistCapabilityRunInput = {
  userId: string;
  targetRole?: string;
  targetSeniority?: string;
  rubricSlug: string;
  rubricVersion: string;
  result: OrchestratorResult;
  /** Published pi_cf_* pin — set whenever a matching published version exists. */
  frameworkPin?: FrameworkVersionPin | null;
  /** baseline = starting picture; final/transfer = post-practice; default standard. */
  runKind?: ScoreRunKind;
  /** T2: how the rubric was resolved (db | in_code_fallback). */
  rubricResolveSource?: RubricResolveSource | null;
};

/** Build the score-run insert row (shared by success + failure paths). */
export function buildScoreRunInsertRow(input: PersistCapabilityRunInput) {
  const pin = input.frameworkPin ?? null;
  const runKind: ScoreRunKind = input.runKind ?? "standard";
  const rubricResolveSource = input.rubricResolveSource ?? null;
  const base = {
    user_id: input.userId,
    rubric_slug: input.rubricSlug,
    rubric_version: input.rubricVersion,
    algorithm_version: ALGORITHM_VERSION,
    target_role: input.targetRole ?? null,
    target_seniority: input.targetSeniority ?? null,
    framework_version_id: pin?.frameworkVersionId ?? null,
    framework_content_hash: pin?.contentHash ?? null,
    rubric_resolve_source: rubricResolveSource,
    run_kind: runKind,
  };

  if (!input.result.ok || !input.result.snapshot) {
    return {
      ...base,
      model_version: DEFAULT_MODEL_VERSION,
      prompt_version: DEFAULT_PROMPT_VERSION,
      input_evidence_ids: [] as string[],
      input_hash: input.result.inputHash || "none",
      status: "failed" as const,
      result: {
        error: input.result.error,
        reviewQueue: input.result.reviewQueue,
        frameworkContentHash: pin?.contentHash ?? null,
        frameworkPinSource: pin?.source ?? null,
        rubricResolveSource,
        runKind,
      },
      error_message: input.result.error ?? "failed",
    };
  }

  const snapshot = input.result.snapshot;
  const evidenceIds = [
    ...new Set(input.result.judgements.flatMap((j) => j.evidenceReferences)),
  ];

  return {
    ...base,
    model_version: snapshot.modelVersion,
    prompt_version: snapshot.promptVersion,
    input_evidence_ids: evidenceIds,
    input_hash: input.result.inputHash,
    status: input.result.reviewQueue.some((r) => r.reason === "judgement_pending_review")
      ? ("needs_review" as const)
      : ("completed" as const),
    result: {
      readiness: snapshot.readiness,
      dimensions: snapshot.dimensions,
      strengths: snapshot.strengths,
      gaps: snapshot.gaps,
      recommendations: snapshot.recommendations,
      growth: input.result.growth,
      stepsCompleted: input.result.stepsCompleted,
      frameworkContentHash: pin?.contentHash ?? null,
      frameworkPinSource: pin?.source ?? null,
      rubricResolveSource,
      runKind,
    },
    error_message: null as string | null,
  };
}

export async function persistCapabilityRun(
  supabase: SupabaseClient,
  input: PersistCapabilityRunInput,
) {
  const runRow = buildScoreRunInsertRow(input);

  if (!input.result.ok || !input.result.snapshot) {
    const { data: failed, error } = await supabase
      .from("pi_capability_score_runs")
      .insert(runRow as Record<string, unknown>)
      .select("id")
      .single();
    if (error) throw error;
    return { scoreRunId: failed.id as string, snapshotId: null as string | null };
  }

  const { data: run, error: runError } = await supabase
    .from("pi_capability_score_runs")
    .insert(runRow as Record<string, unknown>)
    .select("id")
    .single();
  if (runError) throw runError;

  const scoreRunId = run.id as string;
  const snapshot = input.result.snapshot;

  if (input.result.judgements.length) {
    const { error: jErr } = await supabase.from("pi_capability_judgements").insert(
      input.result.judgements.map((j) => ({
        score_run_id: scoreRunId,
        user_id: input.userId,
        competency_id: j.competencyId,
        indicator_id: j.indicatorId,
        level_proposed: j.levelProposed,
        evidence_refs: j.evidenceReferences,
        reasoning_summary: j.reasoningSummary,
        counter_evidence: j.counterEvidence,
        confidence: j.confidence,
        limitations: j.limitations,
        model_version: j.modelVersion,
        prompt_version: j.promptVersion,
        rubric_version: j.rubricVersion,
        review_status: j.reviewStatus,
        intelligence_kinds: j.intelligenceKinds,
      })),
    );
    if (jErr) throw jErr;
  }

  const { data: snap, error: snapError } = await supabase
    .from("pi_capability_snapshots")
    .insert({
      user_id: input.userId,
      score_run_id: scoreRunId,
      schema_version: "1",
      profile: {
        ...snapshot,
        frameworkVersionId: input.frameworkPin?.frameworkVersionId ?? null,
        frameworkContentHash: input.frameworkPin?.contentHash ?? null,
        rubricResolveSource: input.rubricResolveSource ?? null,
      },
    })
    .select("id")
    .single();
  if (snapError) throw snapError;

  if (input.result.reviewQueue.length) {
    await supabase.from("pi_capability_reviews").insert(
      input.result.reviewQueue.map((item) => ({
        user_id: input.userId,
        score_run_id: scoreRunId,
        reason: item.reason,
        payload: item.payload,
        status: "open",
      })),
    );
  }

  await supabase.from("pi_domain_events").insert({
    event_type: "CapabilitySnapshotPublished",
    aggregate_type: "capability_snapshot",
    aggregate_id: snap.id,
    user_id: input.userId,
    payload: {
      score_run_id: scoreRunId,
      snapshot_id: snap.id,
      input_hash: input.result.inputHash,
      framework_version_id: input.frameworkPin?.frameworkVersionId ?? null,
      rubric_resolve_source: input.rubricResolveSource ?? null,
    },
    schema_version: 1,
  });

  return { scoreRunId, snapshotId: snap.id as string };
}
