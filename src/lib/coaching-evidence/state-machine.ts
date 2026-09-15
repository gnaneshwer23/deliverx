/**
 * Phase 4 — Coaching submission state machine (pure).
 *
 * Only a human coach/reviewer can move a submission to a terminal decision.
 * `confirm` is the ONLY transition that appends ledger evidence; the state
 * machine itself never writes anything.
 */

import {
  isCoachingTerminalStatus,
  type CoachingReviewDecision,
  type CoachingReviewerRole,
  type CoachingSubmissionStatus,
} from "@/lib/coaching-evidence/types";

export type SubmissionTransitionResult =
  | { ok: true; toStatus: CoachingSubmissionStatus; appendsEvidence: boolean }
  | { ok: false; error: string; code: SubmissionTransitionErrorCode };

export type SubmissionTransitionErrorCode =
  | "invalid_decision"
  | "invalid_actor"
  | "invalid_transition"
  | "rationale_required"
  | "terminal_state"
  | "ai_cannot_confirm";

/** Coach decision → resulting submission status. */
const DECISION_TARGET: Record<CoachingReviewDecision, CoachingSubmissionStatus> = {
  confirm: "confirmed",
  reject: "rejected",
  request_changes: "changes_requested",
};

/** A coach decision may act on a submission that is still open for review. */
const REVIEWABLE_FROM: readonly CoachingSubmissionStatus[] = [
  "submitted",
  "under_review",
  "changes_requested",
];

/**
 * Resolve a coach decision into a next status.
 *
 * Enforces:
 * - Only human `coach`/`reviewer` (or `system` for internal orchestration that is
 *   itself gated) may decide — the "AI cannot confirm" rail lives here and in
 *   trust-guards.
 * - Rationale is mandatory for every decision (transparency / append-only audit).
 * - Terminal submissions cannot be re-decided.
 */
export function resolveCoachDecision(input: {
  fromStatus: CoachingSubmissionStatus;
  decision: CoachingReviewDecision;
  reviewerRole: CoachingReviewerRole;
  rationale?: string;
}): SubmissionTransitionResult {
  const { fromStatus, decision, reviewerRole } = input;

  if (!(decision in DECISION_TARGET)) {
    return { ok: false, error: `Unknown decision ${decision}`, code: "invalid_decision" };
  }

  // AI is never a valid coaching reviewer actor. The type system disallows "ai",
  // but we defend against untyped callers explicitly.
  if ((reviewerRole as string) === "ai") {
    return {
      ok: false,
      error: "AI cannot confirm coaching evidence. Only a human coach or reviewer may decide.",
      code: "ai_cannot_confirm",
    };
  }
  if (reviewerRole !== "coach" && reviewerRole !== "reviewer" && reviewerRole !== "system") {
    return {
      ok: false,
      error: "Coaching decisions require a coach or reviewer actor.",
      code: "invalid_actor",
    };
  }

  if (isCoachingTerminalStatus(fromStatus)) {
    return {
      ok: false,
      error: `Submission is ${fromStatus} and cannot be re-decided.`,
      code: "terminal_state",
    };
  }

  if (!REVIEWABLE_FROM.includes(fromStatus)) {
    return {
      ok: false,
      error: `Decision ${decision} is not allowed from status ${fromStatus}.`,
      code: "invalid_transition",
    };
  }

  if (!(input.rationale && input.rationale.trim().length >= 8)) {
    return {
      ok: false,
      error: "A rationale of at least 8 characters is required for every coaching decision.",
      code: "rationale_required",
    };
  }

  const toStatus = DECISION_TARGET[decision];
  return { ok: true, toStatus, appendsEvidence: decision === "confirm" };
}

/** A coach may claim a submission for review (submitted → under_review). Idempotent no-op otherwise. */
export function canClaimForReview(fromStatus: CoachingSubmissionStatus): boolean {
  return fromStatus === "submitted";
}

/** True when a submission is open and awaiting a coach decision. */
export function isOpenForReview(status: CoachingSubmissionStatus): boolean {
  return REVIEWABLE_FROM.includes(status);
}
