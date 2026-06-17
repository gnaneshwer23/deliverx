/**
 * Proposed action types — unified approval queue for meeting and assistant flows.
 */

export type ProposalActionType =
  | "create_task"
  | "create_raid"
  | "create_decision"
  | "calendar_event";

export type ProposalSource = "meeting" | "assistant";

export type ProposalStatus = "pending" | "approved" | "rejected" | "applied";

export type TaskProposalPayload = {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
};

export type RaidProposalPayload = {
  title: string;
  description?: string;
  raidType?: "risk" | "issue" | "assumption" | "dependency";
  severity?: "low" | "medium" | "high" | "critical";
};

export type DecisionProposalPayload = {
  title: string;
  context?: string;
};

export type CalendarEventPayload = {
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  description?: string;
  location?: string;
};

export type ProposalPayload =
  | ({ kind: "create_task" } & TaskProposalPayload)
  | ({ kind: "create_raid" } & RaidProposalPayload)
  | ({ kind: "create_decision" } & DecisionProposalPayload)
  | ({ kind: "calendar_event" } & CalendarEventPayload);

export type StructuredProposal = {
  actionType: ProposalActionType;
  title: string;
  summary: string;
  payload: Record<string, unknown>;
};

export function buildGoogleCalendarUrl(input: CalendarEventPayload): string {
  const start = new Date(input.scheduledAt);
  const end = new Date(start.getTime() + input.durationMinutes * 60_000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "").slice(0, 15) + "Z";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${fmt(start)}/${fmt(end)}`,
  });
  if (input.description) params.set("details", input.description);
  if (input.location) params.set("location", input.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const ACTION_TYPE_LABELS: Record<ProposalActionType, string> = {
  create_task: "Create task",
  create_raid: "Create RAID item",
  create_decision: "Log decision",
  calendar_event: "Schedule calendar event",
};
