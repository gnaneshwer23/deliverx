import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrchestratorResult } from "@/lib/capability-engine/types";
import {
  ALGORITHM_VERSION,
  DEFAULT_MODEL_VERSION,
  DEFAULT_PROMPT_VERSION,
} from "@/lib/capability-engine/types";

export async function persistCapabilityRun(
  supabase: SupabaseClient,
  input: {
    userId: string;
    targetRole?: string;
    targetSeniority?: string;
    rubricSlug: string;
    rubricVersion: string;
    result: OrchestratorResult;
  },
) {
  if (!input.result.ok || !input.result.snapshot) {
    const { data: failed, error } = await supabase
      .from("pi_capability_score_runs")
      .insert({
        user_id: input.userId,
        rubric_slug: input.rubricSlug,
        rubric_version: input.rubricVersion,
        algorithm_version: ALGORITHM_VERSION,
        model_version: DEFAULT_MODEL_VERSION,
        prompt_version: DEFAULT_PROMPT_VERSION,
        target_role: input.targetRole ?? null,
        target_seniority: input.targetSeniority ?? null,
        input_evidence_ids: [],
        input_hash: input.result.inputHash || "none",
        status: "failed",
        result: { error: input.result.error, reviewQueue: input.result.reviewQueue },
        error_message: input.result.error ?? "failed",
      })
      .select("id")
      .single();
    if (error) throw error;
    return { scoreRunId: failed.id as string, snapshotId: null as string | null };
  }

  const snapshot = input.result.snapshot;
  const evidenceIds = [
    ...new Set(input.result.judgements.flatMap((j) => j.evidenceReferences)),
  ];

  const { data: run, error: runError } = await supabase
    .from("pi_capability_score_runs")
    .insert({
      user_id: input.userId,
      rubric_slug: input.rubricSlug,
      rubric_version: input.rubricVersion,
      algorithm_version: ALGORITHM_VERSION,
      model_version: snapshot.modelVersion,
      prompt_version: snapshot.promptVersion,
      target_role: input.targetRole ?? null,
      target_seniority: input.targetSeniority ?? null,
      input_evidence_ids: evidenceIds,
      input_hash: input.result.inputHash,
      status: input.result.reviewQueue.some((r) => r.reason === "judgement_pending_review")
        ? "needs_review"
        : "completed",
      result: {
        readiness: snapshot.readiness,
        dimensions: snapshot.dimensions,
        strengths: snapshot.strengths,
        gaps: snapshot.gaps,
        recommendations: snapshot.recommendations,
        growth: input.result.growth,
        stepsCompleted: input.result.stepsCompleted,
      },
    })
    .select("id")
    .single();
  if (runError) throw runError;

  const scoreRunId = run.id as string;

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
      profile: snapshot,
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
    },
    schema_version: 1,
  });

  return { scoreRunId, snapshotId: snap.id as string };
}
