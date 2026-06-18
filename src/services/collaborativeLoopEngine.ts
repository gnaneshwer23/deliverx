/**
 * Collaborative loop engine — stakeholder loop, team needs, and pulse (pure logic).
 */

import { buildStakeholderConnections } from "./baRequirementEngine";
import { buildStakeholderActionQueue } from "./deliveryPmEngine";
import { buildEngineerStakeholders } from "./engineerEngine";
import { buildQaStakeholders } from "./qaEngine";
import { buildScrumStakeholders } from "./scrumEngine";
import { buildStakeholderProductConnections } from "./pmProductEngine";
import type { DeliveryImpactRole } from "./deliveryImpactEngine";
import type { OrgGovernanceStats } from "./governance";

export type CollaborativePersona = DeliveryImpactRole;

export type StakeholderLoopRow = {
  id: string;
  counterparty: string;
  youNeed: string;
  theyNeed: string;
  status: string;
  tone: "green" | "amber" | "red" | "slate";
};

export type TeamNeedKind = "clarification" | "blocker" | "decision" | "defect";

export type TeamNeedRow = {
  id: string;
  kind: TeamNeedKind;
  title: string;
  fromStakeholder: string;
  priority: "high" | "medium" | "low";
  dueLabel?: string;
  href?: string;
};

export type StakeholderPulseItem = {
  label: string;
  value: number;
  href?: string;
  tone: "neutral" | "warning" | "critical" | "info";
};

export type CollaborativeLoopSnapshot = {
  persona: CollaborativePersona;
  stakeholderLoop: StakeholderLoopRow[];
  teamNeeds: TeamNeedRow[];
  pulse: StakeholderPulseItem[];
};

export type CollaborativeLoopInput = {
  persona: CollaborativePersona;
  governance: OrgGovernanceStats;
  blockedTasks: number;
  openClarifications: number;
  pendingProposals: number;
  criticalDefects: number;
  clarifications: Array<{ id: string; question: string; stakeholderRole: string | null }>;
  pendingDecisions: Array<{ id: string; title: string; projectId: string }>;
  criticalRisks: Array<{ id: string; title: string }>;
  requirementsApproved?: number;
  requirementsTotal?: number;
  storiesReady?: number;
  /** H2 traceable narrative threads (Auth API, defects, FR-003). */
  narrativeThreads?: TeamNeedRow[];
};

const PERSONA_LABEL: Record<CollaborativePersona, string> = {
  founder: "Founder",
  product: "Product Manager",
  pm: "Delivery PM",
  ba: "Business Analyst",
  engineer: "Engineers",
  qa: "QA",
  scrum: "Scrum Master",
};

const INVERSE_NEED: Record<CollaborativePersona, Record<string, string>> = {
  founder: {
    "Product Manager": "Strategic priorities and investment guardrails",
    "Project Manager": "Portfolio health and escalation signals",
    Engineer: "Capacity and delivery confidence",
    QA: "Release readiness for investor milestones",
    Sponsor: "Runway and governance approvals",
    Customer: "Validated problem statements",
  },
  product: {
    Founder: "Roadmap alignment with company strategy",
    "Project Manager": "Delivery feasibility and timeline",
    BA: "Requirements traceability to roadmap",
    Engineer: "Technical feasibility feedback",
    QA: "Quality acceptance criteria",
    Customer: "Discovery insights and feedback",
  },
  pm: {
    Sponsor: "Budget and decision approvals",
    "Product Manager": "Scope and priority changes",
    BA: "Requirements clarity",
    Engineer: "Sprint execution and blockers",
    QA: "Test readiness for release",
    "Scrum Master": "Ceremony outcomes and impediments",
  },
  ba: {
    "Founder / Sponsor": "Business context and sign-off",
    "Product Manager": "Prioritised backlog for refinement",
    "Project Manager": "Delivery planning inputs",
    Engineer: "Implementation feedback on stories",
    QA: "Test scenario validation",
    "Scrum Master": "Sprint-ready story pack",
  },
  engineer: {
    BA: "Approved stories and acceptance criteria",
    "Product Manager": "Scope clarifications",
    "Project Manager": "Dependency resolution",
    QA: "Defect reproduction steps",
    "Scrum Master": "Impediment removal",
    Sponsor: "Benefits linkage for releases",
  },
  qa: {
    Engineer: "Defect fixes and build stability",
    "Product Manager": "Acceptance criteria confirmation",
    PM: "Release go/no-go decision",
    Sponsor: "Business confidence for launch",
    Operations: "Production stability evidence",
  },
  scrum: {
    Engineer: "Sprint commitment and blockers",
    QA: "Test readiness within sprint",
    PM: "Scope changes and stakeholder updates",
    Sponsor: "Sprint outcome visibility",
    "Product Manager": "Backlog refinement participation",
  },
};

