/**
 * Phase 4 — Coaching evidence workflow (types + pure guards).
 *
 * Trust rails (non-negotiable):
 * - A coaching submission becomes ledger evidence ONLY when a HUMAN coach/reviewer
 *   confirms it. AI may draft/assist but can NEVER confirm.
 * - Confirmation appends evidence at `supported` strength via the new
 *   `coach_confirmation` source. It is coach-attestation-adjacent — NOT external
 *   verification (T8) — and NEVER lights `deliverxVerified`.
 * - No capability writes. Coaching evidence is evidence, not capability.
 *
 * This module is pure (no DB). Persistence lives in `store.ts`.
 */

import { createHash } from "node:crypto";

/** Ledger source denoting human coach confirmation (added to pi_evidence_source_type in 0106). */
export const COACH_CONFIRMATION_SOURCE = "coach_confirmation" as const;

/** Coaching evidence is always appended at `supported` strength — never `platform_verified`. */
export const COACH_EVIDENCE_STATUS = "supported" as const;

/** Pilot framework pin for coaching exercises. */
export const COACHING_FRAMEWORK_PIN = "pm-core@2026.1" as const;

/** Honest copy: coach confirmation is not external verification. */
export const COACH_CONFIRMATION_IS_NOT_VERIFICATION =
  "Coach confirmation records supported evidence — it is not external verification and never lights the DeliverX Verified badge (which requires named third-party attestation, T8).";

export const COACHING_INTAKE_METHODS = ["text", "file", "link"] as const;
export type CoachingIntakeMethod = (typeof COACHING_INTAKE_METHODS)[number];

/**
 * Submission lifecycle.
 * `submitted → under_review → confirmed | rejected | changes_requested`.
 * Only `confirmed` appends ledger evidence. Resubmission creates a NEW submission
 * (new attempt / immutable artefact version); prior submissions are never rewritten.
 */
export const COACHING_SUBMISSION_STATUSES = [
  "submitted",
  "under_review",
  "confirmed",
  "rejected",
  "changes_requested",
  "withdrawn",
] as const;
export type CoachingSubmissionStatus = (typeof COACHING_SUBMISSION_STATUSES)[number];

/** Terminal states — no further transitions. */
export const COACHING_TERMINAL_STATUSES: readonly CoachingSubmissionStatus[] = [
  "confirmed",
  "rejected",
  "withdrawn",
] as const;

/** Coach decisions. Only `confirm` produces evidence. */
export const COACHING_REVIEW_DECISIONS = ["confirm", "reject", "request_changes"] as const;
export type CoachingReviewDecision = (typeof COACHING_REVIEW_DECISIONS)[number];

/** Actor performing a coaching review action. AI is never a valid confirming actor. */
export const COACHING_REVIEWER_ROLES = ["coach", "reviewer", "system"] as const;
export type CoachingReviewerRole = (typeof COACHING_REVIEWER_ROLES)[number];

export type CoachingProgrammeRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  framework_version_ref: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type CoachingExerciseRow = {
  id: string;
  programme_id: string;
  slug: string;
  title: string;
  instructions: string;
  artefact_kind: string;
  capability_ref: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type CoachingSubmissionRow = {
  id: string;
  user_id: string;
  programme_id: string;
  exercise_id: string;
  artefact_id: string;
  artefact_version_id: string;
  intake_method: CoachingIntakeMethod;
  content_hash: string;
  self_confidence: number | null;
  status: CoachingSubmissionStatus;
  attempt: number;
  evidence_id: string | null;
  reviewer_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CoachingSubmissionReviewRow = {
  id: string;
  submission_id: string;
  user_id: string;
  reviewer_id: string | null;
  reviewer_role: CoachingReviewerRole;
  decision: CoachingReviewDecision;
  from_status: CoachingSubmissionStatus;
  to_status: CoachingSubmissionStatus;
  rationale: string;
  ai_assisted: boolean;
  citations: unknown[];
  evidence_id: string | null;
  created_at: string;
};

export type CreateSubmissionInput = {
  userId: string;
  programmeId: string;
  exerciseId: string;
  intakeMethod: CoachingIntakeMethod;
  title: string;
  /** Learner's own words / link / file metadata. Stored as an immutable artefact version. */
  content: Record<string, unknown>;
  storageRef?: string | null;
  /** Self-reported confidence 1–5. Labelled a CLAIM, never evidence. */
  selfConfidence?: number | null;
  /**
   * Optional AI-assisted draft flag. When true, the artefact version records AI
   * contribution provenance. AI drafting never confirms evidence.
   */
  aiAssisted?: boolean;
  aiContribution?: Record<string, unknown>;
};

export type CoachDecisionInput = {
  submissionId: string;
  reviewerId: string;
  reviewerRole: CoachingReviewerRole;
  decision: CoachingReviewDecision;
  rationale: string;
  aiAssisted?: boolean;
  citations?: unknown;
};

export function isCoachingIntakeMethod(value: string): value is CoachingIntakeMethod {
  return (COACHING_INTAKE_METHODS as readonly string[]).includes(value);
}

export function isCoachingSubmissionStatus(value: string): value is CoachingSubmissionStatus {
  return (COACHING_SUBMISSION_STATUSES as readonly string[]).includes(value);
}

export function isCoachingReviewDecision(value: string): value is CoachingReviewDecision {
  return (COACHING_REVIEW_DECISIONS as readonly string[]).includes(value);
}

export function isCoachingTerminalStatus(status: CoachingSubmissionStatus): boolean {
  return (COACHING_TERMINAL_STATUSES as readonly string[]).includes(status);
}

/** Stable content hash for submission dedupe — sorted JSON of exercise + body + intake. */
export function computeSubmissionContentHash(input: {
  exerciseId: string;
  intakeMethod: string;
  title: string;
  content: Record<string, unknown>;
  storageRef?: string | null;
  attempt: number;
}): string {
  const canonical = JSON.stringify({
    exerciseId: input.exerciseId,
    intakeMethod: input.intakeMethod,
    title: input.title.trim(),
    storageRef: input.storageRef ?? null,
    attempt: input.attempt,
    content: sortKeys(input.content),
  });
  return createHash("sha256").update(canonical).digest("hex");
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      out[key] = sortKeys(obj[key]);
    }
    return out;
  }
  return value;
}

export const COACHING_SUBMISSION_STATUS_LABELS: Record<CoachingSubmissionStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  confirmed: "Confirmed",
  rejected: "Not confirmed",
  changes_requested: "Changes requested",
  withdrawn: "Withdrawn",
};

export const COACHING_REVIEW_DECISION_LABELS: Record<CoachingReviewDecision, string> = {
  confirm: "Confirm evidence",
  reject: "Do not confirm",
  request_changes: "Request changes",
};
