/**
 * Phase 4 — Coaching evidence persistence + actions.
 *
 * Reuses existing rails:
 * - `artefacts` (immutable versioned submission; resubmission = new version).
 * - `evidence-ledger` append (confirmation appends ONE `supported` record via the
 *   `coach_confirmation` source, citing the artefact version, with human provenance).
 *
 * The learner path is self-only. The coach path runs through a service-role client
 * behind an app-level coach/reviewer gate (mirrors the B4 admin queue + T8 attestor
 * pattern) and is the ONLY path that appends evidence.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { appendEvidence } from "@/lib/evidence-ledger/append";
import { createArtefact } from "@/lib/artefacts/store";
import { isArtefactKind, type ArtefactKind } from "@/lib/artefacts/types";
import {
  resolveCoachDecision,
  canClaimForReview,
} from "@/lib/coaching-evidence/state-machine";
import {
  assertCoachEvidenceShape,
  guardAiAssistedCoachingCitations,
  guardCoachingTrustRails,
  guardHumanConfirmer,
} from "@/lib/coaching-evidence/trust-guards";
import {
  COACH_CONFIRMATION_SOURCE,
  COACH_EVIDENCE_STATUS,
  computeSubmissionContentHash,
  type CoachDecisionInput,
  type CoachingExerciseRow,
  type CoachingProgrammeRow,
  type CoachingSubmissionRow,
  type CoachingSubmissionReviewRow,
  type CreateSubmissionInput,
} from "@/lib/coaching-evidence/types";

export type ServiceResult<T> = { data: T | null; error: string | null };

const COACHING_EVENT = {
  submissionCreated: "coaching.submission.created",
  submissionDecided: "coaching.submission.decided",
} as const;

async function emitEvent(
  supabase: SupabaseClient,
  input: { eventType: string; aggregateId: string; userId: string; payload: Record<string, unknown> },
): Promise<void> {
  try {
    await supabase.from("pi_domain_events").insert({
      event_type: input.eventType,
      aggregate_type: "coaching_submission",
      aggregate_id: input.aggregateId,
      user_id: input.userId,
      payload: input.payload,
      schema_version: 1,
    });
  } catch {
    // Outbox emission is best-effort; never blocks the trust-critical path.
  }
}

// ---------------------------------------------------------------------------
// Catalogue (programmes + exercises)
// ---------------------------------------------------------------------------

export type ProgrammeWithExercises = CoachingProgrammeRow & {
  exercises: CoachingExerciseRow[];
};

export async function listProgrammesWithExercises(
  supabase: SupabaseClient,
  opts: { enabledOnly?: boolean } = { enabledOnly: true },
): Promise<ServiceResult<ProgrammeWithExercises[]>> {
  let programmeQuery = supabase
    .from("coaching_programmes")
    .select("*")
    .order("created_at", { ascending: true });
  if (opts.enabledOnly) programmeQuery = programmeQuery.eq("enabled", true);

  const { data: programmes, error: programmeError } = await programmeQuery;
  if (programmeError) return { data: null, error: programmeError.message };

  const rows = (programmes ?? []) as CoachingProgrammeRow[];
  const out: ProgrammeWithExercises[] = [];
  for (const programme of rows) {
    let exerciseQuery = supabase
      .from("coaching_exercises")
      .select("*")
      .eq("programme_id", programme.id)
      .order("created_at", { ascending: true });
    if (opts.enabledOnly) exerciseQuery = exerciseQuery.eq("enabled", true);
    const { data: exercises, error: exerciseError } = await exerciseQuery;
    if (exerciseError) return { data: null, error: exerciseError.message };
    out.push({ ...programme, exercises: (exercises ?? []) as CoachingExerciseRow[] });
  }
  return { data: out, error: null };
}

async function getExerciseWithProgramme(
  supabase: SupabaseClient,
  exerciseId: string,
): Promise<{ exercise: CoachingExerciseRow; programme: CoachingProgrammeRow } | null> {
  const { data: exercise } = await supabase
    .from("coaching_exercises")
    .select("*")
    .eq("id", exerciseId)
    .maybeSingle();
  if (!exercise) return null;
  const { data: programme } = await supabase
    .from("coaching_programmes")
    .select("*")
    .eq("id", (exercise as CoachingExerciseRow).programme_id)
    .maybeSingle();
  if (!programme) return null;
  return {
    exercise: exercise as CoachingExerciseRow,
    programme: programme as CoachingProgrammeRow,
  };
}

// ---------------------------------------------------------------------------
// Learner submissions (self-only)
// ---------------------------------------------------------------------------

export type CreateSubmissionResult = {
  submission: CoachingSubmissionRow;
  artefactId: string;
  artefactVersionId: string;
  /** Always false — submitting never produces evidence. */
  evidenceAppended: false;
};

