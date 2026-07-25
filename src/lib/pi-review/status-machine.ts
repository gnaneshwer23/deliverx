/**
 * PI Review status machine.
 * Challenges always produce NEW event rows — never overwrite history.
 * Verified capability levels cannot change without evidence references.
 */

import {
  ADMIN_ACTIONS,
  USER_ACTIONS,
  type PiReviewAction,
  type PiReviewActorRole,
  type PiReviewStatus,
} from "@/lib/pi-review/types";

export type TransitionResult =
  | { ok: true; toStatus: PiReviewStatus }
  | { ok: false; error: string; code: TransitionErrorCode };

export type TransitionErrorCode =
  | "invalid_action"
  | "invalid_actor"
  | "invalid_transition"
  | "evidence_required"
  | "rationale_required"
  | "closed_case";

/** Action → next status when transition is allowed from current. */
const ACTION_TARGET: Record<PiReviewAction, PiReviewStatus> = {
  accept: "accepted",
  correct_factual: "user_context_added",
  add_context: "user_context_added",
  add_evidence: "additional_evidence_required",
  challenge_judgement: "challenged",
  request_reassessment: "challenged",
  hide_evidence: "user_context_added",
  change_visibility: "user_context_added",
  report_inappropriate: "escalated_to_human_review",
  start_review: "under_review",
  request_evidence: "additional_evidence_required",
  uphold: "upheld",
  revise: "revised",
  escalate: "escalated_to_human_review",
  mark_reassessed: "reassessed",
  reopen: "pending_review",
};

/** Allowed source statuses per action. */
const ALLOWED_FROM: Record<PiReviewAction, readonly PiReviewStatus[]> = {
  accept: ["pending_review", "user_context_added", "additional_evidence_required"],
  correct_factual: [
    "pending_review",
    "accepted",
    "user_context_added",
    "challenged",
    "additional_evidence_required",
    "upheld",
    "revised",
    "reassessed",
  ],
  add_context: [
    "pending_review",
    "accepted",
    "user_context_added",
    "challenged",
    "additional_evidence_required",
    "upheld",
    "revised",
    "reassessed",
  ],
  add_evidence: [
    "pending_review",
    "challenged",
    "under_review",
    "additional_evidence_required",
    "user_context_added",
    "upheld",
    "revised",
  ],
  challenge_judgement: [
    "pending_review",
    "accepted",
    "user_context_added",
    "upheld",
    "revised",
    "reassessed",
  ],
  request_reassessment: [
    "pending_review",
    "accepted",
    "user_context_added",
    "upheld",
    "revised",
    "reassessed",
    "additional_evidence_required",
  ],
  hide_evidence: ["pending_review", "accepted", "user_context_added"],
  change_visibility: ["pending_review", "accepted", "user_context_added"],
  report_inappropriate: [
    "pending_review",
    "accepted",
    "user_context_added",
    "challenged",
    "under_review",
    "additional_evidence_required",
    "upheld",
    "revised",
    "reassessed",
  ],
  start_review: [
    "challenged",
    "user_context_added",
    "additional_evidence_required",
    "escalated_to_human_review",
    "pending_review",
  ],
  request_evidence: ["under_review", "challenged", "escalated_to_human_review"],
  uphold: [
    "under_review",
    "challenged",
    "additional_evidence_required",
    "escalated_to_human_review",
  ],
  revise: [
    "under_review",
    "challenged",
    "additional_evidence_required",
    "escalated_to_human_review",
  ],
  escalate: [
    "under_review",
    "challenged",
    "additional_evidence_required",
    "user_context_added",
  ],
  mark_reassessed: ["revised", "additional_evidence_required", "under_review"],
  reopen: ["accepted", "upheld", "revised", "reassessed"],
};

export type TransitionContext = {
  fromStatus: PiReviewStatus;
  action: PiReviewAction;
  actorRole: PiReviewActorRole;
  rationale?: string;
  evidenceIds?: string[];
  /** When true, subject is a verified capability level / judgement. */
  touchesVerifiedCapability?: boolean;
  /** Proposed capability level change in revise payload. */
  proposesCapabilityLevelChange?: boolean;
};