function normalizeTone(tone?: string): StakeholderLoopRow["tone"] {
  if (tone === "green" || tone === "red" || tone === "amber") return tone;
  if (tone === "slate") return "slate";
  return "slate";
}

function connectionsToLoopRows(
  persona: CollaborativePersona,
  connections: Array<{ stakeholder: string; dependency: string; status?: string; tone?: string }>,
): StakeholderLoopRow[] {
  const inverse = INVERSE_NEED[persona];
  return connections.map((c, i) => ({
    id: `loop-${persona}-${i}`,
    counterparty: c.stakeholder,
    youNeed: c.dependency,
    theyNeed: inverse[c.stakeholder] ?? `${PERSONA_LABEL[persona]} updates and coordination`,
    status: c.status ?? "Active",
    tone: normalizeTone(c.tone),
  }));
}

function buildPersonaConnections(input: CollaborativeLoopInput): StakeholderLoopRow[] {
  const { persona } = input;

  switch (persona) {
    case "ba":
      return connectionsToLoopRows(
        persona,
        buildStakeholderConnections({
          clarificationsOpen: input.openClarifications,
          storiesReady: input.storiesReady ?? 0,
          requirementsApproved: input.requirementsApproved ?? 0,
          requirementsTotal: input.requirementsTotal ?? 0,
        }),
      );
    case "product":
      return connectionsToLoopRows(persona, buildStakeholderProductConnections());
    case "engineer":
      return connectionsToLoopRows(
        persona,
        buildEngineerStakeholders().map((s) => ({
          stakeholder: s.stakeholder,
          dependency: s.dependency,
          status: input.blockedTasks > 0 ? "Blocked" : "Active",
          tone: input.blockedTasks > 0 ? "red" : "green",
        })),
      );
    case "qa":
      return connectionsToLoopRows(
        persona,
        buildQaStakeholders().map((s) => ({
          stakeholder: s.stakeholder,
          dependency: s.dependency,
          status: input.criticalDefects > 0 ? "Attention" : "Active",
          tone: input.criticalDefects > 0 ? "amber" : "green",
        })),
      );
    case "scrum":
      return connectionsToLoopRows(
        persona,
        buildScrumStakeholders().map((s) => ({
          stakeholder: s.stakeholder,
          dependency: s.dependency,
          status: input.blockedTasks > 0 ? "Impediments" : "Flowing",
          tone: input.blockedTasks > 0 ? "amber" : "green",
        })),
      );
    case "pm":
      return connectionsToLoopRows(persona, [
        { stakeholder: "Sponsor", dependency: "Budget / decisions", status: input.governance.pendingDecisions > 0 ? "Pending" : "Active", tone: input.governance.pendingDecisions > 0 ? "amber" : "green" },
        { stakeholder: "Product Manager", dependency: "Priorities", status: "Active", tone: "green" },
        { stakeholder: "BA", dependency: "Requirements clarity", status: input.openClarifications > 0 ? "Active" : "Ready", tone: input.openClarifications > 0 ? "amber" : "green" },
        { stakeholder: "Engineer", dependency: "Sprint execution", status: input.blockedTasks > 0 ? "Blocked" : "Active", tone: input.blockedTasks > 0 ? "red" : "green" },
        { stakeholder: "QA", dependency: "Release testing", status: "Ready", tone: "green" },
        { stakeholder: "Scrum Master", dependency: "Ceremony facilitation", status: "Active", tone: "green" },
      ]);
    case "founder":
    default:
      return connectionsToLoopRows(persona, [
        { stakeholder: "Product Manager", dependency: "Roadmap & PMF signals", status: "Active", tone: "green" },
        { stakeholder: "Delivery PM", dependency: "Portfolio delivery health", status: input.governance.openRisks > 2 ? "At risk" : "Active", tone: input.governance.openRisks > 2 ? "amber" : "green" },
        { stakeholder: "Business Analyst", dependency: "Requirements readiness", status: input.openClarifications > 0 ? "Pending" : "Ready", tone: input.openClarifications > 0 ? "amber" : "green" },
        { stakeholder: "Engineers", dependency: "Velocity & capacity", status: input.blockedTasks > 0 ? "Strained" : "Stable", tone: input.blockedTasks > 0 ? "red" : "green" },
        { stakeholder: "QA", dependency: "Release confidence", status: "Monitoring", tone: "slate" },
        { stakeholder: "Sponsor", dependency: "Governance approvals", status: input.governance.pendingDecisions > 0 ? "Pending" : "Clear", tone: input.governance.pendingDecisions > 0 ? "amber" : "green" },
      ]);
  }
}

