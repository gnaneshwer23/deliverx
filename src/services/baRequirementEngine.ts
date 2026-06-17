/**
 * BA requirement engine — pure compute for quality, traceability, cross-role impact.
 */

export type RequirementQuality = {
  clarity: number;
  completeness: number;
  testability: number;
  alignment: number;
  riskLevel: "low" | "medium" | "high";
};

export type RequirementRow = {
  id: string;
  req_code: string;
  type: string;
  title: string;
  description: string;
  status: string;
  quality: RequirementQuality & Record<string, unknown>;
  owner_role: string | null;
  flags: string[];
};

export type ClarificationRow = {
  id: string;
  question: string;
  status: string;
  priority: string;
  stakeholder_role: string | null;
  blocks: string | null;
  due_date: string | null;
};

export type StoryRow = {
  id: string;
  story_code: string;
  title: string;
  story: string;
  status: string;
  requirement_id: string | null;
};

export type TraceMatrixRow = {
  objective: string;
  requirement: string;
  reqCode: string;
  story: string | null;
  storyCode: string | null;
  task: string | null;
  test: string | null;
  status: string;
};

export type CrossRoleImpact = {
  role: string;
  message: string;
  tone: "ready" | "waiting" | "blocked" | "pending";
};

export type GuidedTask = {
  id: string;
  title: string;
  priority: string;
  stakeholder: string;
  blocks: string | null;
  dueLabel: string;
  kind: "clarification" | "review" | "validation";
};

export function passesQualityGate(quality: RequirementQuality): {
  ok: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  if ((quality.clarity ?? 0) < 70) reasons.push("clarity below 70%");
  if ((quality.completeness ?? 0) < 70) reasons.push("completeness below 70%");
  if ((quality.testability ?? 0) < 60) reasons.push("testability below 60%");
  return { ok: reasons.length === 0, reasons };
}

export function computeTraceabilityScore(input: {
  requirements: number;
  approvedRequirements: number;
  stories: number;
  linkedTasks: number;
}): number {
  if (input.requirements === 0) return 0;
  const reqCoverage = input.approvedRequirements / input.requirements;
  const storyCoverage = Math.min(1, input.stories / Math.max(1, input.requirements));
  const taskCoverage = Math.min(1, input.linkedTasks / Math.max(1, input.stories));
  return Math.round((reqCoverage * 0.4 + storyCoverage * 0.35 + taskCoverage * 0.25) * 100);
}

export function computeDeliveryImpact(pendingClarifications: number, blockedEngineering: number): {
  label: "Low" | "Medium" | "High";
  tone: "green" | "amber" | "red";
} {
  if (pendingClarifications >= 8 || blockedEngineering >= 3) {
    return { label: "High", tone: "red" };
  }
  if (pendingClarifications >= 4 || blockedEngineering >= 1) {
    return { label: "Medium", tone: "amber" };
  }
  return { label: "Low", tone: "green" };
}

export function buildGuidedTasks(clarifications: ClarificationRow[]): GuidedTask[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return clarifications
    .filter((c) => c.status === "open")
    .sort(
      (a, b) =>
        (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 9) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 9),
    )
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      title: c.question.length > 60 ? `${c.question.slice(0, 57)}…` : c.question,
      priority: c.priority,
      stakeholder: c.stakeholder_role ?? "Stakeholder",
      blocks: c.blocks,
      dueLabel: c.due_date ? formatDue(c.due_date) : "This week",
      kind: "clarification" as const,
    }));
}

export function buildCrossRoleImpact(input: {
  storiesReady: number;
  requirementsReadiness: number;
  openClarifications: number;
  pendingDecisions: number;
}): CrossRoleImpact[] {
  return [
    {
      role: "Product Manager",
      message: `${input.storiesReady} stories ready for prioritisation.`,
      tone: input.storiesReady > 0 ? "ready" : "waiting",
    },
    {
      role: "Project Manager",
      message: `Requirements readiness: ${input.requirementsReadiness}% · Open clarification items: ${input.openClarifications}`,
      tone: input.openClarifications > 5 ? "blocked" : "waiting",
    },
    {
      role: "Engineer",
      message: `${Math.max(0, input.storiesReady - 2)} stories ready for development.`,
      tone: input.storiesReady >= 3 ? "ready" : "waiting",
    },
    {
      role: "QA",
      message: `${Math.round(input.requirementsReadiness * 0.85)}% requirements ready for testing.`,
      tone: input.requirementsReadiness >= 70 ? "ready" : "waiting",
    },
    {
      role: "Sponsor",
      message: `${input.pendingDecisions} business decisions pending approval.`,
      tone: input.pendingDecisions > 0 ? "pending" : "ready",
    },
  ];
}

export function buildStakeholderConnections(input: {
  clarificationsOpen: number;
  storiesReady: number;
  requirementsApproved: number;
  requirementsTotal: number;
}): Array<{ stakeholder: string; dependency: string; status: string; tone: string }> {
  const readiness =
    input.requirementsTotal > 0
      ? Math.round((input.requirementsApproved / input.requirementsTotal) * 100)
      : 0;

  return [
    {
      stakeholder: "Founder / Sponsor",
      dependency: "Business approval",
      status: input.clarificationsOpen > 2 ? "Pending" : "Ready",
      tone: input.clarificationsOpen > 2 ? "amber" : "green",
    },
    {
      stakeholder: "Product Manager",
      dependency: "Prioritisation",
      status: input.storiesReady > 0 ? "Ready" : "Waiting",
      tone: input.storiesReady > 0 ? "green" : "slate",
    },
    {
      stakeholder: "Project Manager",
      dependency: "Delivery planning",
      status: readiness >= 60 ? "Ready" : "Waiting",
      tone: readiness >= 60 ? "green" : "slate",
    },
    {
      stakeholder: "Engineer",
      dependency: "Technical implementation",
      status: input.clarificationsOpen > 0 ? "Blocked" : "Ready",
      tone: input.clarificationsOpen > 0 ? "red" : "green",
    },
    {
      stakeholder: "QA",
      dependency: "Test creation",
      status: readiness >= 50 ? "Ready" : "Waiting",
      tone: readiness >= 50 ? "green" : "slate",
    },
    {
      stakeholder: "Scrum Master",
      dependency: "Sprint planning",
      status: input.storiesReady >= 5 ? "Ready" : "Waiting",
      tone: input.storiesReady >= 5 ? "green" : "slate",
    },
  ];
}

function formatDue(iso: string): string {
  const due = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
