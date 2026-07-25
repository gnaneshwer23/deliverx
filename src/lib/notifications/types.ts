export type NotificationKind = "review" | "intervention" | "privacy" | "system";

export type NotificationContextType =
  | "project"
  | "task"
  | "meeting"
  | "evidence"
  | "career_objective"
  | "account";

export type NotificationRecord = {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  contextType: NotificationContextType;
  contextId: string | null;
  payload: Record<string, unknown>;
  sourceEventId: string | null;
  sourceType: string;
  sourceId: string;
  deliveredAt: string;
  readAt: string | null;
  createdAt: string;
};

export type CreateNotificationInput = {
  userId: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  href: string;
  contextType: NotificationContextType;
  contextId?: string | null;
  payload?: Record<string, unknown>;
  sourceEventId?: string | null;
  sourceType: string;
  sourceId: string;
  dedupeKey: string;
};

export type DomainEventNotification = {
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  contextType: NotificationContextType;
  contextId: string | null;
};
