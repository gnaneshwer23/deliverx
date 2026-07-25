/**
 * PI Review case + event persistence.
 * Challenge / accept / context always APPEND events — never rewrite history.
 * Capability levels are never mutated here.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isClosedStatus,
  type CreateReviewCaseInput,
  type PiReviewStatus,
  type ReviewCaseRow,
  type ReviewEventRow,
  type TransitionInput,
} from "@/lib/pi-review/types";
import {
  guardCapabilityRewrite,
  resolveTransition,
} from "@/lib/pi-review/status-machine";
import {
  createReviewNotification,
  notifyReviewTransition,
} from "@/lib/pi-review/notifications";

export type ServiceResult<T> = { data: T | null; error: string | null };

function slaHoursForPriority(priority: string): number {
  switch (priority) {
    case "urgent":
      return 24;
    case "high":
      return 72;
    case "low":
      return 336;
    default:
      return 120;
  }
}

export async function createReviewCase(
  supabase: SupabaseClient,
  input: CreateReviewCaseInput,
): Promise<ServiceResult<ReviewCaseRow>> {
  const priority = input.priority ?? "normal";
  const slaDueAt =
    input.slaDueAt ??
    new Date(Date.now() + slaHoursForPriority(priority) * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("pi_review_cases")
    .insert({
      user_id: input.userId,
      subject_kind: input.subjectKind,
      subject_ref_type: input.subjectRefType,
      subject_ref_id: input.subjectRefId,
      subject_label: input.subjectLabel.trim(),
      subject_snapshot: input.subjectSnapshot ?? {},
      current_status: "pending_review" satisfies PiReviewStatus,
      priority,
      sla_due_at: slaDueAt,
    })
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };

  const row = data as ReviewCaseRow;

  await createReviewNotification(supabase, {
    userId: input.userId,
    caseId: row.id,
    kind: "review.case_opened",
    title: "Finding ready for review",
    body: row.subject_label || "A professional intelligence finding is pending your review.",
    payload: {
      subject_kind: input.subjectKind,
      subject_ref_type: input.subjectRefType,
      subject_ref_id: input.subjectRefId,
    },
    queueEmail: false,
  });

  return { data: row, error: null };
}

export async function getReviewCase(
  supabase: SupabaseClient,
  caseId: string,
  userId?: string,
): Promise<ServiceResult<ReviewCaseRow>> {
  let q = supabase.from("pi_review_cases").select("*").eq("id", caseId);
  if (userId) q = q.eq("user_id", userId);
  const { data, error } = await q.maybeSingle();
  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: "Case not found" };
  return { data: data as ReviewCaseRow, error: null };
}

export async function listReviewCases(
  supabase: SupabaseClient,
  opts: {
    userId?: string;
    status?: PiReviewStatus | PiReviewStatus[];
    limit?: number;
    openOnly?: boolean;
  },
): Promise<ServiceResult<ReviewCaseRow[]>> {
  let q = supabase
    .from("pi_review_cases")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 100);

  if (opts.userId) q = q.eq("user_id", opts.userId);
  if (opts.openOnly) q = q.is("closed_at", null);
  if (opts.status) {
    if (Array.isArray(opts.status)) q = q.in("current_status", opts.status);
    else q = q.eq("current_status", opts.status);
  }

  const { data, error } = await q;
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as ReviewCaseRow[], error: null };
}

export async function listReviewEvents(
  supabase: SupabaseClient,
  caseId: string,
): Promise<ServiceResult<ReviewEventRow[]>> {
  const { data, error } = await supabase
    .from("pi_review_events")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as ReviewEventRow[], error: null };
}

/**
 * Apply a user/admin action: append event + update projected case status.
 * Never mutates capability / portfolio / evidence body tables.
 */
export async function applyReviewAction(
  supabase: SupabaseClient,
  input: TransitionInput & { caseUserId?: string; subjectKind?: string },
): Promise<
  ServiceResult<{
    case: ReviewCaseRow;
    event: ReviewEventRow;
    fromStatus: PiReviewStatus;
    toStatus: PiReviewStatus;
  }>
