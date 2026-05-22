/**
 * Project signal loader — reads live task telemetry from Supabase.
 *
 * The return type is the contract the intelligence engine consumes.
 * RAID-backed risk counts will be added in PR4 (governance schema).
 */

import { createClient } from "@/lib/supabase/server";
import type { ProjectSignals } from "./intelligenceEngine";

type TaskRow = {
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  blocked_reason: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

const MS_PER_DAY = 86_400_000;
const VELOCITY_WINDOW_DAYS = 14;
const ACTIVITY_WINDOW_DAYS = 7;

export async function loadProjectSignals(projectId: string): Promise<ProjectSignals> {
  const supabase = await createClient();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(
      "title, status, priority, due_date, blocked_reason, completed_at, created_at, updated_at",
    )
    .eq("project_id", projectId);

  if (error) throw error;

  const rows = (tasks ?? []) as TaskRow[];
  if (rows.length === 0) {
    return emptySignals();
  }

  const now = Date.now();
  const today = startOfDay(now);

  const totalTasks = rows.length;
  const doneTasks = rows.filter((t) => t.status === "done");
  const blockedTasks = rows.filter((t) => t.status === "blocked");
  const openTasks = rows.filter((t) => t.status !== "done");

  const overdueTasks = openTasks.filter((t) => {
    if (!t.due_date) return false;
    return startOfDay(new Date(t.due_date).getTime()) < today;
  }).length;

  const blockers = blockedTasks.length;

  // Proxy until raid_items lands in PR4: high/critical open tasks
  const risks = openTasks.filter(
    (t) => t.priority === "high" || t.priority === "critical",
  ).length;

  const standupsComplete = rows.some((t) => {
    const updated = new Date(t.updated_at).getTime();
    return now - updated <= ACTIVITY_WINDOW_DAYS * MS_PER_DAY;
  });

  const velocity = computeVelocity(rows, now);

  const milestoneProgress = doneTasks.length / totalTasks;
  const overdueRatio = overdueTasks / Math.max(openTasks.length, 1);
  const milestoneDelay = overdueTasks > 0 && overdueRatio >= 0.15;

  const dependencyDelay =
    blockedTasks.some((t) =>
      (t.blocked_reason ?? "").toLowerCase().includes("depend"),
    ) || blockers > 0;

  const blockedTaskTitles = blockedTasks
    .slice(0, 5)
    .map((t) => t.title)
    .slice(0, 3);

  const recurringBlockers = topRecurringBlockers(blockedTasks);

  const averageCompletionDays = averageCompletion(doneTasks);

  return {
    overdueTasks,
    totalTasks,
    blockers,
    risks,
    standupsComplete,
    velocity,
    milestoneDelay,
    dependencyDelay,
    blockedTaskTitles,
    recurringBlockers,
    averageCompletionDays,
    milestoneProgress,
  };
}

function emptySignals(): ProjectSignals {
  return {
    overdueTasks: 0,
    totalTasks: 0,
    blockers: 0,
    risks: 0,
    standupsComplete: true,
    velocity: 1,
    milestoneDelay: false,
    dependencyDelay: false,
    blockedTaskTitles: [],
    recurringBlockers: [],
    averageCompletionDays: 3,
    milestoneProgress: 0,
  };
}

function computeVelocity(rows: TaskRow[], now: number): number {
  const windowStart = now - VELOCITY_WINDOW_DAYS * MS_PER_DAY;
  const recent = rows.filter((t) => new Date(t.created_at).getTime() >= windowStart);
  const pool = recent.length > 0 ? recent : rows;

  const done = pool.filter((t) => t.status === "done").length;
  const total = pool.length;
  if (total === 0) return 1;

  return clamp(done / total, 0, 1);
}

function averageCompletion(doneTasks: TaskRow[]): number {
  const durations = doneTasks
    .filter((t) => t.completed_at)
    .map((t) => {
      const start = new Date(t.created_at).getTime();
      const end = new Date(t.completed_at!).getTime();
      return Math.max(0, (end - start) / MS_PER_DAY);
    });

  if (durations.length === 0) return 3;
  return durations.reduce((a, b) => a + b, 0) / durations.length;
}

function topRecurringBlockers(blockedTasks: TaskRow[]): string[] {
  const counts = new Map<string, number>();
  for (const task of blockedTasks) {
    const reason = (task.blocked_reason ?? "").trim();
    if (!reason) continue;
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }

  const recurring = [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([reason]) => reason);

  return recurring.slice(0, 2);
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
