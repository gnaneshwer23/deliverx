/**
 * R5 — QA release readiness dashboard KPIs (max 5, honest values).
 */

import { formatHonestPct, limitDashboardKpis } from "@/lib/honest-kpi";
import type { QaMissionControl } from "@/services/qaDashboard";

export type QaReleaseKpi = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "healthy" | "watch" | "at-risk";
  progressPct?: number;
  href?: string;
};

export type BuildQaReleaseKpisInput = {
  overview: QaMissionControl["overview"];
  releaseReadiness: QaMissionControl["releaseReadiness"];
  automation: QaMissionControl["automation"];
  dataSources: QaMissionControl["dataSources"];
  projectId?: string;
};

function qaHref(projectId?: string): string {
  return projectId ? `/project/${projectId}/qa` : "/workspace/qa";
}

function releaseTone(score: number): QaReleaseKpi["tone"] {
  if (score >= 80) return "healthy";
  if (score >= 60) return "watch";
  return "at-risk";
}

/** Five release KPIs — readiness, coverage, defects, automation, UAT. */
export function buildQaReleaseKpis(input: BuildQaReleaseKpisInput): QaReleaseKpi[] {
  const { overview, releaseReadiness, automation, dataSources } = input;
  const isLive = dataSources.qaMetrics === "live";

  const readinessPct = formatHonestPct(
    isLive && releaseReadiness.overall > 0 ? releaseReadiness.overall : null,
    "Run QA analysis for readiness score",
  );
  const coveragePct = formatHonestPct(
    isLive && overview.testCoverage > 0 ? overview.testCoverage : null,
    "Add test cases for coverage",
  );
  const automationPct = formatHonestPct(
    isLive && automation.coveragePct > 0 ? automation.coveragePct : null,
    "Automate regression suite",
  );

  const kpisList: QaReleaseKpi[] = [
    {
      label: "Release readiness",
      value: String(readinessPct.value),
      hint: readinessPct.hint ?? releaseReadiness.recommendation,
      tone: readinessPct.isEmpty ? "default" : releaseTone(releaseReadiness.overall),
      progressPct: readinessPct.progressPct,
      href: qaHref(input.projectId),
    },
    {
      label: "Test coverage",
      value: String(coveragePct.value),
      hint: coveragePct.hint ?? "Requirements with tests",
      tone: coveragePct.isEmpty
        ? "default"
        : (coveragePct.progressPct ?? 0) >= 80
          ? "healthy"
          : "watch",
      progressPct: coveragePct.progressPct,
      href: qaHref(input.projectId),
    },
    {
      label: "Open defects",
      value: String(overview.openDefects),
      hint:
        overview.criticalDefects > 0
          ? `${overview.criticalDefects} critical`
          : overview.openDefects > 0
            ? "Track in defect board"
            : "None open",
      tone: overview.criticalDefects > 0 ? "at-risk" : overview.openDefects > 0 ? "watch" : "healthy",
      progressPct:
        overview.openDefects > 0
          ? Math.min(100, overview.openDefects * 10)
          : undefined,
      href: qaHref(input.projectId),
    },
    {
      label: "Automation",
      value: String(automationPct.value),
      hint: automationPct.hint ?? `${automation.automatedTests} automated`,
      tone: automationPct.isEmpty
        ? "default"
        : (automationPct.progressPct ?? 0) >= 70
          ? "healthy"
          : "watch",
      progressPct: automationPct.progressPct,
      href: qaHref(input.projectId),
    },
    {
      label: "UAT",
      value: isLive ? `${overview.uatCompletion}%` : "—",
      hint: isLive ? "User acceptance progress" : "Set up UAT plan",
      tone:
        !isLive
          ? "default"
          : overview.uatCompletion >= 90
            ? "healthy"
            : overview.uatCompletion >= 70
              ? "watch"
              : "at-risk",
      progressPct: isLive ? overview.uatCompletion : undefined,
      href: qaHref(input.projectId),
    },
  ];

  return limitDashboardKpis(kpisList);
}

export type BuildQaReleaseSynthesisInput = {
  projectName?: string | null;
  releaseReadiness: number;
  recommendation: string;
  criticalDefects: number;
  openDefects: number;
  testCoverage: number;
  isLive: boolean;
  fallbackSummary?: string;
};

const DEFAULT_QA_SUMMARY =
  "Set your testing specialisation and tools, then run AI workspace generation.";

/** Role-specific one-liner: what's blocking release. */
export function buildQaReleaseSynthesis(input: BuildQaReleaseSynthesisInput): string {
  const prefix = input.projectName ? `${input.projectName}: ` : "";

  if (!input.isLive) {
    return `${prefix}Connect QA metrics to populate live release readiness and defect intelligence.`;
  }

  const blockers: string[] = [];

  if (input.criticalDefects > 0) {
    blockers.push(
      `${input.criticalDefects} critical defect${input.criticalDefects === 1 ? "" : "s"}`,
    );
  }
  if (input.releaseReadiness < 70) {
    blockers.push(`readiness at ${input.releaseReadiness}/100`);
  }
  if (input.testCoverage < 80) {
    blockers.push(`test coverage ${input.testCoverage}%`);
  }
  if (input.openDefects > 5 && blockers.length < 3) {
    blockers.push(`${input.openDefects} open defects`);
  }

  if (blockers.length === 0) {
    if (input.fallbackSummary && input.fallbackSummary !== DEFAULT_QA_SUMMARY) {
      return input.fallbackSummary;
    }
    if (/go/i.test(input.recommendation)) {
      return `${prefix}Release readiness ${input.releaseReadiness}/100 — ${input.recommendation.toLowerCase()}.`;
    }
    return `${prefix}No critical blockers — confirm UAT sign-off before release window.`;
  }

  return `${prefix}${blockers.slice(0, 3).join(", ")} — resolve before go/no-go.`;
}

export type QaGoNoGoVerdict = "Go" | "No-Go" | "Hold";

/** Derive go/no-go from release readiness panel data. */
export function deriveQaGoNoGoVerdict(input: {
  overall: number;
  criticalDefects: number;
  recommendation: string;
}): QaGoNoGoVerdict {
  if (input.criticalDefects > 0 || input.overall < 60) return "No-Go";
  if (/no.?go|hold|delay/i.test(input.recommendation)) return "No-Go";
  if (input.overall >= 80 && input.criticalDefects === 0) return "Go";
  return "Hold";
}