export async function createSubmission(
  supabase: SupabaseClient,
  input: CreateSubmissionInput,
): Promise<ServiceResult<CreateSubmissionResult>> {
  const context = await getExerciseWithProgramme(supabase, input.exerciseId);
  if (!context) return { data: null, error: "Exercise not found" };
  const { exercise, programme } = context;

  if (!programme.enabled) {
    return { data: null, error: "This coaching programme is not enabled." };
  }
  if (!exercise.enabled) {
    return { data: null, error: "This coaching exercise is not enabled." };
  }
  if (programme.id !== input.programmeId) {
    return { data: null, error: "Exercise does not belong to the given programme." };
  }
  if (input.selfConfidence != null && (input.selfConfidence < 1 || input.selfConfidence > 5)) {
    return { data: null, error: "Self-confidence must be between 1 and 5." };
  }

  // Attempt number = count of prior submissions for this exercise by this learner + 1.
  const { data: priorRows } = await supabase
    .from("coaching_submissions")
    .select("id")
    .eq("user_id", input.userId)
    .eq("exercise_id", input.exerciseId);
  const attempt = (Array.isArray(priorRows) ? priorRows.length : 0) + 1;

  const kind: ArtefactKind = isArtefactKind(exercise.artefact_kind)
    ? (exercise.artefact_kind as ArtefactKind)
    : "work_sample";

  // Immutable artefact version captures exactly what was submitted. Honest
  // provenance: AI-assisted drafts record AI contribution, never silently the user.
  const artefactResult = await createArtefact(supabase, {
    userId: input.userId,
    kind,
    title: input.title,
    summary: exercise.title,
    confidentiality: "private",
    sourceSurface: "workspace",
    metadata: {
      coaching_programme_id: programme.id,
      coaching_exercise_id: exercise.id,
      attempt,
    },
    initialVersion: {
      title: input.title,
      content: input.content,
      storageRef: input.storageRef ?? null,
      changeNote: `Coaching submission attempt ${attempt}`,
      provenance: {
        actorType: input.aiAssisted ? "ai" : "user",
        userContribution: { intake_method: input.intakeMethod, self_confidence: input.selfConfidence ?? null },
        aiContribution: input.aiAssisted ? (input.aiContribution ?? { assisted: true }) : {},
      },
    },
  });

  if (!artefactResult.version) {
    return { data: null, error: "Could not capture submission version." };
  }

  const contentHash = computeSubmissionContentHash({
    exerciseId: exercise.id,
    intakeMethod: input.intakeMethod,
    title: input.title,
    content: input.content,
    storageRef: input.storageRef ?? null,
    attempt,
  });

  const { data: submission, error: submissionError } = await supabase
    .from("coaching_submissions")
    .insert({
      user_id: input.userId,
      programme_id: programme.id,
      exercise_id: exercise.id,
      artefact_id: artefactResult.artefact.id,
      artefact_version_id: artefactResult.version.id,
      intake_method: input.intakeMethod,
      content_hash: contentHash,
      self_confidence: input.selfConfidence ?? null,
      status: "submitted",
      attempt,
    })
    .select("*")
    .single();

  if (submissionError) return { data: null, error: submissionError.message };

  const row = submission as CoachingSubmissionRow;
  await emitEvent(supabase, {
    eventType: COACHING_EVENT.submissionCreated,
    aggregateId: row.id,
    userId: input.userId,
    payload: {
      submission_id: row.id,
      exercise_id: exercise.id,
      artefact_version_id: artefactResult.version.id,
      attempt,
    },
  });

  return {
    data: {
      submission: row,
      artefactId: artefactResult.artefact.id,
      artefactVersionId: artefactResult.version.id,
      evidenceAppended: false,
    },
    error: null,
  };
}

