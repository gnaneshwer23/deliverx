/**
 * In-app PI review notifications stub.
 * Persists rows; optionally queues email via hook (no-op if email not configured).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { PiReviewAction, PiReviewStatus } from "@/lib/pi-review/types";
import { PI_REVIEW_ACTION_LABELS, PI_REVIEW_STATUS_LABELS } from "@/lib/pi-review/types";

export type NotifyInput = {
  userId: string;
  caseId: string;
  kind: string;
  title: string;
  body?: string;
  payload?: Record<string, unknown>;
  /** When true, set email_queued_at for a future worker. */
  queueEmail?: boolean;
};

export type NotifyTransitionInput = {
  userId: string;
  caseId: string;
  action: PiReviewAction;
  fromStatus: PiReviewStatus;
  toStatus: PiReviewStatus;
  actorRole: string;
  queueEmail?: boolean;
};

export async function createReviewNotification(
  supabase: SupabaseClient,
  input: NotifyInput,
): Promise<{ data: { id: string } | null; error: string | null }> {
  const { data, error } = await supabase
    .from("pi_review_notifications")
    .insert({
      user_id: input.userId,
      case_id: input.caseId,
      kind: input.kind,
      title: input.title,
      body: input.body ?? "",
      payload: input.payload ?? {},
      email_queued_at: input.queueEmail ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: { id: data.id as string }, error: null };
}

export async function notifyReviewTransition(
  supabase: SupabaseClient,
  input: NotifyTransitionInput,
): Promise<{ data: { id: string } | null; error: string | null }> {
  const actionLabel = PI_REVIEW_ACTION_LABELS[input.action];
  const toLabel = PI_REVIEW_STATUS_LABELS[input.toStatus];
  const title =
    input.actorRole === "admin_reviewer"
      ? `Review update: ${toLabel}`
      : `Your action recorded: ${actionLabel}`;

  return createReviewNotification(supabase, {
    userId: input.userId,
    caseId: input.caseId,
    kind: `review.${input.action}`,
    title,
    body: `Status moved from ${PI_REVIEW_STATUS_LABELS[input.fromStatus]} to ${toLabel}.`,
    payload: {
      action: input.action,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      actorRole: input.actorRole,
    },
    queueEmail:
      input.queueEmail ??
      (input.toStatus === "escalated_to_human_review" ||
        input.toStatus === "upheld" ||
        input.toStatus === "revised" ||
        input.toStatus === "additional_evidence_required"),
  });
}

/**
 * Optional email hook — queues only. Actual send is left to a worker
 * that reads email_queued_at IS NOT NULL AND email_sent_at IS NULL.
 */
export async function markNotificationEmailSent(
  supabase: SupabaseClient,
  notificationId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("pi_review_notifications")
    .update({ email_sent_at: new Date().toISOString() })
    .eq("id", notificationId);
  return { error: error?.message ?? null };
}

export async function listUnreadNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit = 50,
): Promise<{ data: unknown[]; error: string | null }> {
  const { data, error } = await supabase
    .from("pi_review_notifications")
    .select("id, case_id, kind, title, body, payload, created_at, email_queued_at")
    .eq("user_id", userId)
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function markNotificationRead(
  supabase: SupabaseClient,
  userId: string,
  notificationId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("pi_review_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId);
  return { error: error?.message ?? null };
}
