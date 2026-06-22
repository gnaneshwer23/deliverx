/**
 * R8 — Sprint metrics from workstreams + tasks (no illustrative data).
 */

import type { ScrumBurndownPoint } from "@/lib/scrum-health-kpis";

export type SprintTaskSnapshot = {
  id: string;
  status: string;
  assignee_id: string | null;
  completed_at: string | null;
  created_at: string;
  workstream_id: string | null;
};

export type SprintWorkstreamSnapshot = {
  id: string;
  name: string;
  status: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SprintScope = {
  label: string;
  workstreamId: string | null;
  ownerId: string | null;
  startDate: Date;
  endDate: Date;
  sprintDays: number;
  daysRemaining: number;
  tasks: SprintTaskSnapshot[];
};

const MS_PER_DAY = 86_400_000;
const DEFAULT_SPRINT_DAYS = 14;

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function daysBetween(start: Date, end: Date): number {
  return Math.max(0, Math.round((startOfUtcDay(end).getTime() - startOfUtcDay(start).getTime()) / MS_PER_DAY));
}

/** Resolve current sprint from active workstream, else rolling window on project tasks. */
export function resolveSprintScope(input: {
  workstreams: SprintWorkstreamSnapshot[];
  tasks: SprintTaskSnapshot[];
  now?: Date;
  sprintDays?: number;
}): SprintScope | null {
  const now = input.now ?? new Date();
  const sprintDays = input.sprintDays ?? DEFAULT_SPRINT_DAYS;

  const active =
    input.workstreams.find((w) => w.status === "active") ??
    input.workstreams.find((w) => w.status === "planned");

  if (active) {
    const startDate = startOfUtcDay(new Date(active.created_at));
    const endDate = new Date(startDate.getTime() + sprintDays * MS_PER_DAY);
    const scopedTasks = input.tasks.filter((t) => t.workstream_id === active.id);
    const daysRemaining = Math.max(0, daysBetween(now, endDate));

    return {
      label: active.name,
      workstreamId: active.id,
      ownerId: active.owner_id,
      startDate,
      endDate,
      sprintDays,
      daysRemaining,
      tasks: scopedTasks.length > 0 ? scopedTasks : input.tasks,
    };
  }

  if (input.tasks.length === 0) return null;

  const endDate = startOfUtcDay(now);
  const startDate = new Date(endDate.getTime() - sprintDays * MS_PER_DAY);
  const scopedTasks = input.tasks.filter((t) => new Date(t.created_at) >= startDate);

  return {
    label: `Sprint (${sprintDays}d window)`,
    workstreamId: null,
    ownerId: null,
    startDate,
    endDate,
    sprintDays,
    daysRemaining: Math.max(0, daysBetween(now, endDate)),
    tasks: scopedTasks.length > 0 ? scopedTasks : input.tasks,
  };
}

/** One story point per in-scope task (no story_points column yet). */
export function computeSprintPoints(tasks: SprintTaskSnapshot[]): {
  plannedPoints: number;
  completedPoints: number;
} {
  const plannedPoints = tasks.length;
  const completedPoints = tasks.filter((t) => t.status === "done").length;
  return { plannedPoints, completedPoints };
}

function isDoneByEndOfDay(task: SprintTaskSnapshot, dayEnd: Date): boolean {
  if (task.status !== "done") return false;
  if (!task.completed_at) return true;
  return new Date(task.completed_at).getTime() <= dayEnd.getTime();
}

/** Daily remaining scope from task completion timestamps. */
export function buildBurndownFromTasks(input: {
  tasks: SprintTaskSnapshot[];
  startDate: Date;
  sprintDays: number;
  now?: Date;
}): ScrumBurndownPoint[] {
  const { tasks, startDate, sprintDays } = input;
  const now = input.now ?? new Date();
  const plannedPoints = tasks.length;

  if (plannedPoints <= 0 || sprintDays <= 0) return [];

  const elapsedDays = Math.min(sprintDays, daysBetween(startDate, now));
  const points: ScrumBurndownPoint[] = [];

  for (let day = 0; day <= elapsedDays; day++) {
    const dayEnd = new Date(startDate.getTime() + day * MS_PER_DAY + MS_PER_DAY - 1);
    const doneByDay = tasks.filter((t) => isDoneByEndOfDay(t, dayEnd)).length;
    const remaining = Math.max(0, plannedPoints - doneByDay);
    const ideal = Math.round(plannedPoints * (1 - day / sprintDays));
    points.push({
      label: day === 0 ? "Start" : `D${day}`,
      remaining,
      ideal,
    });
  }

  return points;
}

/** Velocity trend from completed workstreams (done tasks per sprint). */
export function buildVelocityFromWorkstreams(input: {
  workstreams: SprintWorkstreamSnapshot[];
  tasks: SprintTaskSnapshot[];
  limit?: number;
}): Array<{ sprint: string; points: number }> {
  const limit = input.limit ?? 5;
  const completed = input.workstreams
    .filter((w) => w.status === "completed")
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, limit)
    .reverse();

  if (completed.length > 0) {
    return completed.map((w) => ({
      sprint: w.name,
      points: input.tasks.filter((t) => t.workstream_id === w.id && t.status === "done").length,
    }));
  }

  return buildRollingVelocity(input.tasks, limit);
}