export async function listSubmissions(
  supabase: SupabaseClient,
  userId: string,
): Promise<ServiceResult<CoachingSubmissionRow[]>> {
  const { data, error } = await supabase
    .from("coaching_submissions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as CoachingSubmissionRow[], error: null };
}

export async function getSubmission(
  supabase: SupabaseClient,
  submissionId: string,
  userId?: string,
): Promise<ServiceResult<CoachingSubmissionRow>> {
  let q = supabase.from("coaching_submissions").select("*").eq("id", submissionId);
  if (userId) q = q.eq("user_id", userId);
  const { data, error } = await q.maybeSingle();
  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: "Submission not found" };
  return { data: data as CoachingSubmissionRow, error: null };
}

export async function listSubmissionReviews(
  supabase: SupabaseClient,
  submissionId: string,
): Promise<ServiceResult<CoachingSubmissionReviewRow[]>> {
  const { data, error } = await supabase
    .from("coaching_submission_reviews")
    .select("*")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as CoachingSubmissionReviewRow[], error: null };
}

// ---------------------------------------------------------------------------
// Coach queue + decisions (service-role behind app-level coach gate)
// ---------------------------------------------------------------------------

export async function listCoachQueue(
  admin: SupabaseClient,
  opts: { limit?: number } = {},
): Promise<ServiceResult<CoachingSubmissionRow[]>> {
  const { data, error } = await admin
    .from("coaching_submissions")
    .select("*")
    .in("status", ["submitted", "under_review", "changes_requested"])
    .order("created_at", { ascending: true })
    .limit(opts.limit ?? 200);
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as CoachingSubmissionRow[], error: null };
}

export async function claimForReview(
  admin: SupabaseClient,
  submissionId: string,
  reviewerId: string,
): Promise<ServiceResult<CoachingSubmissionRow>> {
  const current = await getSubmission(admin, submissionId);
  if (current.error || !current.data) {
    return { data: null, error: current.error ?? "Submission not found" };
  }
  if (!canClaimForReview(current.data.status)) {
    return { data: current.data, error: null };
  }
  const { data, error } = await admin
    .from("coaching_submissions")
    .update({ status: "under_review", reviewer_id: reviewerId })
    .eq("id", submissionId)
    .select("*")
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as CoachingSubmissionRow, error: null };
}

export type CoachDecisionResult = {
  submission: CoachingSubmissionRow;
  review: CoachingSubmissionReviewRow;
  evidenceId: string | null;
  /** Trust-rail proofs surfaced to callers/tests. */
  deliverxVerified: false;
  capabilityWritten: false;
  evidenceStrength: typeof COACH_EVIDENCE_STATUS | null;
};

/**
 * The single human-confirmation entry point. Only `confirm` appends evidence,
 * and it appends EXACTLY ONE `supported` record via `coach_confirmation`, citing
 * the immutable artefact version, with the confirming coach as provenance actor.
 * Reject / request_changes append no evidence.
 */