export function buildTeamNeeds(input: CollaborativeLoopInput): TeamNeedRow[] {
  const needs: TeamNeedRow[] = [];

  if (input.narrativeThreads?.length) {
    for (const thread of input.narrativeThreads) {
      needs.push(thread);
    }
  }

  for (const c of input.clarifications.slice(0, 4)) {
    needs.push({
      id: `clarification-${c.id}`,
      kind: "clarification",
      title: c.question.length > 80 ? `${c.question.slice(0, 77)}…` : c.question,
      fromStakeholder: c.stakeholderRole ?? "Stakeholder",
      priority: "medium",
      dueLabel: "Before sprint planning",
    });
  }

  for (const d of input.pendingDecisions.slice(0, 3)) {
    needs.push({
      id: `decision-${d.id}`,
      kind: "decision",
      title: d.title,
      fromStakeholder: "Sponsor",
      priority: "high",
      dueLabel: "This week",
      href: `/project/${d.projectId}/decisions`,
    });
  }

  for (const r of input.criticalRisks.slice(0, 2)) {
    needs.push({
      id: `risk-${r.id}`,
      kind: "blocker",
      title: `Mitigate risk: ${r.title}`,
      fromStakeholder: "PM",
      priority: "high",
      dueLabel: "Today",
    });
  }

  if (input.blockedTasks > 0) {
    needs.push({
      id: "blocked-tasks",
      kind: "blocker",
      title: `Unblock ${input.blockedTasks} delivery task${input.blockedTasks === 1 ? "" : "s"}`,
      fromStakeholder: "Engineering",
      priority: "high",
      dueLabel: "Today",
    });
  }

  if (input.criticalDefects > 0) {
    needs.push({
      id: "critical-defects",
      kind: "defect",
      title: `${input.criticalDefects} critical defect${input.criticalDefects === 1 ? "" : "s"} need resolution`,
      fromStakeholder: "QA",
      priority: "high",
      dueLabel: "Before release",
    });
  }

  if (input.pendingProposals > 0) {
    needs.push({
      id: "pending-proposals",
      kind: "decision",
      title: `Review ${input.pendingProposals} pending proposal${input.pendingProposals === 1 ? "" : "s"}`,
      fromStakeholder: "PM",
      priority: "medium",
      dueLabel: "This week",
      href: "/workspace/proposals",
    });
  }

  const queue = buildStakeholderActionQueue({
    pendingDecisions: input.pendingDecisions,
    openClarifications: input.clarifications,
    pendingProposals: input.pendingProposals,
    blockedTasks: input.blockedTasks,
    criticalRisks: input.criticalRisks,
  });

  for (const action of queue) {
    if (needs.some((n) => n.id === action.id || n.title === action.action)) continue;
    needs.push({
      id: action.id,
      kind: action.tone === "red" ? "blocker" : action.id.startsWith("decision") ? "decision" : "clarification",
      title: action.action,
      fromStakeholder: action.stakeholder,
      priority:
        action.priority === "high" || action.priority === "low"
          ? action.priority
          : "medium",
      dueLabel: action.dueLabel,
      href: action.href,
    });
  }

  return needs.slice(0, 8);
}