function buildRollingVelocity(
  tasks: SprintTaskSnapshot[],
  windows: number,
): Array<{ sprint: string; points: number }> {
  const doneTasks = tasks
    .filter((t) => t.status === "done" && t.completed_at)
    .sort(
      (a, b) =>
        new Date(a.completed_at as string).getTime() -
        new Date(b.completed_at as string).getTime(),
    );

  if (doneTasks.length === 0) return [];

  const windowMs = DEFAULT_SPRINT_DAYS * MS_PER_DAY;
  const now = Date.now();
  const buckets: Array<{ sprint: string; points: number }> = [];

  for (let i = windows - 1; i >= 0; i--) {
    const windowEnd = now - i * windowMs;
    const windowStart = windowEnd - windowMs;
    const points = doneTasks.filter((t) => {
      const ts = new Date(t.completed_at as string).getTime();
      return ts > windowStart && ts <= windowEnd;
    }).length;

    if (points > 0 || i === 0) {
      buckets.push({
        sprint: `Window ${windows - i}`,
        points,
      });
    }
  }

  return buckets.filter((b) => b.points > 0);
}

/** Sprint membership: assignees on scoped tasks plus workstream owner. */
export function collectSprintMemberIds(scope: SprintScope): string[] {
  const ids = new Set<string>();
  if (scope.ownerId) ids.add(scope.ownerId);
  for (const task of scope.tasks) {
    if (task.assignee_id) ids.add(task.assignee_id);
  }
  return [...ids];
}

export type PmSprintCapacityMember = {
  id: string;
  name: string;
  role: string;
  assignedCount: number;
  loadPct: number;
  tone: "healthy" | "watch" | "at-risk";
  placeholder?: boolean;
};

const ACTIVE_TASK_STATUSES = new Set(["todo", "in_progress", "in_review", "blocked"]);

/** Team load from sprint-scoped task assignees (no placeholder rows). */
export function buildPmSprintCapacityRows(input: {
  scope: SprintScope | null;
  members: Array<{ id: string; name: string | null; email: string | null; role: string | null }>;
  roleLabels?: Record<string, string>;
}): { members: PmSprintCapacityMember[]; avgLoadPct: number | null } {
  const roleLabels = input.roleLabels ?? {};
  if (!input.scope) {
    return { members: [], avgLoadPct: null };
  }

  const sprintMemberIds = new Set(collectSprintMemberIds(input.scope));
  const memberById = new Map(input.members.map((m) => [m.id, m]));
  const activeTasks = input.scope.tasks.filter((t) => ACTIVE_TASK_STATUSES.has(t.status));
  const byAssignee = new Map<string, number>();

  for (const task of activeTasks) {
    if (!task.assignee_id || !sprintMemberIds.has(task.assignee_id)) continue;
    byAssignee.set(task.assignee_id, (byAssignee.get(task.assignee_id) ?? 0) + 1);
  }

  const memberIds = [...sprintMemberIds].filter(
    (id) => byAssignee.has(id) || id === input.scope?.ownerId,
  );

  if (memberIds.length === 0 || byAssignee.size === 0) {
    return { members: [], avgLoadPct: null };
  }

  const maxTasks = Math.max(...[...byAssignee.values()], 1);
  const rows: PmSprintCapacityMember[] = memberIds
    .map((id) => {
      const member = memberById.get(id);
      const count = byAssignee.get(id) ?? 0;
      const loadPct =
        count > 0 ? Math.min(100, Math.round((count / Math.max(maxTasks, 3)) * 100)) : 0;
      const roleKey = member?.role ?? "";
      return {
        id,
        name: member?.name ?? member?.email ?? "Teammate",
        role: roleLabels[roleKey] ?? roleKey ?? "Team",
        assignedCount: count,
        loadPct,
        tone: (loadPct >= 90 ? "at-risk" : loadPct >= 70 ? "watch" : "healthy") as PmSprintCapacityMember["tone"],
      };
    })
    .filter((m) => m.assignedCount > 0)
    .sort((a, b) => b.assignedCount - a.assignedCount);

  const avgLoadPct =
    rows.length > 0
      ? Math.round(rows.reduce((sum, m) => sum + m.loadPct, 0) / rows.length)
      : null;

  return { members: rows.slice(0, 8), avgLoadPct };
}

const CEREMONY_KEYWORDS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bplanning\b/i, label: "Sprint Planning" },
  { pattern: /\bstand\s?up\b|\bdaily\b/i, label: "Daily Standup" },
  { pattern: /\brefin(e|ement)\b/i, label: "Refinement" },
  { pattern: /\breview\b|\bdemo\b/i, label: "Sprint Review" },
  { pattern: /\bretro(spective)?\b/i, label: "Retrospective" },
];

/** Map scheduled meeting titles to agile ceremonies when matched. */
export function deriveCeremoniesFromMeetings(
  meetings: Array<{ title: string; scheduled_at: string | null }>,
): string[] {
  const found = new Set<string>();
  for (const meeting of meetings) {
    for (const { pattern, label } of CEREMONY_KEYWORDS) {
      if (pattern.test(meeting.title)) found.add(label);
    }
  }
  return [...found];
}

export function defaultCeremonyLabels(): string[] {
  return ["Sprint Planning", "Daily Standup", "Refinement", "Sprint Review", "Retrospective"];
}