> {
  const caseRes = await getReviewCase(supabase, input.caseId, input.caseUserId);
  if (caseRes.error || !caseRes.data) {
    return { data: null, error: caseRes.error ?? "Case not found" };
  }
  const reviewCase = caseRes.data;
  const fromStatus = reviewCase.current_status;
  const subjectKind = input.subjectKind ?? reviewCase.subject_kind;

  const rewriteGuard = guardCapabilityRewrite({
    action: input.action,
    proposedRevision: input.proposedRevision,
    evidenceIds: input.evidenceIds,
    subjectKind,
  });
  if (rewriteGuard) {
    return { data: null, error: rewriteGuard };
  }

  const rev = input.proposedRevision ?? {};
  const proposesCapabilityLevelChange = ["level", "levelProposed", "capability_level", "verified_level"].some(
    (k) => rev[k] !== undefined && rev[k] !== null,
  );

  const transition = resolveTransition({
    fromStatus,
    action: input.action,
    actorRole: input.actorRole,
    rationale: input.rationale,
    evidenceIds: input.evidenceIds,
    touchesVerifiedCapability:
      subjectKind === "capability_level" ||
      subjectKind === "competency_mapping" ||
      subjectKind === "assessment_finding",
    proposesCapabilityLevelChange,
  });

  if (!transition.ok) {
    return { data: null, error: transition.error };
  }

  const toStatus = transition.toStatus;
  const closed = isClosedStatus(toStatus);

  const { data: event, error: eventError } = await supabase
    .from("pi_review_events")
    .insert({
      case_id: reviewCase.id,
      user_id: reviewCase.user_id,
      actor_user_id: input.actorUserId,
      actor_role: input.actorRole,
      action: input.action,
      from_status: fromStatus,
      to_status: toStatus,
      rationale: input.rationale?.trim() ?? "",
      factual_correction: input.factualCorrection ?? {},
      context_note: input.contextNote?.trim() ?? "",
      evidence_ids: input.evidenceIds ?? [],
      visibility_change: input.visibilityChange ?? {},
      proposed_revision: input.proposedRevision ?? {},
      audit: {
        ...(input.audit ?? {}),
        capability_mutation: false,
        note: "Review events never rewrite capability levels; revise queues reassessment only",
      },
    })
    .select("*")
    .single();

  if (eventError) return { data: null, error: eventError.message };

  const patch: Record<string, unknown> = {
    current_status: toStatus,
    closed_at: closed ? new Date().toISOString() : null,
  };
  if (input.actorRole === "admin_reviewer" && input.action === "start_review") {
    patch.assigned_reviewer_id = input.actorUserId;
  }

  const { data: updated, error: updateError } = await supabase
    .from("pi_review_cases")
    .update(patch)
    .eq("id", reviewCase.id)
    .select("*")
    .single();

  if (updateError) return { data: null, error: updateError.message };

  await notifyReviewTransition(supabase, {
    userId: reviewCase.user_id,
    caseId: reviewCase.id,
    action: input.action,
    fromStatus,
    toStatus,
    actorRole: input.actorRole,
    eventId: String(event.id),
  });

  return {
    data: {
      case: updated as ReviewCaseRow,
      event: event as ReviewEventRow,
      fromStatus,
      toStatus,
    },
    error: null,
  };
}

/** Convenience: accept finding. */
export async function acceptFinding(
  supabase: SupabaseClient,
  opts: { caseId: string; userId: string; rationale?: string },
) {
  return applyReviewAction(supabase, {
    caseId: opts.caseId,
    caseUserId: opts.userId,
    actorUserId: opts.userId,
    actorRole: "subject_user",
    action: "accept",
    rationale: opts.rationale ?? "Accepted by user",
  });
}

/** Convenience: challenge judgement — always new event. */
export async function challengeFinding(
  supabase: SupabaseClient,
  opts: {
    caseId: string;
    userId: string;
    rationale: string;
    contextNote?: string;
    evidenceIds?: string[];
  },
) {
  return applyReviewAction(supabase, {
    caseId: opts.caseId,
    caseUserId: opts.userId,
    actorUserId: opts.userId,
    actorRole: "subject_user",
    action: "challenge_judgement",
    rationale: opts.rationale,
    contextNote: opts.contextNote,
    evidenceIds: opts.evidenceIds,
  });
}

/** Convenience: add context without challenging. */
export async function addContext(
  supabase: SupabaseClient,
  opts: {
    caseId: string;
    userId: string;
    contextNote: string;
    factualCorrection?: Record<string, unknown>;
  },
) {
  return applyReviewAction(supabase, {
    caseId: opts.caseId,
    caseUserId: opts.userId,
    actorUserId: opts.userId,
    actorRole: "subject_user",
    action: opts.factualCorrection ? "correct_factual" : "add_context",
    contextNote: opts.contextNote,
    factualCorrection: opts.factualCorrection,
    rationale: opts.contextNote,
  });
}
