import type { SupabaseClient } from "@supabase/supabase-js";

const LEASE_MS = 60_000;

/**
 * Idempotent processing worker step.
 * Creates versioned interpretations only — never mutates evidence body or competency scores.
 */
export async function processNextEvidenceJobs(
  supabase: SupabaseClient,
  options: { limit?: number; workerId?: string; userId?: string } = {},
) {
  const limit = options.limit ?? 5;
  const workerId = options.workerId ?? `worker-${process.pid}`;

  const query = supabase
    .from("pi_evidence_processing_jobs")
    .select("id, evidence_id, attempts, max_attempts, status")
    .in("status", ["pending", "failed"])
    .lte("next_attempt_at", new Date().toISOString())
    .order("next_attempt_at", { ascending: true })
    .limit(limit);

  // When running as end-user session, RLS already scopes; optional filter unused.

  const { data: jobs, error } = await query;
  if (error) throw error;
  if (!jobs?.length) return { processed: 0, results: [] as const };

  const results: Array<{
    jobId: string;
    evidenceId: string;
    ok: boolean;
    error?: string;
  }> = [];

  for (const job of jobs) {
    const leaseExpires = new Date(Date.now() + LEASE_MS).toISOString();
    const { data: leased, error: leaseError } = await supabase
      .from("pi_evidence_processing_jobs")
      .update({
        status: "leased",
        lease_owner: workerId,
        lease_expires_at: leaseExpires,
        attempts: (job.attempts ?? 0) + 1,
      })
      .eq("id", job.id)
      .in("status", ["pending", "failed"])
      .select("id, evidence_id, attempts, max_attempts")
      .maybeSingle();

    if (leaseError || !leased) {
      results.push({
        jobId: job.id as string,
        evidenceId: job.evidence_id as string,
        ok: false,
        error: "lease_failed",
      });
      continue;
    }

    try {
      await runPipeline(supabase, leased.evidence_id as string);
      await supabase
        .from("pi_evidence_processing_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          last_error: null,
          lease_owner: null,
          lease_expires_at: null,
        })
        .eq("id", leased.id);

      results.push({
        jobId: leased.id as string,
        evidenceId: leased.evidence_id as string,
        ok: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "processing_failed";
      const attempts = leased.attempts ?? 1;
      const max = leased.max_attempts ?? 5;
      const dead = attempts >= max;
      const backoffSec = Math.min(3600, 2 ** attempts * 15);

      await supabase
        .from("pi_evidence_processing_jobs")
        .update({
          status: dead ? "dead_letter" : "failed",
          last_error: message,
          next_attempt_at: new Date(Date.now() + backoffSec * 1000).toISOString(),
          lease_owner: null,
          lease_expires_at: null,
        })
        .eq("id", leased.id);

      results.push({
        jobId: leased.id as string,
        evidenceId: leased.evidence_id as string,
        ok: false,
        error: message,
      });
    }
  }

  return { processed: results.length, results };
}

async function runPipeline(supabase: SupabaseClient, evidenceId: string) {
  const { data: evidence, error } = await supabase
    .from("pi_evidence_records")
    .select("id, user_id, source_type, category, title, summary, raw_content")
    .eq("id", evidenceId)
    .single();
  if (error || !evidence) throw error ?? new Error("evidence_not_found");

  const classificationVersion = await nextInterpretationVersion(
    supabase,
    evidenceId,
    "classification",
  );

  const { data: classification, error: classError } = await supabase
    .from("pi_evidence_interpretations")
    .insert({
      evidence_id: evidenceId,
      version: classificationVersion,
      kind: "classification",
      payload: {
        source_type: evidence.source_type,
        category: evidence.category,
        heuristic: "v1_passthrough",
        // Deterministic stub — real LLM classify comes later; still versioned.
        labels: [evidence.source_type, evidence.category],
      },
      model_id: null,
      model_version: "heuristic-v1",
      prompt_slug: null,
      prompt_version: null,
    })
    .select("id")
    .single();
  if (classError) throw classError;

  const mapVersion = await nextInterpretationVersion(supabase, evidenceId, "competency_map");
  const competencyCode =
    typeof (evidence.raw_content as Record<string, unknown>)?.competency === "string"
      ? String((evidence.raw_content as Record<string, unknown>).competency)
      : "general_professional_judgement";

  const { data: mapInterp, error: mapError } = await supabase
    .from("pi_evidence_interpretations")
    .insert({
      evidence_id: evidenceId,
      version: mapVersion,
      kind: "competency_map",
      payload: {
        mappings: [{ competency_code: competencyCode, strength: 0.4 }],
        note: "Heuristic map only — does not update capability scores",
      },
      model_version: "heuristic-v1",
    })
    .select("id")
    .single();
  if (mapError) throw mapError;

  await supabase.from("pi_evidence_competency_links").insert({
    evidence_id: evidenceId,
    interpretation_id: mapInterp.id,
    competency_code: competencyCode,
    strength: 0.4,
    rationale: "heuristic_v1",
  });

  const judgeVersion = await nextInterpretationVersion(supabase, evidenceId, "judgement");
  await supabase.from("pi_evidence_interpretations").insert({
    evidence_id: evidenceId,
    version: judgeVersion,
    kind: "judgement",
    payload: {
      judgement: "recorded",
      verification_required: true,
      note: "Judgement stub; human/platform verification is a separate transition",
    },
    model_version: "heuristic-v1",
  });

  await supabase.from("pi_domain_events").insert([
    {
      event_type: "EvidenceClassified",
      aggregate_type: "evidence",
      aggregate_id: evidenceId,
      user_id: evidence.user_id,
      payload: {
        evidence_id: evidenceId,
        interpretation_id: classification.id,
        version: classificationVersion,
      },
      schema_version: 1,
    },
    {
      event_type: "EvidenceCompetenciesMapped",
      aggregate_type: "evidence",
      aggregate_id: evidenceId,
      user_id: evidence.user_id,
      payload: {
        evidence_id: evidenceId,
        interpretation_id: mapInterp.id,
        competency_codes: [competencyCode],
      },
      schema_version: 1,
    },
    {
      event_type: "ProjectionRecalculateRequested",
      aggregate_type: "user_profile",
      aggregate_id: evidence.user_id,
      user_id: evidence.user_id,
      payload: {
        user_id: evidence.user_id,
        reason: "evidence_processed",
        evidence_id: evidenceId,
      },
      schema_version: 1,
    },
  ]);
}

async function nextInterpretationVersion(
  supabase: SupabaseClient,
  evidenceId: string,
  kind: string,
) {
  const { data } = await supabase
    .from("pi_evidence_interpretations")
    .select("version")
    .eq("evidence_id", evidenceId)
    .eq("kind", kind)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  return ((data?.version as number) || 0) + 1;
}
