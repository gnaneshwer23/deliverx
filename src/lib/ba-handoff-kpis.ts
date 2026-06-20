/**
 * R5 — BA traceability dashboard KPIs (max 5, honest values).
 */

import { formatHonestPct, limitDashboardKpis } from "@/lib/honest-kpi";
import type { BaMissionControl } from "@/services/baDashboard";

export type BaHandoffKpi = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "healthy" | "watch" | "at-risk";
  progressPct?: number;
  href?: string;
};

export type BuildBaHandoffKpisInput = {
  kpis: BaMissionControl["kpis"];
  openClarifications: number;
  pendingReviewCount: number;
  projectId?: string;
};

function requirementsHref(projectId?: string): string {
  return projectId ? `/project/${projectId}/requirements` : "/workspace/ba";
}

function proposalsHref(projectId?: string): string {
  const params = new URLSearchParams({ persona: "ba" });
  if (projectId) params.set("project", projectId);
  return `/workspace/proposals?${params.toString()}`;
}

/** Five handoff KPIs — clarifications, traceability, stories, approvals, reviews. */
export function buildBaHandoffKpis(input: BuildBaHandoffKpisInput): BaHandoffKpi[] {
  const { kpis } = input;
  const approvalPct = formatHonestPct(
    kpis.extracted > 0 ? (kpis.approved / kpis.extracted) * 100 : null,
    "Extract requirements first",
  );
  const tracePct = formatHonestPct(
    kpis.traceabilityScore > 0 ? kpis.traceabilityScore : null,
    "Link stories and tests for coverage",
  );

  const kpisList: BaHandoffKpi[] = [
    {
      label: "Open clarifications",
      value: String(input.openClarifications),
      hint:
        input.openClarifications > 0
          ? "Blocking handoff to dev/QA"
          : "None blocking handoff",
      tone: input.openClarifications > 0 ? "watch" : "healthy",
      progressPct:
        input.openClarifications > 0
          ? Math.min(100, input.openClarifications * 20)
          : undefined,
      href: requirementsHref(input.projectId),
    },
    {
      label: "Traceability",
      value: String(tracePct.value),
      hint: tracePct.hint ?? "Req → story → test links",
      tone: tracePct.isEmpty
        ? "default"
        : (tracePct.progressPct ?? 0) >= 80
          ? "healthy"
          : (tracePct.progressPct ?? 0) >= 50
            ? "watch"
            : "at-risk",
      progressPct: tracePct.progressPct,
      href: input.projectId
        ? `/project/${input.projectId}/requirements?tab=traceability`
        : requirementsHref(input.projectId),
    },
    {
      label: "Stories ready",
      value: String(kpis.storiesReady),
      hint: kpis.storiesReady > 0 ? "Ready for engineering" : "Generate from requirements",
      tone: kpis.storiesReady > 0 ? "healthy" : "default",
      href: requirementsHref(input.projectId),
    },
    {
      label: "Approved reqs",
      value: String(approvalPct.value),
      hint: approvalPct.hint ?? `${kpis.approved} of ${kpis.extracted}`,
      tone: approvalPct.isEmpty
        ? "default"
        : (approvalPct.progressPct ?? 0) >= 80
          ? "healthy"
          : "watch",
      progressPct: approvalPct.progressPct,
      href: requirementsHref(input.projectId),
    },
    {
      label: "Reviews waiting",
      value: String(input.pendingReviewCount),
      hint:
        input.pendingReviewCount > 0
          ? "Artifact sign-off needed"
          : "Nothing pending",
      tone: input.pendingReviewCount > 0 ? "watch" : "healthy",
      href: proposalsHref(input.projectId),
    },
  ];

  return limitDashboardKpis(kpisList);
}

export type BuildBaHandoffSynthesisInput = {
  projectName?: string | null;
  openClarifications: number;
  pendingClarification: number;
  storiesReady: number;
  traceabilityScore: number;
  pendingReviewCount: number;
  fallbackSummary?: string;
};

const DEFAULT_BA_SUMMARY =
  "Upload a business case or charter, then run AI requirement extraction to populate your mission control.";

/** Role-specific one-liner: what's blocking requirements reaching the team. */
export function buildBaHandoffSynthesis(input: BuildBaHandoffSynthesisInput): string {
  const prefix = input.projectName ? `${input.projectName}: ` : "";
  const blockers: string[] = [];

  if (input.openClarifications > 0) {
    blockers.push(
      `${input.openClarifications} open clarification${input.openClarifications === 1 ? "" : "s"}`,
    );
  }
  if (input.pendingClarification > 0) {
    blockers.push(
      `${input.pendingClarification} requirement${input.pendingClarification === 1 ? "" : "s"} awaiting answers`,
    );
  }
  if (input.pendingReviewCount > 0) {
    blockers.push(
      `${input.pendingReviewCount} review${input.pendingReviewCount === 1 ? "" : "s"} waiting`,
    );
  }
  if (input.traceabilityScore < 50 && input.storiesReady > 0) {
    blockers.push(`traceability at ${input.traceabilityScore}%`);
  }

  if (blockers.length === 0) {
    if (input.fallbackSummary && input.fallbackSummary !== DEFAULT_BA_SUMMARY) {
      return input.fallbackSummary;
    }
    if (input.storiesReady > 0) {
      return `${prefix}${input.storiesReady} stories ready — confirm traceability before sprint planning.`;
    }
    return `${prefix}No clarifications blocking handoff — extract and approve requirements next.`;
  }

  return `${prefix}${blockers.slice(0, 3).join(", ")} — resolve before dev and QA can proceed.`;
}