/**
 * Resolve next status or a structured error.
 * Does not mutate any store — pure function.
 */
export function resolveTransition(ctx: TransitionContext): TransitionResult {
  const { fromStatus, action, actorRole } = ctx;

  if (USER_ACTIONS.includes(action) && actorRole !== "subject_user" && actorRole !== "system") {
    return { ok: false, error: "User actions require subject_user actor", code: "invalid_actor" };
  }
  if (ADMIN_ACTIONS.includes(action) && actorRole !== "admin_reviewer" && actorRole !== "system") {
    return { ok: false, error: "Admin actions require admin_reviewer actor", code: "invalid_actor" };
  }

  const allowed = ALLOWED_FROM[action];
  if (!allowed?.includes(fromStatus)) {
    return {
      ok: false,
      error: `Action ${action} not allowed from status ${fromStatus}`,
      code: "invalid_transition",
    };
  }

  // Challenges / judgements need a rationale
  if (
    (action === "challenge_judgement" ||
      action === "request_reassessment" ||
      action === "report_inappropriate" ||
      action === "revise" ||
      action === "uphold" ||
      action === "escalate") &&
    !(ctx.rationale && ctx.rationale.trim().length >= 8)
  ) {
    return {
      ok: false,
      error: "Rationale of at least 8 characters is required",
      code: "rationale_required",
    };
  }

  // Hard rule: cannot change verified capability without evidence
  if (
    (ctx.touchesVerifiedCapability || ctx.proposesCapabilityLevelChange) &&
    (action === "revise" || action === "correct_factual") &&
    ctx.proposesCapabilityLevelChange
  ) {
    const ids = ctx.evidenceIds ?? [];
    if (ids.length === 0) {
      return {
        ok: false,
        error:
          "Cannot change verified capability level without evidence. Attach evidence_ids or request reassessment.",
        code: "evidence_required",
      };
    }
  }

  if (action === "add_evidence") {
    const ids = ctx.evidenceIds ?? [];
    if (ids.length === 0) {
      return {
        ok: false,
        error: "add_evidence requires at least one evidence_id",
        code: "evidence_required",
      };
    }
  }

  return { ok: true, toStatus: ACTION_TARGET[action] };
}

/** List actions available to an actor from a given status. */
export function availableActions(
  fromStatus: PiReviewStatus,
  actorRole: PiReviewActorRole,
): PiReviewAction[] {
  const pool = actorRole === "admin_reviewer" ? ADMIN_ACTIONS : USER_ACTIONS;
  return pool.filter((action) => {
    const result = resolveTransition({
      fromStatus,
      action,
      actorRole,
      rationale: "placeholder rationale for availability check",
      evidenceIds: action === "add_evidence" ? ["00000000-0000-0000-0000-000000000001"] : [],
    });
    return result.ok;
  });
}

/**
 * Guard used by APIs: proposedRevision must not silently rewrite capability.
 * Returns error message or null.
 */
export function guardCapabilityRewrite(input: {
  action: PiReviewAction;
  proposedRevision?: Record<string, unknown>;
  evidenceIds?: string[];
  subjectKind?: string;
}): string | null {
  const rev = input.proposedRevision ?? {};
  const levelKeys = ["level", "levelProposed", "capability_level", "verified_level"];
  const proposesLevel = levelKeys.some((k) => rev[k] !== undefined && rev[k] !== null);
  const touchesCapability =
    input.subjectKind === "capability_level" ||
    input.subjectKind === "competency_mapping" ||
    input.subjectKind === "assessment_finding";

  if (!proposesLevel) return null;

  if (input.action !== "revise" && input.action !== "correct_factual" && input.action !== "mark_reassessed") {
    return "Capability level changes are only allowed via revise / reassessment with evidence";
  }

  if ((touchesCapability || proposesLevel) && !(input.evidenceIds && input.evidenceIds.length > 0)) {
    return "Cannot change verified capability level without evidence";
  }

  return null;
}
