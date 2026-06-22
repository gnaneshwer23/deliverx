/**
 * R5 — Engineer shipping dashboard KPIs (max 5, honest values).
 */

import { formatHonestPct, limitDashboardKpis } from "@/lib/honest-kpi";
import type { EngineerMissionControl } from "@/services/engineerDashboard";

export type EngineerShippingKpi = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "healthy" | "watch" | "at-risk";
  progressPct?: number;
  href?: string;
};

const BUILD_TONE: Record<EngineerMissionControl["overview"]["buildHealth"], EngineerShippingKpi["tone"]> = {
  green: "healthy",
  amber: "watch",
  red: "at-risk",
};

export type BuildEngineerShippingKpisInput = {
  overview: EngineerMissionControl["overview"];
  prDashboard: EngineerMissionControl["prDashboard"];
  cicd: EngineerMissionControl["cicd"];
  githubConfigured: boolean;
  blockedDependencies: number;
  projectId?: string;
};

function engineeringHref(projectId?: string): string {
  return projectId ? `/project/${projectId}/engineering` : "/workspace/engineer";
}

/** Five shipping KPIs — assigned, blocked, PRs, build, sprint progress. */
export function buildEngineerShippingKpis(
  input: BuildEngineerShippingKpisInput,
): EngineerShippingKpi[] {
  const { overview, prDashboard, cicd, githubConfigured } = input;
  const sprintPct = formatHonestPct(
    overview.sprintProgress > 0 ? overview.sprintProgress : null,
    "Assign tasks to track sprint",
  );

  const buildHasSignal =
    githubConfigured ||
    (cicd.buildStatus !== "—" && cicd.buildStatus !== "Unknown");
  const buildValue = buildHasSignal
    ? overview.buildHealth === "green"
      ? "Pass"
      : overview.buildHealth === "amber"
        ? "Warn"
        : "Fail"
    : "—";

  const kpisList: EngineerShippingKpi[] = [
    {
      label: "Assigned",
      value: String(overview.assignedStories),
      hint: overview.assignedStories > 0 ? "Stories in your queue" : "No assignments yet",
      tone: overview.assignedStories > 0 ? "healthy" : "default",
      href: engineeringHref(input.projectId),
    },
    {
      label: "Blocked",
      value: String(overview.blockedStories),
      hint:
        overview.blockedStories > 0
          ? "Needs dependency resolution"
          : "Nothing blocking you",
      tone: overview.blockedStories > 0 ? "at-risk" : "healthy",
      progressPct:
        overview.blockedStories > 0
          ? Math.min(100, overview.blockedStories * 25)
          : undefined,
      href: engineeringHref(input.projectId),
    },
    {
      label: "Open PRs",
      value: String(prDashboard.openPrs),
      hint:
        prDashboard.reviewsRequired > 0
          ? `${prDashboard.reviewsRequired} need review`
          : githubConfigured
            ? "From GitHub"
            : "Connect GitHub",
      tone: prDashboard.openPrs > 3 ? "watch" : "default",
      href: engineeringHref(input.projectId),
    },
    {
      label: "Build",
      value: buildValue,
      hint: buildHasSignal ? cicd.buildStatus : "Connect GitHub or CI plan",
      tone: buildHasSignal ? BUILD_TONE[overview.buildHealth] : "default",
      href: engineeringHref(input.projectId),
    },
    {
      label: "Sprint done",
      value: String(sprintPct.value),
      hint: sprintPct.hint ?? "Your assigned tasks",
      tone: sprintPct.isEmpty
        ? "default"
        : (sprintPct.progressPct ?? 0) >= 70
          ? "healthy"
          : "watch",
      progressPct: sprintPct.progressPct,
      href: engineeringHref(input.projectId),
    },
  ];

  return limitDashboardKpis(kpisList);
}

export type BuildEngineerShippingSynthesisInput = {
  projectName?: string | null;
  blockedStories: number;
  openPrs: number;
  reviewsRequired: number;
  blockedDependencies: number;
  buildHealth: EngineerMissionControl["overview"]["buildHealth"];
  fallbackSummary?: string;
};

const DEFAULT_ENGINEER_SUMMARY =
  "Set your specialisation and stack, then run AI workspace generation to populate guided tasks and traceability.";

/** Role-specific one-liner: what's blocking your code from shipping. */
export function buildEngineerShippingSynthesis(
  input: BuildEngineerShippingSynthesisInput,
): string {
  const prefix = input.projectName ? `${input.projectName}: ` : "";
  const blockers: string[] = [];

  if (input.blockedStories > 0) {
    blockers.push(
      `${input.blockedStories} blocked stor${input.blockedStories === 1 ? "y" : "ies"}`,
    );
  }
  if (input.blockedDependencies > 0) {
    blockers.push(
      `${input.blockedDependencies} dependenc${input.blockedDependencies === 1 ? "y" : "ies"} delayed`,
    );
  }
  if (input.reviewsRequired > 0) {
    blockers.push(
      `${input.reviewsRequired} PR review${input.reviewsRequired === 1 ? "" : "s"} required`,
    );
  }
  if (input.buildHealth === "red") {
    blockers.push("CI build failing");
  } else if (input.buildHealth === "amber") {
    blockers.push("build health degraded");
  }

  if (blockers.length === 0) {
    if (input.fallbackSummary && input.fallbackSummary !== DEFAULT_ENGINEER_SUMMARY) {
      return input.fallbackSummary;
    }
    const prNote =
      input.openPrs > 0
        ? `${input.openPrs} open PR${input.openPrs === 1 ? "" : "s"} — ship when reviews clear.`
        : "Nothing blocking you — pick up the next story.";
    return `${prefix}${prNote}`;
  }

  return `${prefix}${blockers.slice(0, 3).join(", ")} — unblock before merging to main.`;
}
