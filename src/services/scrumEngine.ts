/**
 * Scrum Master engine — guided tasks, health, impediments, ceremonies.
 */

export type ScrumGuidedTask = {
  id: string;
  title: string;
  priority: string;
  impact: string;
  ageLabel?: string;
  stakeholders?: string;
};

export type ScrumImpediment = {
  title: string;
  owner: string;
  ageDays: number;
  severity: string;
};

export type CrossRoleScrumImpact = {
  role: string;
  message: string;
  tone: "ready" | "waiting" | "blocked" | "updated";
};

export type ScrumStakeholderRow = {
  stakeholder: string;
  dependency: string;
};

export type AgileMaturityScores = {
  collaboration: number;
  delivery: number;
  quality: number;
  planning: number;
  improvement: number;
};

export function buildScrumGuidedTasks(input: {
  stored: ScrumGuidedTask[];
  impediments: ScrumImpediment[];
  blockedTaskCount: number;
  overdueRetroActions: number;
}): ScrumGuidedTask[] {
  if (input.stored.length > 0) return input.stored.slice(0, 5);

  const tasks: ScrumGuidedTask[] = [];

  for (const imp of input.impediments.slice(0, 2)) {
    tasks.push({
      id: `imp-${imp.title}`,
      title: `Escalate: ${imp.title}`,
      priority: imp.severity === "high" ? "high" : "medium",
      impact: "Sprint completion",
      ageLabel: `${imp.ageDays} days`,
      stakeholders: imp.owner,
    });
  }

  if (input.blockedTaskCount > 0 && tasks.length < 3) {
    tasks.push({
      id: "blocked-stories",
      title: `Resolve ${input.blockedTaskCount} blocked stor${input.blockedTaskCount === 1 ? "y" : "ies"}`,
      priority: "high",
      impact: "Team flow",
    });
  }

  tasks.push({
    id: "sprint-review",
    title: "Prepare sprint review",
    priority: "medium",
    impact: "Stakeholder alignment",
    stakeholders: "Sponsor & Product",
  });

  if (input.overdueRetroActions > 0) {
    tasks.push({
      id: "retro-actions",
      title: "Review retrospective actions",
      priority: "medium",
      impact: `${input.overdueRetroActions} overdue`,
    });
  }

  return tasks.slice(0, 5);
}

export function buildScrumStakeholders(): ScrumStakeholderRow[] {
  return [
    { stakeholder: "Product Manager", dependency: "Backlog readiness" },
    { stakeholder: "PM", dependency: "Delivery visibility" },
    { stakeholder: "Engineer", dependency: "Impediment removal" },
    { stakeholder: "QA", dependency: "Test readiness" },
    { stakeholder: "Sponsor", dependency: "Sprint outcomes" },
  ];
}

export function buildScrumCrossRoleImpact(input: {
  blockedCount: number;
  sprintCompletion: number;
  retroThemes: number;
}): CrossRoleScrumImpact[] {
  return [
    {
      role: "Engineers",
      message: input.blockedCount > 0 ? `${input.blockedCount} blockers need removal` : "Flow healthy",
      tone: input.blockedCount > 0 ? "blocked" : "ready",
    },
    {
      role: "PM",
      message: "Sprint health and delivery visibility updated",
      tone: "updated",
    },
    {
      role: "QA",
      message: input.sprintCompletion >= 70 ? "Test readiness improving" : "Waiting on story completion",
      tone: input.sprintCompletion >= 70 ? "ready" : "waiting",
    },
    {
      role: "Sponsor",
      message: input.blockedCount > 2 ? "Sprint risk elevated" : "Sprint on track",
      tone: input.blockedCount > 2 ? "updated" : "ready",
    },
  ];
}

export function computeAgileMaturityOverall(scores: AgileMaturityScores): number {
  const vals = Object.values(scores);
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
}

export function defaultVelocityHistory(): Array<{ sprint: string; points: number }> {
  return [
    { sprint: "Sprint 20", points: 68 },
    { sprint: "Sprint 21", points: 72 },
    { sprint: "Sprint 22", points: 74 },
    { sprint: "Sprint 23", points: 70 },
    { sprint: "Sprint 24", points: 71 },
  ];
}

type DeliveryBlockerTask = {
  title: string;
  blocked_reason?: string | null;
  updated_at: string;
};

type DeliveryRaidItem = {
  type: string;
  title: string;
  severity: string;
  status: string;
  created_at: string;
};

export function buildImpedimentsFromSignals(input: {
  stored: ScrumImpediment[];
  blockedTasks: DeliveryBlockerTask[];
  raidItems: DeliveryRaidItem[];
}): ScrumImpediment[] {
  if (input.stored.length > 0) return input.stored;

  const now = Date.now();
  const impediments: ScrumImpediment[] = [];

  for (const task of input.blockedTasks) {
    impediments.push({
      title: task.blocked_reason
        ? `${task.title} — ${task.blocked_reason}`
        : task.title,
      owner: "Delivery team",
      ageDays: Math.max(
        1,
        Math.floor((now - new Date(task.updated_at).getTime()) / 86_400_000),
      ),
      severity: "high",
    });
  }

  for (const raid of input.raidItems) {
    if (raid.status === "closed") continue;
    if (!["issue", "dependency", "risk"].includes(raid.type)) continue;

    impediments.push({
      title: raid.title,
      owner: raid.type === "dependency" ? "External" : "Delivery",
      ageDays: Math.max(
        1,
        Math.floor((now - new Date(raid.created_at).getTime()) / 86_400_000),
      ),
      severity:
        raid.severity === "critical" || raid.severity === "high" ? "high" : "medium",
    });
  }

  return impediments.slice(0, 8);
}

export function mapRaidToCrossTeamDeps(
  raidItems: DeliveryRaidItem[],
): Array<{ team: string; dependency: string; status: string }> {
  return raidItems
    .filter((r) => r.type === "dependency" && r.status !== "closed")
    .map((r) => ({
      team: "External",
      dependency: r.title,
      status:
        r.severity === "high" || r.severity === "critical" ? "Delayed" : "Active",
    }));
}

export function aggregateStandupBlockers(
  standups: Array<{ blockers: string | null; today: string; yesterday: string }>,
): { yesterday: string[]; today: string[]; blockers: string[] } {
  const yesterday = standups
    .map((s) => s.yesterday.trim())
    .filter(Boolean)
    .slice(0, 4);
  const today = standups.map((s) => s.today.trim()).filter(Boolean).slice(0, 4);
  const blockers = standups
    .map((s) => s.blockers?.trim())
    .filter((b): b is string => Boolean(b))
    .slice(0, 5);

  return {
    yesterday: yesterday.length ? yesterday : ["No standups logged yet"],
    today: today.length ? today : ["Capture today's focus in standups"],
    blockers,
  };
}

export function computeSprintCompletionFromTasks(tasks: Array<{ status: string }>): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "done").length;
  return Math.round((done / tasks.length) * 100);
}

export function currentSprintLabel(): string {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (Date.now() - start.getTime()) / 86_400_000,
  );
  const sprintNumber = Math.max(1, Math.ceil((dayOfYear + 1) / 14));
  return `Sprint ${sprintNumber}`;
}
