import type { SupabaseClient } from "@supabase/supabase-js";
import {
  computeEvidenceContentHash,
  initialStatusFromCapture,
  type AppendEvidenceInput,
  type PiEvidenceStatus,
} from "@/lib/evidence-ledger/types";
import { assertEvidenceCitesArtefactVersion } from "@/lib/artefacts/types";

export type AppendEvidenceResult = {
  evidenceId: string;
  duplicate: boolean;
  contentHash: string;
  jobId: string | null;
  status: PiEvidenceStatus;
};

export async function appendEvidence(
  supabase: SupabaseClient,
  input: AppendEvidenceInput,
): Promise<AppendEvidenceResult> {
  // T3: evidence citing an artefact must reference a specific immutable version.
  assertEvidenceCitesArtefactVersion({
    artefactId: input.provenance.artefactId,
    artefactVersionId: input.provenance.artefactVersionId,
  });

  const contentHash = computeEvidenceContentHash({
    sourceType: input.sourceType,
    title: input.title,
    rawContent: input.rawContent,
    storageRef: input.storageRef,
  });

  if (input.idempotencyKey) {
    const { data: byKey } = await supabase
      .from("pi_evidence_records")
      .select("id")
      .eq("user_id", input.userId)
      .eq("idempotency_key", input.idempotencyKey)
      .maybeSingle();
    if (byKey?.id) {
      const status = await latestStatus(supabase, byKey.id as string);
      return {
        evidenceId: byKey.id as string,
        duplicate: true,
        contentHash,
        jobId: null,
        status,
      };
    }
  }

  const { data: byHash } = await supabase
    .from("pi_evidence_records")
    .select("id")
    .eq("user_id", input.userId)
    .eq("content_hash", contentHash)
    .maybeSingle();

  if (byHash?.id) {
    const status = await latestStatus(supabase, byHash.id as string);
    return {
      evidenceId: byHash.id as string,
      duplicate: true,
      contentHash,
      jobId: null,
      status,
    };
  }

  const initialStatus =
    input.initialStatus ?? initialStatusFromCapture(input.sourceType);

  const { data: record, error: recordError } = await supabase
    .from("pi_evidence_records")
    .insert({
      user_id: input.userId,
      source_type: input.sourceType,
      source_record_type: input.sourceRecordType ?? null,
      source_record_id: input.sourceRecordId ?? null,
      category: input.category,
      title: input.title.trim(),
      summary: input.summary?.trim() ?? "",
      raw_content: input.rawContent,
      storage_ref: input.storageRef ?? null,
      content_hash: contentHash,
      idempotency_key: input.idempotencyKey ?? null,
      confidentiality: input.confidentiality ?? "private",
      consent_status: input.consentStatus ?? "unknown",
    })
    .select("id")
    .single();

  if (recordError) {
    // Race on unique hash — treat as idempotent
    if (recordError.code === "23505") {
      const { data: raced } = await supabase
        .from("pi_evidence_records")
        .select("id")
        .eq("user_id", input.userId)
        .eq("content_hash", contentHash)
        .maybeSingle();
      if (raced?.id) {
        const status = await latestStatus(supabase, raced.id as string);
        return {
          evidenceId: raced.id as string,
          duplicate: true,
          contentHash,
          jobId: null,
          status,
        };
      }
    }
    throw recordError;
  }

  const evidenceId = record.id as string;

  const { error: provenanceError } = await supabase.from("pi_evidence_provenance").insert({
    evidence_id: evidenceId,
    actor_type: input.provenance.actorType,
    actor_user_id: input.provenance.actorUserId ?? input.userId,
    user_contribution: input.provenance.userContribution ?? {},
    ai_contribution: input.provenance.aiContribution ?? {},
    model_id: input.provenance.modelId ?? null,
    model_version: input.provenance.modelVersion ?? null,
    prompt_slug: input.provenance.promptSlug ?? null,
    prompt_version: input.provenance.promptVersion ?? null,
    prompt_hash: input.provenance.promptHash ?? null,
    raw_ref: input.provenance.rawRef ?? {},
    artefact_id: input.provenance.artefactId ?? null,
    artefact_version_id: input.provenance.artefactVersionId ?? null,
  });
  if (provenanceError) throw provenanceError;

  const { error: transitionError } = await supabase
    .from("pi_evidence_status_transitions")
    .insert({
      evidence_id: evidenceId,
      from_status: null,
      to_status: initialStatus,
      reason: "initial_capture",
      actor_type: "system",
      actor_user_id: input.userId,
    });
  if (transitionError) throw transitionError;

  const { data: job, error: jobError } = await supabase
    .from("pi_evidence_processing_jobs")
    .insert({
      evidence_id: evidenceId,
      status: "pending",
    })
    .select("id")
    .single();
  if (jobError) throw jobError;

  const { error: eventError } = await supabase.from("pi_domain_events").insert([
    {
      event_type: "EvidenceAppended",
      aggregate_type: "evidence",
      aggregate_id: evidenceId,
      user_id: input.userId,
      payload: {
        evidence_id: evidenceId,
        user_id: input.userId,
        source_type: input.sourceType,
        category: input.category,
        content_hash: contentHash,
        initial_status: initialStatus,
      },
      schema_version: 1,
    },
    {
      event_type: "EvidenceProcessingQueued",
      aggregate_type: "evidence_job",
      aggregate_id: job.id,
      user_id: input.userId,
      payload: {
        job_id: job.id,
        evidence_id: evidenceId,
        attempt: 0,
      },
      schema_version: 1,
    },
  ]);
  if (eventError) throw eventError;

  return {
    evidenceId,
    duplicate: false,
    contentHash,
    jobId: job.id as string,
    status: initialStatus,
  };
}

export async function latestStatus(
  supabase: SupabaseClient,
  evidenceId: string,
): Promise<PiEvidenceStatus> {
  const { data } = await supabase
    .from("pi_evidence_status_transitions")
    .select("to_status")
    .eq("evidence_id", evidenceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.to_status as PiEvidenceStatus) || "observed";
}

export async function appendStatusTransition(
  supabase: SupabaseClient,
  input: {
    evidenceId: string;
    userId: string;
    toStatus: PiEvidenceStatus;
    reason?: string;
    actorType?: AppendEvidenceInput["provenance"]["actorType"];
  },
) {
  const from = await latestStatus(supabase, input.evidenceId);
  if (from === input.toStatus) {
    return { transitionId: null as string | null, from, to: from, noop: true };
  }

  const { data, error } = await supabase
    .from("pi_evidence_status_transitions")
    .insert({
      evidence_id: input.evidenceId,
      from_status: from,
      to_status: input.toStatus,
      reason: input.reason ?? null,
      actor_type: input.actorType ?? "user",
      actor_user_id: input.userId,
    })
    .select("id")
    .single();
  if (error) throw error;

  await supabase.from("pi_domain_events").insert({
    event_type: "EvidenceStatusChanged",
    aggregate_type: "evidence",
    aggregate_id: input.evidenceId,
    user_id: input.userId,
    payload: {
      evidence_id: input.evidenceId,
      from,
      to: input.toStatus,
      transition_id: data.id,
      actor_id: input.userId,
    },
    schema_version: 1,
  });

  return {
    transitionId: data.id as string,
    from,
    to: input.toStatus,
    noop: false,
  };
}
