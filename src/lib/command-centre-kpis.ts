/**
 * R2 — Role-aware Command Centre KPI strip (max 5, honest values only).
 */

import type { KpiItem } from "@/components/dashboard/kpi-strip";
import {
  Ban,
  CalendarClock,
  CheckSquare,
  Clock,
  Layers,
  Scale,
  Users,
} from "lucide-react";
import { formatHonestKpi, limitDashboardKpis } from "@/lib/honest-kpi";

export type CommandCentreKpiInput = {
  userRole: string | null;
  activeProjectCount: number;
  portfolioHealth: number | null;
  successScoreValue: number | null;
  alignmentDelta: number | null;
  topProjectId: string | null;
  delivery: {
    tasksInProgress: number;
    overdueTasks: number;
    blockedTasks: number;
    standupsThisWeek: number;
  };
  approvalCounts: {
    total: number;
    artifacts: number;
    proposals: number;
  };
  velocityTrend: number | null;
  governanceOpenRisks: number;
};

function baseKpi(
  item: Omit<KpiItem, "icon"> & { icon?: KpiItem["icon"] },
): KpiItem {
  return item;
}

function activeProjectsKpi(count: number): KpiItem {
  return baseKpi({
    label: "Active projects",
    value: count,
    href: "/workspace/projects",
    icon: Layers,
    accent: "teal",
  });
}

function tasksInProgressKpi(count: number, velocityTrend: number | null): KpiItem {
  return baseKpi({
    label: "Tasks in progress",
    value: count,
    href: "/workspace/tasks",
    icon: CheckSquare,
    accent: "teal",
    delta:
      velocityTrend != null
        ? {
            value: `${velocityTrend > 0 ? "+" : ""}${velocityTrend} vs last wk`,
            direction:
              velocityTrend > 0 ? "up" : velocityTrend < 0 ? "down" : "neutral",
          }
        : undefined,
  });
}

function overdueKpi(count: number): KpiItem {
  return baseKpi({
    label: "Overdue",
    value: count,
    href: "/workspace/tasks",
    icon: Clock,
    accent: count > 0 ? "amber" : "slate",
    delta:
      count > 0
        ? { value: "Needs attention", direction: "warn" }
        : { value: "On track", direction: "neutral" },
  });
}

function blockedKpi(count: number): KpiItem {
  return baseKpi({
    label: "Blocked",
    value: count,
    href: "/workspace/tasks",
    icon: Ban,
    accent: count > 0 ? "rose" : "slate",
    delta: count > 0 ? { value: `${count} blocked`, direction: "down" } : undefined,
  });
}

function pendingApprovalsKpi(input: CommandCentreKpiInput["approvalCounts"]): KpiItem {
  return baseKpi({
    label: "Pending approvals",
    value: input.total,
    hint:
      input.total > 0
        ? `${input.artifacts} artifacts · ${input.proposals} proposals`
        : undefined,
    href: "/workspace/proposals",
    icon: CalendarClock,
    accent: input.total > 0 ? "amber" : "slate",
    delta:
      input.total > 0
        ? { value: `${input.total} awaiting`, direction: "warn" }
        : undefined,
  });
}

function standupsKpi(count: number): KpiItem {
  const formatted = formatHonestKpi(
    count > 0 ? count : null,
    "Updates after first standup",
  );
  return baseKpi({
    label: "Standups (7d)",
    value: formatted.value,
    hint: formatted.hint,
    href: "/workspace/meetings",
    icon: Users,
    accent: "teal",
    progressPct:
      count > 0 ? Math.min(100, Math.round((count / 5) * 100)) : undefined,
  });
}

function portfolioHealthKpi(
  portfolioHealth: number | null,
  alignmentDelta: number | null,
): KpiItem | null {
  if (portfolioHealth == null) return null;
  return baseKpi({
    label: "Portfolio health",
    value: portfolioHealth,
    hint: "/ 100",
    href: "/workspace/portfolio",
    icon: Scale,
    accent:
      portfolioHealth >= 80 ? "teal" : portfolioHealth >= 60 ? "amber" : "rose",
    progressPct: portfolioHealth,
    delta:
      alignmentDelta != null
        ? {
            value: `${alignmentDelta > 0 ? "+" : ""}${alignmentDelta}%`,
            direction:
              alignmentDelta > 0 ? "up" : alignmentDelta < 0 ? "down" : "neutral",
          }
        : undefined,
  });
}

function successScoreKpi(score: number | null, topProjectId: string | null): KpiItem | null {
  if (score == null) return null;
  return baseKpi({
    label: "Success score",
    value: score,
    hint: "/ 100",
    href: topProjectId ? `/project/${topProjectId}` : "/workspace/projects",
    icon: CalendarClock,
    accent: score >= 75 ? "teal" : score >= 55 ? "amber" : "rose",
    progressPct: score,
  });
}

