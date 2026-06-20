/**
 * R5 — Scrum team health dashboard KPIs (max 5, honest values).
 */

import { formatHonestPct, limitDashboardKpis } from "@/lib/honest-kpi";
import type { ScrumMissionControl } from "@/services/scrumDashboard";

export type ScrumHealthKpi = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "healthy" | "watch" | "at-risk";
  progressPct?: number;
  href?: string;
};

export type BuildScrumHealthKpisInput = {
  overview: ScrumMissionControl["overview"];
  sprintHealth: ScrumMissionControl["sprintHealth"];
  impediments: ScrumMissionControl["impediments"];
  dataSources: ScrumMissionControl["dataSources"];
  projectId?: string;
};

function scrumHref(projectId?: string): string {
  return projectId ? `/project/${projectId}/scrum` : "/workspace/scrum-mission";
}

/** Five team health KPIs — sprint, blocked, impediments, velocity, confidence. */
export function buildScrumHealthKpis(input: BuildScrumHealthKpisInput): ScrumHealthKpi[] {
  const { overview, sprintHealth, impediments, dataSources } = input;
  const isLive = dataSources.velocity === "live";

  const completionPct = formatHonestPct(
    overview.completionPct > 0 ? overview.completionPct : null,
    "Track sprint tasks for burndown",
  );
  const confidencePct = formatHonestPct(
    isLive && sprintHealth.deliveryConfidence > 0
      ? sprintHealth.deliveryConfidence
      : null,
    "Velocity populates after sprint 1",
  );

  const openImpediments = impediments.length;

  const kpisList: ScrumHealthKpi[] = [
    {
      label: "Sprint complete",
      value: String(completionPct.value),
      hint: completionPct.hint ?? overview.sprintLabel,
      tone: completionPct.isEmpty
        ? "default"
        : (completionPct.progressPct ?? 0) >= 70
          ? "healthy"
          : "watch",
      progressPct: completionPct.progressPct,
      href: scrumHref(input.projectId),
    },
    {
      label: "Days left",
      value: String(overview.daysRemaining),
      hint: overview.daysRemaining <= 2 ? "Sprint closing soon" : "In current sprint",
      tone: overview.daysRemaining <= 2 && (completionPct.progressPct ?? 0) < 70 ? "watch" : "default",
      href: scrumHref(input.projectId),
    },
    {
      label: "Blocked stories",
      value: String(overview.blockedStories),
      hint:
        overview.blockedStories > 0
          ? "Team needs unblocking"
          : "Flow is clear",
      tone: overview.blockedStories > 0 ? "at-risk" : "healthy",
      progressPct:
        overview.blockedStories > 0
          ? Math.min(100, overview.blockedStories * 25)
          : undefined,
      href: scrumHref(input.projectId),
    },
    {
      label: "Impediments",
      value: String(openImpediments),
      hint:
        openImpediments > 0
          ? "Active on impediment board"
          : "None logged",
      tone: openImpediments > 0 ? "watch" : "healthy",
      href: scrumHref(input.projectId),
    },
    {
      label: "Delivery confidence",
      value: String(confidencePct.value),
      hint: confidencePct.hint ?? overview.velocityTrend,
      tone: confidencePct.isEmpty
        ? "default"
        : (confidencePct.progressPct ?? 0) >= 75
          ? "healthy"
          : "watch",
      progressPct: confidencePct.progressPct,
      href: scrumHref(input.projectId),
    },
  ];

  return limitDashboardKpis(kpisList);
}

export type BuildScrumHealthSynthesisInput = {
  projectName?: string | null;
  impedimentCount: number;
  blockedStories: number;
  completionPct: number;
  daysRemaining: number;
  impedimentTitle?: string | null;
  fallbackSummary?: string;
};

const DEFAULT_SCRUM_SUMMARY =
  "Upload delivery context and run AI workspace generation to populate sprint health.";

/** Role-specific one-liner: what's blocking the team as a unit. */
export function buildScrumHealthSynthesis(input: BuildScrumHealthSynthesisInput): string {
  const prefix = input.projectName ? `${input.projectName}: ` : "";
  const blockers: string[] = [];

  if (input.impedimentCount > 0) {
    blockers.push(
      `${input.impedimentCount} impediment${input.impedimentCount === 1 ? "" : "s"}`,
    );
  }
  if (input.blockedStories > 0) {
    blockers.push(
      `${input.blockedStories} blocked stor${input.blockedStories === 1 ? "y" : "ies"}`,
    );
  }
  if (input.completionPct < 50 && input.daysRemaining <= 3) {
    blockers.push(`sprint only ${input.completionPct}% complete with ${input.daysRemaining} days left`);
  }

  if (blockers.length === 0) {
    if (input.fallbackSummary && input.fallbackSummary !== DEFAULT_SCRUM_SUMMARY) {
      return input.fallbackSummary;
    }
    return `${prefix}Team flow is healthy — focus ceremonies and clear impediments before they age.`;
  }

  const lead = input.impedimentTitle
    ? `"${input.impedimentTitle}" plus ${blockers.length > 1 ? "other blockers" : "team blockers"}`
    : blockers.slice(0, 3).join(", ");

  return `${prefix}${lead} — unblock the team before the sprint closes.`;
}

export type ScrumBurndownPoint = {
  label: string;
  remaining: number;
  ideal: number;
};

/** Build simple burndown points from sprint health — no illustrative data. */
export function buildScrumBurndownPoints(input: {
  plannedPoints: number;
  completedPoints: number;
  daysRemaining: number;
  sprintDays?: number;
}): ScrumBurndownPoint[] {
  const { plannedPoints, completedPoints, daysRemaining } = input;
  const sprintDays = input.sprintDays ?? 10;

  if (plannedPoints <= 0) {
    return [];
  }

  const remaining = Math.max(0, plannedPoints - completedPoints);
  const elapsed = Math.max(0, sprintDays - daysRemaining);
  const points: ScrumBurndownPoint[] = [];

  for (let day = 0; day <= elapsed; day++) {
    const ideal = Math.round(plannedPoints * (1 - day / sprintDays));
    const actualRemaining =
      day === elapsed ? remaining : Math.round(plannedPoints * (1 - (completedPoints / plannedPoints) * (day / Math.max(elapsed, 1))));
    points.push({
      label: `D${day}`,
      remaining: day === elapsed ? remaining : actualRemaining,
      ideal,
    });
  }

  if (points.length === 0) {
    points.push({ label: "Now", remaining, ideal: plannedPoints });
  }

  return points;
}
