/**
 * R3 — Delivery PM control room KPI strip (max 5, honest values only).
 * Today/week focus: blocked, overdue, approvals, RAID critical, team load.
 */

import type { PmDayOneKpi } from "@/lib/pm-day-one-panels";
import { formatHonestPct, limitDashboardKpis } from "@/lib/honest-kpi";
import { governanceTabHref } from "@/lib/governance-tabs";
import { clampPct } from "@/lib/pm-viz-helpers";
import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import type { TaskWithMeta } from "@/services/delivery";

const OPEN_TASK_STATUSES = new Set(["todo", "in_progress", "in_review", "blocked"]);

export type PmControlRoomKpi = PmDayOneKpi & {
  href?: string;
};

export type BuildPmControlRoomKpisInput = {
  overview: PmMissionControl["overview"];
  raid: PmMissionControl["raid"];
  pendingApprovalCount: number;
  teamCapacityPct: number | null;
  tasks: TaskWithMeta[];
  projectId?: string;
};

export function countOverdueTasks(tasks: TaskWithMeta[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.filter((task) => {
    if (!OPEN_TASK_STATUSES.has(task.status) || !task.due_date) return false;
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;
}

export function countCriticalRaidItems(raid: PmMissionControl["raid"]): number {
  const criticalRisks = raid.risks.filter((risk) =>
    /high|critical/i.test(risk.severity),
  ).length;
  const criticalIssues = raid.issues.filter((issue) =>
    /high|critical/i.test(issue.severity),
  ).length;
  return criticalRisks + criticalIssues;
}

function tasksHref(projectId?: string): string {
  return projectId ? `/project/${projectId}/delivery` : "/workspace/tasks";
}

function raidHref(projectId?: string): string {
  return projectId ? `/project/${projectId}/raid` : governanceTabHref("risks");
}

function proposalsHref(projectId?: string): string {
  const params = new URLSearchParams({ persona: "pm-mission" });
  if (projectId) params.set("project", projectId);
  return `/workspace/proposals?${params.toString()}`;
}

/** Five operational KPIs for the PM control room — no illustrative placeholders. */
export function buildPmControlRoomKpis(input: BuildPmControlRoomKpisInput): PmControlRoomKpi[] {
  const blocked = input.overview.blockedDependencies;
  const overdue = countOverdueTasks(input.tasks);
  const approvals = input.pendingApprovalCount;
  const raidCritical = countCriticalRaidItems(input.raid);
  const teamLoad = formatHonestPct(
    input.teamCapacityPct,
    "Assign tasks to see team load",
  );

  const kpis: PmControlRoomKpi[] = [
    {
      label: "Blocked",
      value: String(blocked),
      hint: blocked > 0 ? "Tasks or dependencies" : "None open",
      tone: blocked > 0 ? "at-risk" : "healthy",
      progressPct: blocked > 0 ? clampPct((blocked / 5) * 100) : undefined,
      href: tasksHref(input.projectId),
    },
    {
      label: "Overdue",
      value: String(overdue),
      hint: overdue > 0 ? "Past due this week" : "On track",
      tone: overdue > 0 ? "watch" : "healthy",
      progressPct: overdue > 0 ? clampPct((overdue / 5) * 100) : undefined,
      href: tasksHref(input.projectId),
    },
    {
      label: "Approvals",
      value: String(approvals),
      hint: approvals === 1 ? "Awaiting PM sign-off" : "Awaiting PM sign-off",
      tone: approvals > 0 ? "watch" : "healthy",
      progressPct: approvals > 0 ? clampPct((approvals / 5) * 100) : undefined,
      href: proposalsHref(input.projectId),
    },
    {
      label: "RAID critical",
      value: String(raidCritical),
      hint: raidCritical > 0 ? "High/critical risks & issues" : "None flagged",
      tone: raidCritical > 0 ? "at-risk" : "healthy",
      progressPct: raidCritical > 0 ? clampPct((raidCritical / 4) * 100) : undefined,
      href: raidHref(input.projectId),
    },
    {
      label: "Team load",
      value: String(teamLoad.value),
      hint: teamLoad.hint ?? "Avg load from assigned tasks",
      tone: teamLoad.isEmpty
        ? "default"
        : (input.teamCapacityPct ?? 0) >= 90
          ? "at-risk"
          : (input.teamCapacityPct ?? 0) >= 70
            ? "watch"
            : "healthy",
      progressPct: teamLoad.progressPct,
      href: input.projectId ? `/project/${input.projectId}/delivery` : "/workspace/tasks",
    },
  ];

  return limitDashboardKpis(kpis);
}

export type BuildPmBlockingYouSynthesisInput = {
  projectName?: string | null;
  blockedCount: number;
  overdueCount: number;
  pendingApprovals: number;
  criticalRaidCount: number;
  teamNeedsCount: number;
  fallbackSummary?: string;
};

const DEFAULT_PM_SUMMARY =
  "Run AI delivery analysis or connect your project charter to populate PM Mission Control.";

/** Role-specific one-liner: what's blocking the PM today. */
export function buildPmBlockingYouSynthesis(input: BuildPmBlockingYouSynthesisInput): string {
  const project = input.projectName ? `${input.projectName}: ` : "";
  const blockers: string[] = [];

  if (input.blockedCount > 0) {
    blockers.push(
      `${input.blockedCount} blocked task${input.blockedCount === 1 ? "" : "s"}`,
    );
  }
  if (input.overdueCount > 0) {
    blockers.push(`${input.overdueCount} overdue`);
  }
  if (input.pendingApprovals > 0) {
    blockers.push(
      `${input.pendingApprovals} approval${input.pendingApprovals === 1 ? "" : "s"} waiting`,
    );
  }
  if (input.criticalRaidCount > 0) {
    blockers.push(
      `${input.criticalRaidCount} critical RAID item${input.criticalRaidCount === 1 ? "" : "s"}`,
    );
  }
  if (input.teamNeedsCount > 0 && blockers.length < 3) {
    blockers.push(
      `${input.teamNeedsCount} teammate${input.teamNeedsCount === 1 ? "" : "s"} waiting on you`,
    );
  }

  if (blockers.length === 0) {
    if (input.fallbackSummary && input.fallbackSummary !== DEFAULT_PM_SUMMARY) {
      return input.fallbackSummary;
    }
    return `${project}Nothing urgent blocking you — scan milestones and team load before standup.`;
  }

  return `${project}${blockers.slice(0, 3).join(", ")} — unblock the team before new commitments.`;
}