function openRisksKpi(count: number): KpiItem {
  return baseKpi({
    label: "Open risks",
    value: count,
    href: "/workspace/raid",
    icon: Ban,
    accent: count > 0 ? "amber" : "slate",
    delta: count > 0 ? { value: `${count} open`, direction: "warn" } : undefined,
  });
}

/** Pick up to five KPIs aligned to the viewer's role and decision surface. */
export function buildCommandCentreKpis(input: CommandCentreKpiInput): KpiItem[] {
  const role = input.userRole ?? "team_member";
  let candidates: KpiItem[] = [];

  if (role === "executive") {
    candidates = [
      portfolioHealthKpi(input.portfolioHealth, input.alignmentDelta),
      activeProjectsKpi(input.activeProjectCount),
      pendingApprovalsKpi(input.approvalCounts),
      successScoreKpi(input.successScoreValue, input.topProjectId),
      openRisksKpi(input.governanceOpenRisks),
      overdueKpi(input.delivery.overdueTasks),
    ].filter((kpi): kpi is KpiItem => kpi != null);
  } else if (role === "pm") {
    candidates = [
      blockedKpi(input.delivery.blockedTasks),
      overdueKpi(input.delivery.overdueTasks),
      pendingApprovalsKpi(input.approvalCounts),
      tasksInProgressKpi(input.delivery.tasksInProgress, input.velocityTrend),
      standupsKpi(input.delivery.standupsThisWeek),
    ];
  } else if (role === "team_member") {
    candidates = [
      tasksInProgressKpi(input.delivery.tasksInProgress, input.velocityTrend),
      overdueKpi(input.delivery.overdueTasks),
      blockedKpi(input.delivery.blockedTasks),
      activeProjectsKpi(input.activeProjectCount),
      standupsKpi(input.delivery.standupsThisWeek),
    ];
  } else {
    candidates = [
      activeProjectsKpi(input.activeProjectCount),
      tasksInProgressKpi(input.delivery.tasksInProgress, input.velocityTrend),
      overdueKpi(input.delivery.overdueTasks),
      blockedKpi(input.delivery.blockedTasks),
      pendingApprovalsKpi(input.approvalCounts),
      standupsKpi(input.delivery.standupsThisWeek),
    ];
  }

  if (input.activeProjectCount === 0) {
    const noProjects = formatHonestKpi(null, "No data yet");
    candidates = [
      baseKpi({
        label: "Active projects",
        value: noProjects.value,
        hint: noProjects.hint,
        href: "/project/new",
        icon: Layers,
        accent: "slate",
      }),
      baseKpi({
        label: "Tasks in progress",
        value: noProjects.value,
        hint: "Create a project to track work",
        href: "/workspace/tasks",
        icon: CheckSquare,
        accent: "slate",
      }),
      pendingApprovalsKpi(input.approvalCounts),
    ];
  }

  return limitDashboardKpis(candidates);
}

export type CommandCentreAiSynthesisInput = {
  userRole: string | null;
  hasProjects: boolean;
  blockedTasks: number;
  overdueTasks: number;
  openRisks: number;
  pendingApprovals: number;
  projectName: string | null;
};

/** Shared AI synthesis fallback line keyed by database role (brief §1). */
export function buildCommandCentreAiSynthesisLine(input: CommandCentreAiSynthesisInput): string {
  if (!input.hasProjects) {
    return "Create a project to unlock delivery intelligence tailored to your role.";
  }

  const project = input.projectName ? `${input.projectName}: ` : "";
  const role = input.userRole ?? "team_member";

  if (role === "executive") {
    if (input.openRisks > 0 || input.overdueTasks > 0) {
      return `${project}Portfolio signals need sponsor attention — review risks, runway, and pending approvals before the next steering forum.`;
    }
    return `${project}Portfolio steady — monitor alignment scores and approval queue for executive decisions.`;
  }

  if (role === "pm") {
    if (input.blockedTasks > 0 || input.overdueTasks > 0) {
      return `${project}Clear blockers and overdue work first, then confirm milestone and stakeholder commitments for the week.`;
    }
    return `${project}Delivery cadence looks stable — focus on decisions waiting on you and the next milestone checkpoint.`;
  }

  if (role === "team_member") {
    if (input.blockedTasks > 0) {
      return `${project}Unblock assigned work and confirm standup updates so the team sees accurate progress.`;
    }
    return `${project}Your task inbox is the source of truth — finish in-progress work and flag blockers early.`;
  }

  if (input.pendingApprovals > 0) {
    return `${project}${input.pendingApprovals} approval${input.pendingApprovals === 1 ? "" : "s"} waiting — review AI outputs before downstream roles act on them.`;
  }

  return `${project}Open your mission control for role-specific delivery detail — this hub stays focused on cross-project signals.`;
}