export async function decideSubmission(
  admin: SupabaseClient,
  input: CoachDecisionInput,
): Promise<ServiceResult<CoachDecisionResult>> {
  const current = await getSubmission(admin, input.submissionId);
  if (current.error || !current.data) {
    return { data: null, error: current.error ?? "Submission not found" };
  }
  const submission = current.data;

  // Trust-rail fences BEFORE any state change.
  const humanGuard = guardHumanConfirmer({
    reviewerRole: input.reviewerRole,
    reviewerId: input.reviewerId,
    learnerUserId: submission.user_id,
  });
  if (humanGuard) return { data: null, error: humanGuard };

  const trustGuard = guardCoachingTrustRails(
    (input as unknown as { proposedRevision?: Record<string, unknown> }).proposedRevision,
    (input as unknown as { audit?: Record<string, unknown> }).audit,
  );
  if (trustGuard) return { data: null, error: trustGuard };

  const citationGuard = guardAiAssistedCoachingCitations({
    aiAssisted: input.aiAssisted,
    citations: input.citations,
  });
  if (citationGuard) return { data: null, error: citationGuard };

  const transition = resolveCoachDecision({
    fromStatus: submission.status,
    decision: input.decision,
    reviewerRole: input.reviewerRole,
    rationale: input.rationale,
  });
  if (!transition.ok) return { data: null, error: transition.error };

  let evidenceId: string | null = submission.evidence_id ?? null;
  let evidenceStrength: typeof COACH_EVIDENCE_STATUS | null = null;

  if (transition.appendsEvidence) {
    // Defensive: prove the shape we are about to append is supported/coach_confirmation.
    assertCoachEvidenceShape({
      sourceType: COACH_CONFIRMATION_SOURCE,
      initialStatus: COACH_EVIDENCE_STATUS,
    });

    const append = await appendEvidence(admin, {
      userId: submission.user_id,
      sourceType: COACH_CONFIRMATION_SOURCE,
      category: "practice",
      title: "Coach-confirmed coaching submission",
      summary: input.rationale.slice(0, 400),
      rawContent: {
        submission_id: submission.id,
        exercise_id: submission.exercise_id,
        programme_id: submission.programme_id,
        attempt: submission.attempt,
        decision: "confirm",
        note: "Coach confirmation — supported evidence, not external verification.",
      },
      sourceRecordType: "coaching_submission",
      sourceRecordId: submission.id,
      confidentiality: "private",
      consentStatus: "unknown",
      idempotencyKey: `coaching:${submission.id}`,
      // Non-negotiable: supported strength, never platform_verified.
      initialStatus: COACH_EVIDENCE_STATUS,
      provenance: {
        // Human coach/reviewer confirmation (admin_attestor human actor).
        actorType: "admin_attestor",
        actorUserId: input.reviewerId,
        userContribution: {
          confirmed_by: input.reviewerId,
          reviewer_role: input.reviewerRole,
          rationale: input.rationale,
        },
        aiContribution: input.aiAssisted ? { assisted: true, citations: input.citations ?? [] } : {},
        rawRef: { submission_id: submission.id },
        // Evidence cites the specific immutable artefact version.
        artefactId: submission.artefact_id,
        artefactVersionId: submission.artefact_version_id,
      },
    });
    evidenceId = append.evidenceId;
    evidenceStrength = COACH_EVIDENCE_STATUS;
  }

  const { data: review, error: reviewError } = await admin
    .from("coaching_submission_reviews")
    .insert({
      submission_id: submission.id,
      user_id: submission.user_id,
      reviewer_id: input.reviewerId,
      reviewer_role: input.reviewerRole,
      decision: input.decision,
      from_status: submission.status,
      to_status: transition.toStatus,
      rationale: input.rationale.trim(),
      ai_assisted: Boolean(input.aiAssisted),
      citations: input.aiAssisted ? (input.citations ?? []) : [],
      evidence_id: evidenceId,
    })
    .select("*")
    .single();
  if (reviewError) return { data: null, error: reviewError.message };

  const { data: updated, error: updateError } = await admin
    .from("coaching_submissions")
    .update({
      status: transition.toStatus,
      reviewer_id: input.reviewerId,
      reviewed_at: new Date().toISOString(),
      evidence_id: evidenceId,
    })
    .eq("id", submission.id)
    .select("*")
    .single();
  if (updateError) return { data: null, error: updateError.message };

  await emitEvent(admin, {
    eventType: COACHING_EVENT.submissionDecided,
    aggregateId: submission.id,
    userId: submission.user_id,
    payload: {
      submission_id: submission.id,
      decision: input.decision,
      to_status: transition.toStatus,
      evidence_id: evidenceId,
      evidence_strength: evidenceStrength,
      deliverx_verified: false,
      capability_written: false,
    },
  });

  return {
    data: {
      submission: updated as CoachingSubmissionRow,
      review: review as CoachingSubmissionReviewRow,
      evidenceId,
      deliverxVerified: false,
      capabilityWritten: false,
      evidenceStrength,
    },
    error: null,
  };
}
