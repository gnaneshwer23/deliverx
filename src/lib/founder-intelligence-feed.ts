import type { AgentActivityEventRow } from "@/services/agentOrchestration";
import type { DeliveryImpactEventRow } from "@/services/deliveryImpact";
import {
  IMPACT_ROLE_LABELS,
  impactToneToSeverity,
  type DeliveryImpactRole,
} from "@/services/deliveryImpactEngine";

export const FOUNDER_INTELLIGENCE_FEED_LIMIT = 7;

export type FounderIntelligenceFeedItem = {
  id: string;
  source: "impact" | "agent";
  message: string;
  badge: string;
  severity: "high" | "medium" | "low" | "neutral";
  meta: string;
  projectId: string;
  projectName?: string;
  createdAt: string;
  href?: string;
};

const AGENT_ROLE_LABEL: Record<string, string> = {
  chief_of_staff: "Chief of Staff",
  pm_agent: "PM Agent",
  ba_agent: "BA Agent",
  product_agent: "Product Agent",
  engineer_agent: "Engineer Agent",
  qa_agent: "QA Agent",
  scrum_agent: "Scrum Agent",
  founder_agent: "Founder Agent",
};

const FOUNDER_IMPACT_ROLES: DeliveryImpactRole[] = ["founder", "pm", "scrum", "qa", "engineer"];

const AGENT_FOUNDER_PATTERN =
  /\b(review|decision|runway|funding|investor|escalat|blocker|critical|overdue)\b/i;

export function mapImpactEventToFeedItem(event: DeliveryImpactEventRow): FounderIntelligenceFeedItem {
  const toneSeverity = impactToneToSeverity(event.tone);
  const severity: FounderIntelligenceFeedItem["severity"] =
    toneSeverity === "high" ? "high" : toneSeverity === "medium" ? "medium" : "neutral";

  return {
    id: `impact:${event.id}`,
    source: "impact",
    message: event.message,
    badge: IMPACT_ROLE_LABELS[event.target_role] ?? event.target_role,
    severity,
    meta: event.action_type.replace(/_/g, " "),
    projectId: event.project_id,
    projectName: event.project_name,
    createdAt: event.created_at,
    href: `/project/${event.project_id}`,
  };
}

export function mapAgentEventToFeedItem(event: AgentActivityEventRow): FounderIntelligenceFeedItem {
  const severity: FounderIntelligenceFeedItem["severity"] =
    event.humanReviewRequired || event.eventType === "handoff"
      ? "high"
      : AGENT_FOUNDER_PATTERN.test(event.message)
        ? "medium"
        : "neutral";

  return {
    id: `agent:${event.id}`,
    source: "agent",
    message: event.message,
    badge: AGENT_ROLE_LABEL[event.agentRole] ?? event.agentRole,
    severity,
    meta: event.eventType.replace(/_/g, " "),
    projectId: event.projectId,
    projectName: event.projectName,
    createdAt: event.createdAt,
    href: `/project/${event.projectId}`,
  };
}

export function isFounderRelevantImpactEvent(event: DeliveryImpactEventRow): boolean {
  if (event.target_role === "founder") return true;
  if (event.source === "agent" || event.source === "bootstrap") return true;
  if (event.tone === "blocked" || event.tone === "waiting") {
    return FOUNDER_IMPACT_ROLES.includes(event.target_role);
  }
  return false;
}

export function isFounderRelevantAgentEvent(event: AgentActivityEventRow): boolean {
  if (event.agentRole === "founder_agent" || event.agentRole === "chief_of_staff") return true;
  if (event.handoffTo === "founder_agent") return true;
  if (event.humanReviewRequired) return true;
  return AGENT_FOUNDER_PATTERN.test(event.message);
}

/** Merge delivery impact + agent orchestration events, newest first, capped at limit. */
export function buildFounderIntelligenceFeed(
  impactEvents: DeliveryImpactEventRow[],
  agentEvents: AgentActivityEventRow[],
  limit = FOUNDER_INTELLIGENCE_FEED_LIMIT,
): FounderIntelligenceFeedItem[] {
  const items = [
    ...impactEvents.filter(isFounderRelevantImpactEvent).map(mapImpactEventToFeedItem),
    ...agentEvents.filter(isFounderRelevantAgentEvent).map(mapAgentEventToFeedItem),
  ];

  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
