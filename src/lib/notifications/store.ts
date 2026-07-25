import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateNotificationInput,
  DomainEventNotification,
  NotificationRecord,
} from "@/lib/notifications/types";

const PRIVACY_EVENTS = [
  "privacy.export.requested",
  "privacy.export.completed",
  "privacy.delete.requested",
  "privacy.delete.completed",
] as const;

function mapRow(row: Record<string, unknown>): NotificationRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    kind: row.kind as NotificationRecord["kind"],
    title: String(row.title),
    body: String(row.body ?? ""),
    href: String(row.href),
    contextType: row.context_type as NotificationRecord["contextType"],
    contextId: (row.context_id as string | null) ?? null,
    payload: (row.payload as Record<string, unknown>) ?? {},
    sourceEventId: (row.source_event_id as string | null) ?? null,
    sourceType: String(row.source_type),
    sourceId: String(row.source_id),
    deliveredAt: String(row.delivered_at),
    readAt: (row.read_at as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

export function assertNotificationSafe(input: CreateNotificationInput): void {
  if (!input.href.startsWith("/")) {
    throw new Error("Notification href must be an internal contextual path");
  }
  if (!input.title.trim()) {
    throw new Error("Notification title is required");
  }
  if (
    input.payload?.capabilityAssigned === true ||
    input.payload?.verified === true ||
    input.payload?.externallyVerified === true
  ) {
    throw new Error("Notifications cannot assign capability or verification");
  }
}

export async function createNotification(
  supabase: SupabaseClient,
  input: CreateNotificationInput,
): Promise<NotificationRecord> {
  assertNotificationSafe(input);
  const { data, error } = await supabase
    .from("pi_notifications")
    .upsert(
      {
        user_id: input.userId,
        kind: input.kind,
        title: input.title.trim(),
        body: input.body?.trim() ?? "",
        href: input.href,
        context_type: input.contextType,
        context_id: input.contextId ?? null,
        payload: {
          ...(input.payload ?? {}),
          capabilityAssigned: false,
          verificationChanged: false,
        },
        source_event_id: input.sourceEventId ?? null,
        source_type: input.sourceType,
        source_id: input.sourceId,
        dedupe_key: input.dedupeKey,
      },
      { onConflict: "user_id,dedupe_key" },
    )
    .select("*")
    .single();
  if (error || !data) throw error ?? new Error("Could not create notification");
  return mapRow(data as Record<string, unknown>);
}

export function mapDomainEventToNotification(event: {
  event_type: string;
  aggregate_id: string;
}): DomainEventNotification | null {
  switch (event.event_type) {
    case "privacy.export.requested":
      return {
        kind: "privacy",
        title: "Professional Intelligence export started",
        body: "Your private data export is being prepared.",
        href: "/settings/profile#privacy",
        contextType: "account",
        contextId: event.aggregate_id,
      };
    case "privacy.export.completed":
      return {
        kind: "privacy",
        title: "Professional Intelligence export ready",
        body: "Your export completed. Return to privacy controls to download a fresh copy.",
        href: "/settings/profile#privacy",
        contextType: "account",
        contextId: event.aggregate_id,
      };
    case "privacy.delete.requested":
      return {
        kind: "privacy",
        title: "Professional Intelligence deletion started",
        body: "Your confirmed deletion request is being processed.",
        href: "/settings/profile#privacy",
        contextType: "account",
        contextId: event.aggregate_id,
      };
    case "privacy.delete.completed":
      return {
        kind: "privacy",
        title: "Professional Intelligence deletion completed",
        body: "Person Professional Intelligence data was removed under the privacy policy.",
        href: "/settings/profile#privacy",
        contextType: "account",
        contextId: event.aggregate_id,
      };
    default:
      return null;
  }
}

export async function syncNotificationsFromDomainEvents(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("pi_domain_events")
    .select("id, event_type, aggregate_id, payload")
    .eq("user_id", userId)
    .in("event_type", [...PRIVACY_EVENTS])
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) throw error;

  let synced = 0;
  for (const row of data ?? []) {
    const mapped = mapDomainEventToNotification({
      event_type: String(row.event_type),
      aggregate_id: String(row.aggregate_id),
    });
    if (!mapped) continue;
    await createNotification(supabase, {
      userId,
      ...mapped,
      payload: (row.payload as Record<string, unknown>) ?? {},
      sourceEventId: String(row.id),
      sourceType: "pi_domain_event",
      sourceId: String(row.id),
      dedupeKey: `event:${row.id}`,
    });
    synced += 1;
  }
  return synced;
}

export async function listNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit = 50,
): Promise<{ notifications: NotificationRecord[]; unreadCount: number }> {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const [{ data, error }, { count, error: countError }] = await Promise.all([
    supabase
      .from("pi_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(safeLimit),
    supabase
      .from("pi_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null),
  ]);
  if (error) throw error;
  if (countError) throw countError;
  return {
    notifications: (data ?? []).map((row) => mapRow(row as Record<string, unknown>)),
    unreadCount: count ?? 0,
  };
}

export async function markNotificationsRead(
  supabase: SupabaseClient,
  userId: string,
  notificationIds?: string[],
): Promise<number> {
  let query = supabase
    .from("pi_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
  if (notificationIds?.length) {
    query = query.in("id", notificationIds);
  }
  const { data, error } = await query.select("id");
  if (error) throw error;
  return data?.length ?? 0;
}
