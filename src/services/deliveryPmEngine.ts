/**
 * Delivery PM engine — health dimensions, guided tasks, cross-role impact.
 */

import { DEFAULT_MILESTONE_PHASES } from "@/lib/delivery-pm/constants";

export type HealthTone = "green" | "amber" | "red";

export type DeliveryHealthDimension = {
  label: string;
  tone: HealthTone;
};

export type PmGuidedTask = {
  id: string;
  title: string;
  priority: string;
  impact: string;
  owner: string;
  stakeholders: string;
  dueLabel?: string;
};

export type CrossRoleDeliveryImpact = {
  role: string;
  message: string;
  tone: "ready" | "waiting" | "blocked" | "updated";
};

export type StakeholderDeliveryRow = {
  stakeholder: string;
  status: string;
  action: string;
  tone: HealthTone;
};

export function toneFromScore(score: number): HealthTone {
  if (score >= 75) return "green";
  if (score >= 55) return "amber";
  return "red";
}

export function buildDeliveryHealth(input: {
  healthScore: number;
  timelineComplete: number;
  budgetUsedPct: number;
  openHighRisks: number;
  pendingDecisions: number;
  benefitsPct: number;
  alignmentScore: number;
  insight?: string;
}): { dimensions: DeliveryHealthDimension[]; insight: string } {
  const dimensions: DeliveryHealthDimension[] = [
    { label: "Scope", tone: toneFromScore(input.alignmentScore) },
    { label: "Timeline", tone: toneFromScore(input.timelineComplete) },
    {
      label: "Budget",
      tone: input.budgetUsedPct > 95 ? "red" : input.budgetUsedPct > 80 ? "amber" : "green",
    },
    { label: "Quality", tone: toneFromScore(input.healthScore) },
    {
      label: "Risks",
      tone: input.openHighRisks >= 3 ? "red" : input.openHighRisks >= 1 ? "amber" : "green",
    },
    {
      label: "Stakeholder Engagement",
      tone: input.pendingDecisions >= 3 ? "amber" : "green",
    },
    { label: "Benefits", tone: toneFromScore(input.benefitsPct) },
  ];

  const insight =
    input.insight ??
    (input.openHighRisks > 0
      ? `Timeline risk elevated — ${input.openHighRisks} high-severity risk${input.openHighRisks === 1 ? "" : "s"} open.`
      : "Delivery signals within normal range.");

  return { dimensions, insight };
}

export function buildPmGuidedTasks(input: {
  stored: PmGuidedTask[];
  criticalRisks: Array<{ id: string; title: string; severity: string; owner?: string }>;
  pendingDecisions: Array<{ id: string; title: string }>;
  blockedTasks: number;
  overdueMilestones: Array<{ id: string; title: string }>;
  pendingProposals: number;
}): PmGuidedTask[] {
  if (input.stored.length > 0) {
    return input.stored.slice(0, 5);
  }

  const tasks: PmGuidedTask[] = [];

  for (const risk of input.criticalRisks.slice(0, 2)) {
    tasks.push({
      id: risk.id,
      title: `Review critical risk: ${risk.title}`,
      priority: risk.severity === "high" ? "high" : "medium",
      impact: "Go-live risk",
      owner: risk.owner ?? "Engineering",
      stakeholders: "Sponsor",
    });
  }

  if (input.pendingDecisions.length > 0) {
    tasks.push({
      id: input.pendingDecisions[0].id,
      title: `Decision pending: ${input.pendingDecisions[0].title}`,
      priority: "high",
      impact: "Governance",
      owner: "PM",
      stakeholders: "Sponsor",
    });
  }

  if (input.blockedTasks > 0) {
    tasks.push({
      id: "blocked-tasks",
      title: `Unblock ${input.blockedTasks} task${input.blockedTasks === 1 ? "" : "s"}`,
      priority: "high",
      impact: "Sprint delivery",
      owner: "Engineering",
      stakeholders: "Product, Engineering",
    });
  }

  if (input.overdueMilestones.length > 0) {
    tasks.push({
      id: input.overdueMilestones[0].id,
      title: `Milestone at risk: ${input.overdueMilestones[0].title}`,
      priority: "medium",
      impact: "Timeline",
      owner: "PM",
      stakeholders: "Sponsor",
      dueLabel: "This week",
    });
  }

  if (input.pendingProposals > 0) {
    tasks.push({
      id: "proposals",
      title: "Review proposal queue",
      priority: "medium",
      impact: "Meeting follow-through",
      owner: "PM",
      stakeholders: "Team",
    });
  }

  tasks.push({
    id: "steering-report",
    title: "Prepare steering committee report",
    priority: "medium",
    impact: "Governance",
    owner: "PM",
    stakeholders: "Sponsor",
    dueLabel: "Friday",
  });

  return tasks.slice(0, 5);
}

