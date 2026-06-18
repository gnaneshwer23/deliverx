/**
 * Agent orchestration → delivery impact bridge (Sprint H3).
 * Maps cross-role blocker insights and handoffs to stakeholder loop events.
 */

import type {
  AgentOrchestrationEvent,
  SpecialistAgentRole,
} from "./agentOrchestrationEngine";
import type {
  DeliveryImpactEventDraft,
  DeliveryImpactRole,
  DeliveryImpactTone,
} from "./deliveryImpactEngine";

const AGENT_TO_ROLE: Record<SpecialistAgentRole, DeliveryImpactRole> = {
  pm_agent: "pm",
  ba_agent: "ba",
  product_agent: "product",
  engineer_agent: "engineer",
  qa_agent: "qa",
  scrum_agent: "scrum",
  founder_agent: "founder",
};

const BLOCKER_PATTERN =
  /\b(blocked|critical|overdue|hold release|escalat|impediment|threaten)\b/i;

export function orchestrationEventsToImpactDrafts(
  events: AgentOrchestrationEvent[],
): DeliveryImpactEventDraft[] {
  const drafts: DeliveryImpactEventDraft[] = [];
  const seen = new Set<string>();

  const push = (role: DeliveryImpactRole, message: string, tone: DeliveryImpactTone) => {
    const key = `${role}:${message.slice(0, 80)}`;
    if (seen.has(key)) return;
    seen.add(key);
    drafts.push({ targetRole: role, message, tone });
  };

  for (const event of events) {
    if (event.eventType === "handoff" && event.handoffTo) {
      push(AGENT_TO_ROLE[event.handoffTo], event.message, "blocked");
      if (event.agentRole !== "chief_of_staff") {
        push(AGENT_TO_ROLE[event.agentRole as SpecialistAgentRole], event.message, "waiting");
      }
      continue;
    }

    if (event.eventType !== "insight" || event.agentRole === "chief_of_staff") continue;
    if (!BLOCKER_PATTERN.test(event.message)) continue;

    const sourceRole = AGENT_TO_ROLE[event.agentRole as SpecialistAgentRole];
    push(sourceRole, event.message, "blocked");

    if (event.agentRole === "engineer_agent") {
      push("pm", event.message, "waiting");
      push("scrum", event.message, "blocked");
    } else if (event.agentRole === "qa_agent" && /critical/i.test(event.message)) {
      push("engineer", event.message, "waiting");
      push("pm", event.message, "waiting");
    } else if (event.agentRole === "pm_agent") {
      push("scrum", event.message, "waiting");
      if (/blocker|overdue/i.test(event.message)) {
        push("founder", event.message, "waiting");
      }
    } else if (event.agentRole === "founder_agent" && /review/i.test(event.message)) {
      push("pm", event.message, "waiting");
    } else if (event.agentRole === "scrum_agent" && /velocity|standup/i.test(event.message)) {
      push("pm", event.message, "waiting");
    }
  }

  return drafts;
}

export function runAgentOrchestrationImpactSmokeTest(): {
  ok: boolean;
  draftCount: number;
  rolesReached: number;
} {
  const drafts = orchestrationEventsToImpactDrafts([
    {
      agentRole: "engineer_agent",
      eventType: "insight",
      message: "Engineering blocked — unblock before starting new stories",
      confidence: 0.88,
    },
    {
      agentRole: "qa_agent",
      eventType: "handoff",
      message: "Routing critical defects to Engineer Agent for fix plan",
      handoffTo: "engineer_agent",
      confidence: 0.87,
    },
  ]);

  const roles = new Set(drafts.map((d) => d.targetRole));
  return {
    ok: drafts.length >= 3 && roles.has("engineer") && roles.has("pm"),
    draftCount: drafts.length,
    rolesReached: roles.size,
  };
}
