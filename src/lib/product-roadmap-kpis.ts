/**
 * R5 — Product roadmap dashboard KPIs (max 5, honest values).
 */

import { formatHonestPct, limitDashboardKpis } from "@/lib/honest-kpi";
import type { ProductMissionControl } from "@/services/pmDashboard";

export type ProductRoadmapKpi = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "healthy" | "watch" | "at-risk";
  progressPct?: number;
  href?: string;
};

export type BuildProductRoadmapKpisInput = {
  kpis: ProductMissionControl["kpis"];
  roadmap: ProductMissionControl["roadmap"];
  topFeatures: ProductMissionControl["topFeatures"];
  dataSources: ProductMissionControl["dataSources"];
  projectId?: string;
};

function productHref(projectId?: string): string {
  return projectId ? `/project/${projectId}/product` : "/workspace/product";
}

/** Five roadmap KPIs — health, adoption, horizon counts, top RICE, insights. */
export function buildProductRoadmapKpis(
  input: BuildProductRoadmapKpisInput,
): ProductRoadmapKpi[] {
  const { kpis, roadmap, topFeatures, dataSources } = input;
  const isLive = dataSources.roadmapRice === "live";

  const healthPct = formatHonestPct(
    isLive && kpis.productHealth > 0 ? kpis.productHealth : null,
    "Run product analysis for health score",
  );
  const adoptionPct = formatHonestPct(
    isLive && kpis.featureAdoption > 0 ? kpis.featureAdoption : null,
    "Connect usage data for adoption",
  );

  const nowCount = roadmap.now.length;
  const nextCount = roadmap.next.length;
  const topRice = topFeatures[0];

  const kpisList: ProductRoadmapKpi[] = [
    {
      label: "Product health",
      value: String(healthPct.value),
      hint: healthPct.hint ?? "North-star alignment",
      tone: healthPct.isEmpty
        ? "default"
        : (healthPct.progressPct ?? 0) >= 75
          ? "healthy"
          : "watch",
      progressPct: healthPct.progressPct,
      href: productHref(input.projectId),
    },
    {
      label: "Feature adoption",
      value: String(adoptionPct.value),
      hint: adoptionPct.hint ?? "Active feature usage",
      tone: adoptionPct.isEmpty
        ? "default"
        : (adoptionPct.progressPct ?? 0) >= 60
          ? "healthy"
          : "watch",
      progressPct: adoptionPct.progressPct,
      href: productHref(input.projectId),
    },
    {
      label: "Now column",
      value: String(nowCount),
      hint: nowCount > 0 ? "In current sprint" : isLive ? "Empty — prioritise" : "Populate roadmap",
      tone: nowCount > 0 ? "healthy" : "default",
      href: productHref(input.projectId),
    },
    {
      label: "Next / Later",
      value: `${nextCount} / ${roadmap.later.length}`,
      hint: "Queued horizons",
      tone: nextCount > 0 ? "healthy" : "default",
      href: productHref(input.projectId),
    },
    {
      label: "Top RICE",
      value: topRice && isLive ? String(topRice.score) : "—",
      hint:
        topRice && isLive
          ? topRice.title.slice(0, 40)
          : "Score backlog with RICE",
      tone: topRice && isLive ? "healthy" : "default",
      href: productHref(input.projectId),
    },
  ];

  return limitDashboardKpis(kpisList);
}

export type BuildProductRoadmapSynthesisInput = {
  projectName?: string | null;
  nowCount: number;
  nextCount: number;
  openClarifications?: number;
  pendingReviewCount: number;
  productHealth: number;
  isLive: boolean;
  fallbackSummary?: string;
};

export type BuildProductRoadmapSubtitleInput = {
  nowCount: number;
  pendingReviewCount: number;
};

/** Steady-state header line — roadmap counts and AI review queue only. */
export function buildProductRoadmapSubtitle(input: BuildProductRoadmapSubtitleInput): string {
  const parts: string[] = [];

  if (input.nowCount > 0) {
    parts.push(`${input.nowCount} in Now`);
  }
  if (input.pendingReviewCount > 0) {
    parts.push(
      `${input.pendingReviewCount} in AI review queue`,
    );
  }

  if (parts.length === 0) {
    return "Roadmap and RICE prioritisation for your product";
  }

  return parts.join(" · ");
}

const DEFAULT_PRODUCT_SUMMARY =
  "Upload product context and run AI analysis to populate roadmap and RICE prioritisation.";

/** Role-specific one-liner: what's blocking adoption/roadmap progress. */
export function buildProductRoadmapSynthesis(
  input: BuildProductRoadmapSynthesisInput,
): string {
  const prefix = input.projectName ? `${input.projectName}: ` : "";
  const blockers: string[] = [];

  if (!input.isLive) {
    return `${prefix}Connect product context to populate live Now/Next/Later and RICE scores.`;
  }

  if (input.nowCount === 0) {
    blockers.push("Now column is empty");
  }
  if (input.pendingReviewCount > 0) {
    blockers.push(
      `${input.pendingReviewCount} item${input.pendingReviewCount === 1 ? "" : "s"} in AI review queue`,
    );
  }
  if (input.productHealth < 60) {
    blockers.push(`product health at ${input.productHealth}%`);
  }
  if (input.nextCount === 0 && input.nowCount > 0) {
    blockers.push("no Next items queued");
  }

  if (blockers.length === 0) {
    if (input.fallbackSummary && input.fallbackSummary !== DEFAULT_PRODUCT_SUMMARY) {
      return input.fallbackSummary;
    }
    return `${prefix}${input.nowCount} item${input.nowCount === 1 ? "" : "s"} in Now — refine RICE scores before committing the sprint.`;
  }

  return `${prefix}${blockers.slice(0, 3).join(", ")} — unblock roadmap before the next planning cycle.`;
}
