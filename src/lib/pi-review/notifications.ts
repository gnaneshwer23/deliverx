import type { SupabaseClient } from "@supabase/supabase-js";
import type { PiReviewAction, PiReviewStatus } from "@/lib/pi-review/types";
import { PI_REVIEW_ACTION_LABELS, PI_REVIEW_STATUS_LABELS } from "@/lib/pi-review/types";
import {
  createNotification,
  listNotifications,
  markNotificationsRead,
} from "@/lib/notifications";

export type NotifyInput = {
  userId: string;
  caseId: string;
  kind: string;
  title: string;
  body?: string;
  payload?: Record<string, unknown>;
  sourceId?: string;
  dedupeKey?: string;
  /** Kept for caller compatibility; T5 is intentionally in-app only. */
  queueEmail?: boolean;
};

export type NotifyTransitionInput = {
  userId: string;
  caseId: string;
  action: PiReviewAction;
  fromStatus: PiReviewStatus;
  toStatus: PiReviewStatus;
  actorRole: string;
  eventId?: string;
  queueEmail?: boolean;
};

export async function createReviewNotification(
  supabase: SupabaseClient,
  input: NotifyInput,
): Promise<{ data: { id: string } | null; error: string | null }> {
  try {
    const notification = await createNotification(supabase, {
      userId: input.userId,
      kind: "review",
      title: input.title,
      body: input.body,
      href: `/profile/evidence?review=${encodeURIComponent(input.caseId)}`,
      contextType: "evidence",
      contextId: input.caseId,
      payload: {
        ...(input.payload ?? {}),
        reviewKind: input.kind,
      },
      sourceType: "pi_review_case",
      sourceId: input.sourceId ?? input.caseId,
      dedupeKey: input.dedupeKey ?? `review:${input.caseId}:${input.kind}`,
    });
    return { data: { id: notification.id }, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Notification failed" };
  }
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
    sourceId: input.eventId ?? input.caseId,
    dedupeKey: input.eventId
      ? `review:event:${input.eventId}`
      : `review:${input.caseId}:${input.action}:${input.toStatus}`,
    queueEmail: false,
  });
}

export async function markNotificationEmailSent(
  supabase: SupabaseClient,
  notificationId: string,
): Promise<{ error: string | null }> {
  void supabase;
  void notificationId;
  return { error: "T5 person notifications are in-app only" };
}

export async function listUnreadNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit = 50,
): Promise<{ data: unknown[]; error: string | null }> {
  try {
    const result = await listNotifications(supabase, userId, limit);
    return {
      data: result.notifications.filter((notification) => !notification.readAt),
      error: null,
    };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : "Notification list failed" };
  }
}

export async function markNotificationRead(
  supabase: SupabaseClient,
  userId: string,
  notificationId: string,
): Promise<{ error: string | null }> {
  try {
    await markNotificationsRead(supabase, userId, [notificationId]);
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Notification update failed" };
  }
}