export function buildStakeholderPulse(input: CollaborativeLoopInput): StakeholderPulseItem[] {
  const { governance } = input;

  const items: StakeholderPulseItem[] = [
    {
      label: "Open risks",
      value: governance.openRisks,
      href: "/workspace/governance",
      tone: governance.openRisks > 0 ? "critical" : "neutral",
    },
    {
      label: "Open issues",
      value: governance.openIssues,
      href: "/workspace/governance",
      tone: governance.openIssues > 0 ? "warning" : "neutral",
    },
    {
      label: "Pending decisions",
      value: governance.pendingDecisions,
      href: "/workspace/decisions",
      tone: governance.pendingDecisions > 0 ? "info" : "neutral",
    },
    {
      label: "Open changes",
      value: governance.openChanges,
      href: "/workspace/changes",
      tone: governance.openChanges > 0 ? "warning" : "neutral",
    },
    {
      label: "Blocked tasks",
      value: input.blockedTasks,
      href: "/workspace/tasks",
      tone: input.blockedTasks > 0 ? "critical" : "neutral",
    },
    {
      label: "Clarifications",
      value: input.openClarifications,
      tone: input.openClarifications > 0 ? "warning" : "neutral",
    },
  ];

  if (input.pendingProposals > 0) {
    items.push({
      label: "Pending proposals",
      value: input.pendingProposals,
      href: "/workspace/proposals",
      tone: "info",
    });
  }

  if (input.criticalDefects > 0) {
    items.push({
      label: "Critical defects",
      value: input.criticalDefects,
      tone: "critical",
    });
  }

  return items.slice(0, 6);
}

export function buildCollaborativeLoopSnapshot(
  input: CollaborativeLoopInput,
): CollaborativeLoopSnapshot {
  return {
    persona: input.persona,
    stakeholderLoop: buildPersonaConnections(input),
    teamNeeds: buildTeamNeeds(input),
    pulse: buildStakeholderPulse(input),
  };
}

export function runCollaborativeLoopEngineSmokeTest(): { ok: boolean; personaCount: number } {
  const snapshot = buildCollaborativeLoopSnapshot({
    persona: "pm",
    governance: {
      openRisks: 2,
      openIssues: 1,
      pendingDecisions: 3,
      openChanges: 0,
    },
    blockedTasks: 1,
    openClarifications: 2,
    pendingProposals: 1,
    criticalDefects: 0,
    clarifications: [{ id: "c1", question: "What is the auth scope?", stakeholderRole: "Sponsor" }],
    pendingDecisions: [{ id: "d1", title: "Approve budget", projectId: "p1" }],
    criticalRisks: [{ id: "r1", title: "Vendor delay" }],
  });

  const ok =
    snapshot.stakeholderLoop.length >= 4 &&
    snapshot.teamNeeds.length >= 2 &&
    snapshot.pulse.length >= 4;

  return { ok, personaCount: 7 };
}
