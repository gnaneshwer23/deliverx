/**
 * Project signal loader — reads live task + RAID telemetry from Supabase.
 */

import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
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

type RaidRow = {
  type: string;
  title: string;
  status: string;
  severity: string;
};

const MS_PER_DAY = 86_400_000;
const VELOCITY_WINDOW_DAYS = 14;
const ACTIVITY_WINDOW_DAYS = 7;

export async function loadProjectSignals(
  projectId: string,
  client?: SupabaseClient,
): Promise<ProjectSignals> {
  const supabase = client ?? (await createClient());

  const [{ data: tasks, error: taskErr }, { data: raid, error: raidErr }, standupToday] =
    await Promise.all([
      supabase
        .from("tasks")
        .select(
          "title, status, priority, due_date, blocked_reason, completed_at, created_at, updated_at",
        )
        .eq("project_id", projectId),
      supabase
        .from("raid_items")
        .select("type, title, status, severity")
        .eq("project_id", projectId)
        .in("status", ["open", "mitigated"]),
      supabase
        .from("standups")
        .select("id, today")
        .eq("project_id", projectId)
        .eq("standup_date", new Date().toISOString().slice(0, 10))
        .limit(1)
        .maybeSingle(),
    ]);

  if (taskErr) throw taskErr;
  if (raidErr) throw raidErr;

  const taskRows = (tasks ?? []) as TaskRow[];
  const raidRows = (raid ?? []) as RaidRow[];

  if (taskRows.length === 0 && raidRows.length === 0) {
    return emptySignals();
  }

  const now = Date.now();
  const today = startOfDay(now);

  const totalTasks = taskRows.length;
  const doneTasks = taskRows.filter((t) => t.status === "done");
  const blockedTasks = taskRows.filter((t) => t.status === "blocked");
  const openTasks = taskRows.filter((t) => t.status !== "done");

  const overdueTasks = openTasks.filter((t) => {
    if (!t.due_date) return false;
    return startOfDay(new Date(t.due_date).getTime()) < today;
  }).length;

  const openRaid = raidRows.filter((r) => r.status === "open");
  const openRisks = openRaid.filter((r) => r.type === "risk").length;
  const openIssueItems = openRaid.filter((r) => r.type === "issue");
  const openDepItems = openRaid.filter((r) => r.type === "dependency");
  const openIssues = openIssueItems.length;
  const openDeps = openDepItems.length;

  const blockers = blockedTasks.length + openIssues + openDeps;

  const risks =
    openRisks +
    openRaid.filter(
      (r) => r.type === "issue" && (r.severity === "high" || r.severity === "critical"),
    ).length;

  const standupsComplete =
    Boolean(standupToday.data?.today?.trim()) ||
    (taskRows.length === 0 && raidRows.length === 0) ||
    taskRows.some((t) => {
      const updated = new Date(t.updated_at).getTime();
      return now - updated <= ACTIVITY_WINDOW_DAYS * MS_PER_DAY;
    });

  const velocity = taskRows.length > 0 ? computeVelocity(taskRows, now) : 1;

  const milestoneProgress =
    totalTasks > 0 ? doneTasks.length / totalTasks : openRaid.length === 0 ? 1 : 0.5;

  const overdueRatio = overdueTasks / Math.max(openTasks.length, 1);
  const milestoneDelay = overdueTasks > 0 && overdueRatio >= 0.15;

  const dependencyDelay =
    blockedTasks.some((t) =>
      (t.blocked_reason ?? "").toLowerCase().includes("depend"),
    ) ||
    openDeps > 0 ||
    blockers > 0;

  const blockedTaskTitles = [
    ...blockedTasks.map((t) => t.title),
    ...openIssueItems.map((r) => r.title),
    ...openDepItems.map((r) => r.title),
  ].slice(0, 3);

  const recurringBlockers = [
    ...topRecurringBlockers(blockedTasks),
    ...openDepItems.slice(0, 1).map((r) => r.title),
  ].slice(0, 2);

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
  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([reason]) => reason)
    .slice(0, 2);
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
