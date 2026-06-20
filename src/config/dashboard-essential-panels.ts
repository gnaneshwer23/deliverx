/**
 * K2 panel diet — essential panels shown by default per persona.
 * Non-essential panels stay in the codebase but are hidden until customize.
 */

import type { MissionPersonaId } from "@/lib/mission-nav";

export type DashboardPersonaId = MissionPersonaId | "command-centre";

/** Panels visible on first load (~4–6 per persona). */
export const ESSENTIAL_DASHBOARD_PANELS: Record<DashboardPersonaId, readonly string[]> = {
  founder: [
    "funding",
    "portfolio",
    "decisions",
    "intelligence-feed",
    "delivery-health",
    "objectives",
    "collaborative-loop",
  ],
  "pm-mission": [
    "pm-needs-attention",
    "pm-governance-tabs",
    "pm-ai-review-inbox",
    "pm-steady-state-milestones",
    "pm-team-capacity",
    "guided-tasks",
  ],
  ba: ["guided-tasks", "stakeholders", "traceability", "collaborative-loop", "cross-role"],
  product: [
    "guided-tasks",
    "roadmap",
    "rice",
    "vision",
    "stakeholders",
    "collaborative-loop",
  ],
  engineer: [
    "guided-tasks",
    "traceability",
    "architecture",
    "dependencies",
    "pull-requests",
    "collaborative-loop",
  ],
  scrum: [
    "guided-tasks",
    "sprint-health",
    "impediments",
    "velocity",
    "standup",
    "collaborative-loop",
  ],
  qa: [
    "guided-tasks",
    "release-readiness",
    "traceability",
    "defects",
    "test-cases",
    "collaborative-loop",
  ],
  "command-centre": [
    "alert-queue",
    "active-tasks",
    "project-health",
    "pending-decisions",
    "recent-projects",
  ],
};

/** All registered panel IDs per persona (essential + optional). */
export const ALL_DASHBOARD_PANELS: Record<DashboardPersonaId, readonly string[]> = {
  founder: [
    "funding",
    "objectives",
    "portfolio",
    "investment-archive",
    "benefits-tracker",
    "investor",
    "decisions",
    "intelligence-feed",
    "delivery-health",
    "product-health",
    "team-health",
    "collaborative-loop",
    "cross-role",
    "founder-context",
  ],
  "pm-mission": [
    "pm-review-ai-built",
    "pm-day-one-milestones",
    "pm-day-one-raid",
    "pm-team-roster",
    "pm-get-oriented",
    "pm-needs-attention",
    "pm-governance-tabs",
    "pm-ai-review-inbox",
    "pm-steady-state-milestones",
    "pm-team-capacity",
    "guided-tasks",
    "health",
    "stakeholders",
    "stakeholder-actions",
    "status-reports",
    "project-memory",
    "meeting-intelligence",
    "raid",
    "milestones",
    "budget",
    "benefits",
    "decisions",
    "collaborative-loop",
    "cross-role",
  ],
  ba: [
    "collaborative-loop",
    "guided-tasks",
    "cross-role",
    "stakeholders",
    "traceability",
    "success-metrics",
  ],
  product: [
    "guided-tasks",
    "vision",
    "roadmap",
    "rice",
    "opportunity-tree",
    "pain-points",
    "segments",
    "adoption",
    "collaborative-loop",
    "cross-role",
    "stakeholders",
  ],
  engineer: [
    "guided-tasks",
    "dependencies",
    "traceability",
    "architecture",
    "cicd",
    "github-activity",
    "api-contracts",
    "pull-requests",
    "technical-debt",
    "stakeholders",
    "collaborative-loop",
    "cross-role",
  ],
  scrum: [
    "guided-tasks",
    "sprint-health",
    "team-health",
    "burnout",
    "impediments",
    "ceremonies",
    "standup",
    "velocity",
    "capacity",
    "cross-team",
    "retro",
    "maturity",
    "stakeholders",
    "collaborative-loop",
    "cross-role",
  ],
  qa: [
    "guided-tasks",
    "release-prediction",
    "traceability",
    "test-cases",
    "defects",
    "automation",
    "impact",
    "uat",
    "release-readiness",
    "performance",
    "security",
    "stakeholders",
    "collaborative-loop",
    "cross-role",
  ],
  "command-centre": [
    "intelligence-loop",
    "stakeholder-loop",
    "alert-queue",
    "delivery-coach",
    "delivery-forecasts",
    "ai-output-review",
    "command-centre-intelligence",
    "agent-orchestration",
    "delivery-velocity",
    "governance-pulse",
    "project-health",
    "active-tasks",
    "risk-register",
    "recent-meetings",
    "pending-decisions",
    "standups",
    "latest-reports",
    "governance-by-project",
    "recent-projects",
  ],
};

const MISSION_PERSONA_IDS: MissionPersonaId[] = [
  "founder",
  "pm-mission",
  "ba",
  "product",
  "engineer",
  "scrum",
  "qa",
];

export function isEssentialPanel(personaId: DashboardPersonaId, panelId: string): boolean {
  return ESSENTIAL_DASHBOARD_PANELS[personaId].includes(panelId);
}

export function essentialPanelCount(personaId: DashboardPersonaId): number {
  return ESSENTIAL_DASHBOARD_PANELS[personaId].length;
}

export function nonEssentialPanelIds(personaId: DashboardPersonaId): string[] {
  const essential = new Set(ESSENTIAL_DASHBOARD_PANELS[personaId]);
  return ALL_DASHBOARD_PANELS[personaId].filter((id) => !essential.has(id));
}

export function listMissionPersonaIds(): MissionPersonaId[] {
  return [...MISSION_PERSONA_IDS];
}
