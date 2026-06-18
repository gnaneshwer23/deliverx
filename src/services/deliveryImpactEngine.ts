/**
 * Delivery impact engine — map applied proposals to cross-role dashboard signals.
 */

import type {
  ProposalActionType,
  ProposalSource,
} from "./proposedActionEngine";

export type DeliveryImpactRole =
  | "founder"
  | "product"
  | "pm"
  | "ba"
  | "engineer"
  | "qa"
  | "scrum";

export type DeliveryImpactTone =
  | "ready"
  | "waiting"
  | "blocked"
  | "updated"
  | "pending";

export type DeliveryImpactEventDraft = {
  targetRole: DeliveryImpactRole;
  message: string;
  tone: DeliveryImpactTone;
};

export const IMPACT_ROLE_LABELS: Record<DeliveryImpactRole, string> = {
  founder: "Founder",
  product: "Product Manager",
  pm: "Delivery PM",
  ba: "Business Analyst",
  engineer: "Engineers",
  qa: "QA",
  scrum: "Scrum Master",
};

export function proposalApplyToImpactEvents(input: {
  actionType: ProposalActionType;
  title: string;
  source: ProposalSource;
  applyResult: Record<string, unknown>;
}): DeliveryImpactEventDraft[] {
  const entityLabel = input.applyResult.entityType
    ? String(input.applyResult.entityType)
    : input.actionType.replace("create_", "");

  const baseMessage = `"${input.title}" applied — ${entityLabel} created`;

  switch (input.actionType) {
    case "create_task":
      return [
        { targetRole: "engineer", message: baseMessage, tone: "updated" },
        { targetRole: "pm", message: baseMessage, tone: "updated" },
        { targetRole: "scrum", message: baseMessage, tone: "updated" },
        { targetRole: "qa", message: `New work item may need test coverage: ${input.title}`, tone: "waiting" },
      ];
    case "create_raid":
      return [
        { targetRole: "pm", message: baseMessage, tone: "blocked" },
        { targetRole: "founder", message: baseMessage, tone: "updated" },
        { targetRole: "scrum", message: `Impediment logged: ${input.title}`, tone: "blocked" },
        { targetRole: "engineer", message: `RAID item may block delivery: ${input.title}`, tone: "waiting" },
      ];
    case "create_decision":
      return [
        { targetRole: "pm", message: baseMessage, tone: "updated" },
        { targetRole: "founder", message: baseMessage, tone: "updated" },
        { targetRole: "product", message: `Decision recorded — check backlog impact: ${input.title}`, tone: "waiting" },
        { targetRole: "ba", message: `Governance decision may affect requirements: ${input.title}`, tone: "waiting" },
      ];
    case "calendar_event":
      return [
        { targetRole: "pm", message: `Follow-up scheduled: ${input.title}`, tone: "updated" },
        { targetRole: "scrum", message: `Ceremony follow-up queued: ${input.title}`, tone: "updated" },
      ];
    default:
      return [{ targetRole: "pm", message: baseMessage, tone: "updated" }];
  }
}

export function mergeImpactIntoCrossRole<T extends { role: string; message: string; tone: string }>(
  base: T[],
  events: DeliveryImpactEventDraft[],
): T[] {
  if (events.length === 0) return base;

  const byLabel = new Map<string, DeliveryImpactEventDraft>();
  for (const event of events) {
    byLabel.set(IMPACT_ROLE_LABELS[event.targetRole], event);
  }

  return base.map((row) => {
    const hit = byLabel.get(row.role);
    if (!hit) return row;
    return {
      ...row,
      message: hit.message,
      tone: hit.tone,
    };
  });
}
