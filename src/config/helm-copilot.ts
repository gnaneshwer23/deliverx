/**
 * Helm — DeliverX persona copilot branding and persona-specific UX copy.
 * "You're at the helm; AI navigates your delivery signals."
 */

import type { MissionPersonaId } from "@/lib/mission-nav";
import type { DeliveryImpactRole } from "@/services/deliveryImpactEngine";

export const HELM_NAME = "Helm";
export const HELM_TAGLINE = "Ask Helm — AI navigates your delivery signals";
export const HELM_DISCLAIMER =
  "Helm reads live workspace data only. Nothing auto-applies without your approval.";

export const DB_ROLE_TO_IMPACT_ROLE: Record<string, DeliveryImpactRole> = {
  executive: "founder",
  product_manager: "product",
  pm: "pm",
  ba: "ba",
  engineer: "engineer",
  team_member: "engineer",
  qa: "qa",
  scrum_master: "scrum",
};

export function dbRoleToImpactRole(role: string | null | undefined): DeliveryImpactRole {
  if (!role) return "pm";
  return DB_ROLE_TO_IMPACT_ROLE[role] ?? "pm";
}

export const HELM_QUICK_CHIPS: Record<MissionPersonaId, string[]> = {
  founder: [
    "What is blocking go-live?",
    "Are we on budget?",
    "Last standup?",
    "Team on track?",
  ],
  "pm-mission": [
    "What's blocking delivery?",
    "Team needs this week",
    "Pending proposals to review",
  ],
  ba: [
    "Requirements coverage gaps",
    "Clarifications waiting on me",
    "Charter alignment status",
  ],
  product: [
    "Roadmap vs charter goals",
    "Open product decisions",
    "Feature readiness summary",
  ],
  engineer: [
    "My priority tasks",
    "Stories missing acceptance criteria",
    "Recent blockers for engineering",
  ],
  scrum: [
    "Sprint impediments",
    "Ceremony follow-ups pending",
    "Velocity and capacity signals",
  ],
  qa: [
    "Release readiness gaps",
    "Open defects and test coverage",
    "UAT blockers",
  ],
};

export function helmWelcomeMessage(
  personaId: MissionPersonaId,
  hasProjects: boolean,
  projectName?: string | null,
): string {
  if (!hasProjects) {
    return `Hi — I'm ${HELM_NAME}. You don't have any active projects in scope yet. Join a project workspace or ask your PM for an invite, then I can answer questions grounded in charter, signals, and proposals.`;
  }
  const scope = projectName ? ` for ${projectName}` : " across your scoped projects";
  const focus: Record<MissionPersonaId, string> = {
    founder: "portfolio runway, risks, and executive decisions",
    "pm-mission": "blockers, team needs, governance, and pending proposals",
    ba: "requirements traceability, clarifications, and charter alignment",
    product: "roadmap priorities, discovery, and product decisions",
    engineer: "tasks, stories, and engineering blockers",
    scrum: "sprint health, impediments, and ceremony follow-ups",
    qa: "test coverage, defects, and release readiness",
  };
  return `Hi — I'm ${HELM_NAME}${scope}. I focus on ${focus[personaId]}. Ask anything; I'll only cite data that exists in your workspace.`;
}

export function helmEmptyStateHint(personaId: MissionPersonaId): string {
  const hints: Record<MissionPersonaId, string> = {
    founder: "No portfolio projects in scope — connect a programme or wait for PM setup.",
    "pm-mission": "No project selected — pick a project or create one to unlock live signals.",
    ba: "No requirements workspace yet — upload a business case or charter first.",
    product: "No product workspace — link to a project with a charter or roadmap.",
    engineer: "No engineering backlog in scope — join a project team to see tasks and stories.",
    scrum: "No sprint data yet — connect to a project with an active delivery plan.",
    qa: "No QA scope — join a project to see test and release signals.",
  };
  return hints[personaId];
}
