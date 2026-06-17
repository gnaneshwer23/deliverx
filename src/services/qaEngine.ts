/**
 * QA engine — guided tasks, defects, traceability, release readiness.
 */

export type QaGuidedTask = {
  id: string;
  title: string;
  priority: string;
  impact: string;
  dueLabel?: string;
  stakeholders?: string;
};

export type QaDefect = {
  code: string;
  title: string;
  severity: string;
  owner: string;
  status: string;
};

export type QaTestCase = {
  code: string;
  title: string;
  priority: string;
  linkedStory: string;
  automationCandidate: boolean;
  type: string;
};

export type QaTraceRow = {
  objective: string;
  requirement: string;
  storyCode: string;
  testCode: string;
  defectCode: string;
  release: string;
};

export type QaUatRow = {
  group: string;
  completionPct: number;
};

export type CrossRoleQaImpact = {
  role: string;
  message: string;
  tone: "ready" | "waiting" | "blocked" | "updated";
};

export type QaStakeholderRow = {
  stakeholder: string;
  dependency: string;
};

export function buildQaGuidedTasks(input: {
  stored: QaGuidedTask[];
  criticalDefects: number;
  releaseBlocked: boolean;
}): QaGuidedTask[] {
  if (input.stored.length > 0) return input.stored.slice(0, 5);

  const tasks: QaGuidedTask[] = [];

  if (input.releaseBlocked || input.criticalDefects > 0) {
    tasks.push({
      id: "validate-api",
      title: "Validate Reports API",
      priority: "high",
      impact: "Blocks release",
      dueLabel: "Today",
      stakeholders: "PM, Sponsor",
    });
  }

  if (input.criticalDefects > 0) {
    tasks.push({
      id: "retest-bug",
      title: "Retest defect BUG-142",
      priority: "high",
      impact: "Critical · Backend Team",
      dueLabel: "Today",
    });
  }

  tasks.push({
    id: "regression",
    title: "Run regression suite",
    priority: "medium",
    impact: "Release confidence",
  });

  tasks.push({
    id: "uat-check",
    title: "Review UAT completion gaps",
    priority: "medium",
    impact: "Operations sign-off",
    stakeholders: "Operations, PM",
  });

  return tasks.slice(0, 5);
}

export function buildQaStakeholders(): QaStakeholderRow[] {
  return [
    { stakeholder: "Engineer", dependency: "Fix defects" },
    { stakeholder: "Product Manager", dependency: "Quality acceptance" },
    { stakeholder: "PM", dependency: "Release approval" },
    { stakeholder: "Sponsor", dependency: "Business confidence" },
    { stakeholder: "Operations", dependency: "Stable production" },
  ];
}

export function buildQaCrossRoleImpact(input: {
  criticalDefects: number;
  releaseReadiness: number;
  releaseApproved: boolean;
}): CrossRoleQaImpact[] {
  if (input.releaseApproved) {
    return [
      { role: "PM", message: "Release dashboard updated", tone: "updated" },
      { role: "Sponsor", message: "Business confidence refreshed", tone: "updated" },
      { role: "Operations", message: "Production runbook prepared", tone: "ready" },
      { role: "Engineers", message: "Post-release monitoring active", tone: "ready" },
    ];
  }

  return [
    {
      role: "Engineers",
      message:
        input.criticalDefects > 0
          ? `${input.criticalDefects} critical defect${input.criticalDefects === 1 ? "" : "s"} need fixes`
          : "No critical blockers",
      tone: input.criticalDefects > 0 ? "blocked" : "ready",
    },
    {
      role: "PM",
      message:
        input.releaseReadiness >= 80
          ? "Release candidate approaching readiness"
          : "Release risk elevated",
      tone: input.releaseReadiness >= 80 ? "updated" : "waiting",
    },
    {
      role: "Sponsor",
      message:
        input.criticalDefects > 0 ? "Production risk requires attention" : "Quality on track",
      tone: input.criticalDefects > 0 ? "blocked" : "ready",
    },
    {
      role: "Scrum Master",
      message: "Sprint test readiness tracked",
      tone: "updated",
    },
  ];
}

export function defaultQaUatRows(): QaUatRow[] {
  return [
    { group: "Business Users", completionPct: 82 },
    { group: "Operations", completionPct: 65 },
    { group: "Customers", completionPct: 91 },
  ];
}

export function defaultQaDefects(): QaDefect[] {
  return [
    { code: "BUG-142", title: "Auth token expiry", severity: "critical", owner: "Backend", status: "open" },
    { code: "BUG-167", title: "Export layout break", severity: "medium", owner: "Frontend", status: "fixing" },
  ];
}