export function buildDeliveryStakeholders(input: {
  pendingDecisions: number;
  blockedTasks: number;
  openClarifications: number;
}): StakeholderDeliveryRow[] {
  return [
    {
      stakeholder: "Sponsor",
      status: input.pendingDecisions > 0 ? "Pending approval" : "Active",
      action: input.pendingDecisions > 0 ? "Review budget / decisions" : "Monitor progress",
      tone: input.pendingDecisions > 0 ? "amber" : "green",
    },
    {
      stakeholder: "Product Manager",
      status: "Active",
      action: "Prioritise backlog",
      tone: "green",
    },
    {
      stakeholder: "BA",
      status: input.openClarifications > 0 ? "Active" : "Ready",
      action: "Clarify requirements",
      tone: input.openClarifications > 3 ? "amber" : "green",
    },
    {
      stakeholder: "Engineer",
      status: input.blockedTasks > 0 ? "Blocked" : "Active",
      action: input.blockedTasks > 0 ? "Resolve dependencies" : "Sprint execution",
      tone: input.blockedTasks > 0 ? "red" : "green",
    },
    {
      stakeholder: "QA",
      status: "Ready",
      action: "Test execution",
      tone: "green",
    },
    {
      stakeholder: "Scrum Master",
      status: "Active",
      action: "Sprint facilitation",
      tone: "green",
    },
  ];
}

export function buildDeliveryCrossRoleImpact(input: {
  criticalRisks: number;
  milestoneProgress: number;
  pendingDecisions: number;
  blockedTasks: number;
}): CrossRoleDeliveryImpact[] {
  return [
    {
      role: "Sponsor",
      message: `${input.pendingDecisions} pending decisions · ${input.criticalRisks} critical risks`,
      tone: input.pendingDecisions > 0 ? "blocked" : "ready",
    },
    {
      role: "Product Manager",
      message: "Delivery constraints and timeline updates shared",
      tone: input.blockedTasks > 0 ? "updated" : "waiting",
    },
    {
      role: "Engineers",
      message: `${input.blockedTasks} blocked tasks · check dependencies`,
      tone: input.blockedTasks > 0 ? "blocked" : "ready",
    },
    {
      role: "QA",
      message: `Release readiness tied to ${input.milestoneProgress}% milestone progress`,
      tone: "waiting",
    },
    {
      role: "Founder",
      message: "Portfolio health and investment exposure updated",
      tone: input.criticalRisks > 2 ? "updated" : "ready",
    },
  ];
}

export function mapMilestonesToPhases(
  milestones: Array<{ title: string; status: string }>,
): Array<{ phase: string; status: "done" | "active" | "pending" }> {
  if (milestones.length === 0) {
    return DEFAULT_MILESTONE_PHASES.map((phase, i) => ({
      phase,
      status: (i === 0 ? "active" : "pending") as "done" | "active" | "pending",
    }));
  }

  return milestones.slice(0, 8).map((m) => ({
    phase: m.title,
    status:
      m.status === "completed"
        ? "done"
        : m.status === "at_risk" || m.status === "slipped"
          ? "active"
          : m.status === "planned"
            ? "pending"
            : "active",
  }));
}
