/**
 * Engineer engine — guided tasks, traceability, architecture, cross-role impact.
 */

import { DEFAULT_ARCHITECTURE_LAYERS } from "@/lib/engineer/constants";

export type EngineerGuidedTask = {
  id: string;
  title: string;
  priority: string;
  impact: string;
  dependsOn?: string;
  dueLabel?: string;
  storyCode?: string;
};

export type EngineerDependencyRow = {
  name: string;
  owner: string;
  status: string;
};

export type EngineerArchitectureNode = {
  layer: string;
  owner: string;
  status: string;
};

export type EngineerTraceRow = {
  businessGoal: string;
  feature: string;
  story: string;
  storyCode: string | null;
  task: string | null;
  api: string | null;
  test: string | null;
};

export type CrossRoleEngineerImpact = {
  role: string;
  message: string;
  tone: "ready" | "waiting" | "blocked" | "updated";
};

export type EngineerStakeholderRow = {
  stakeholder: string;
  dependency: string;
};

export function buildEngineerGuidedTasks(input: {
  stored: EngineerGuidedTask[];
  assignedTasks: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    blocked_reason?: string | null;
    due_date?: string | null;
  }>;
  blockedCount: number;
}): EngineerGuidedTask[] {
  if (input.stored.length > 0) return input.stored.slice(0, 5);

  const tasks: EngineerGuidedTask[] = [];

  for (const t of input.assignedTasks.filter((x) => x.status === "blocked").slice(0, 1)) {
    tasks.push({
      id: t.id,
      title: `Unblock: ${t.title}`,
      priority: "high",
      impact: "Sprint delivery",
      dependsOn: t.blocked_reason ?? "Dependency",
      dueLabel: "Today",
    });
  }

  for (const t of input.assignedTasks
    .filter((x) => x.status === "todo" || x.status === "in_progress")
    .slice(0, 2)) {
    tasks.push({
      id: t.id,
      title: t.title,
      priority: t.priority,
      impact: t.status === "blocked" ? "Blocked" : "In sprint",
      dueLabel: t.due_date ? "Due soon" : undefined,
    });
  }

  if (input.blockedCount > 0 && tasks.length < 3) {
    tasks.push({
      id: "review-deps",
      title: "Review blocked dependencies",
      priority: "high",
      impact: `${input.blockedCount} blocked item${input.blockedCount === 1 ? "" : "s"}`,
      dependsOn: "Auth API",
    });
  }

  tasks.push({
    id: "pr-review",
    title: "Review open pull requests",
    priority: "medium",
    impact: "Release candidate",
    dueLabel: "This week",
  });

  return tasks.slice(0, 5);
}

export function buildEngineerStakeholders(): EngineerStakeholderRow[] {
  return [
    { stakeholder: "Product Manager", dependency: "Feature delivery" },
    { stakeholder: "Project Manager", dependency: "Timeline" },
    { stakeholder: "QA", dependency: "Testing" },
    { stakeholder: "Sponsor", dependency: "Benefits" },
    { stakeholder: "Operations", dependency: "Stability" },
  ];
}

export function buildEngineerCrossRoleImpact(input: {
  blockedTasks: number;
  storiesInProgress: number;
  openPrs: number;
}): CrossRoleEngineerImpact[] {
  return [
    {
      role: "QA",
      message:
        input.blockedTasks > 0
          ? "Waiting on blocked engineering tasks"
          : "Ready for test execution when stories complete",
      tone: input.blockedTasks > 0 ? "blocked" : "ready",
    },
    {
      role: "Project Manager",
      message: `${input.storiesInProgress} stories in progress · sprint updated on merge`,
      tone: "waiting",
    },
    {
      role: "Product Manager",
      message: "Feature delivery signals flow from story completion",
      tone: "updated",
    },
    {
      role: "Sponsor",
      message: "Benefits forecast updates when releases ship",
      tone: "ready",
    },
  ];
}

export function defaultArchitectureNodes(
  stack?: Record<string, string[]>,
): EngineerArchitectureNode[] {
  const frontend = stack?.frontend?.[0] ?? "Next.js";
  return DEFAULT_ARCHITECTURE_LAYERS.map((layer, i) => ({
    layer: layer === "Frontend" ? `${layer} (${frontend})` : layer,
    owner: i < 2 ? "Engineering" : i < 5 ? "Platform" : "DevOps",
    status: i === 3 ? "watch" : "healthy",
  }));
}

export function mapTraceRows(
  matrix: Array<{
    objective: string;
    requirement: string;
    reqCode: string;
    story: string | null;
    storyCode: string | null;
    task: string | null;
    test: string | null;
  }>,
): EngineerTraceRow[] {
  return matrix.slice(0, 8).map((row) => ({
    businessGoal: row.objective,
    feature: row.requirement,
    story: row.story ?? row.reqCode,
    storyCode: row.storyCode,
    task: row.task,
    api: row.storyCode ? `GET /api/${row.storyCode.toLowerCase().replace(/-/g, "/")}` : null,
    test: row.test,
  }));
}
