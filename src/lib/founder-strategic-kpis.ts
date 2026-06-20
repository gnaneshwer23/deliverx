/**
 * R4 — Founder strategic KPI strip (max 5, honest values).
 * Runway, burn, objective progress, portfolio health, decisions waiting.
 */

import {
  buildFounderPortfolioSnapshotCounts,
  type FounderDayOneKpi,
} from "@/lib/founder-day-one-panels";
import { formatHonestPct, limitDashboardKpis } from "@/lib/honest-kpi";
import type { FounderMissionControl } from "@/services/founderDashboard";
import type { FounderPortfolioRow, FounderStrategicObjective } from "@/services/founderEngine";

export const FOUNDER_STRATEGIC_KPI_MAX = 5;

export type FounderStrategicKpi = FounderDayOneKpi & {
  progressPct?: number;
};

export type BuildFounderStrategicKpisInput = {
  funding: FounderMissionControl["funding"];
  kpis: FounderMissionControl["kpis"];
  portfolio: FounderPortfolioRow[];
  strategicObjectives: FounderStrategicObjective[];
  pendingDecisionsCount: number;
  dataSources: FounderMissionControl["dataSources"];
};

function averageObjectiveProgress(objectives: FounderStrategicObjective[]): number | null {
  if (objectives.length === 0) return null;
  const sum = objectives.reduce((acc, obj) => acc + obj.progress, 0);
  return sum / objectives.length;
}

function runwayProgressPct(months: number): number {
  return Math.min(100, Math.round((months / 18) * 100));
}

function runwayTone(months: number): FounderDayOneKpi["tone"] {
  if (months >= 12) return "healthy";
  if (months >= 6) return "watch";
  return "at-risk";
}

/** Five strategic KPIs for the founder board memo — no ops/task metrics. */
export function buildFounderStrategicKpis(
  input: BuildFounderStrategicKpisInput,
): FounderStrategicKpi[] {
  const sym = input.funding.currency === "GBP" ? "£" : "$";
  const financialIsLive = input.dataSources.financials === "live";
  const portfolioCounts = buildFounderPortfolioSnapshotCounts(input.portfolio);
  const objectiveProgress = formatHonestPct(
    averageObjectiveProgress(input.strategicObjectives),
    "Set strategic objectives in founder context",
  );

  const portfolioValue =
    portfolioCounts.total > 0
      ? `${portfolioCounts.onTrack}/${portfolioCounts.total}`
      : "—";

  const kpis: FounderStrategicKpi[] = [
    {
      label: "Runway",
      value: financialIsLive ? `${input.kpis.runwayMonths} mo` : "—",
      hint: financialIsLive
        ? input.funding.runwayEndPrediction
        : "Set cash & burn in founder context",
      tone: financialIsLive ? runwayTone(input.kpis.runwayMonths) : "default",
      progressPct: financialIsLive ? runwayProgressPct(input.kpis.runwayMonths) : undefined,
    },
    {
      label: "Burn",
      value: financialIsLive
        ? `${sym}${Math.round(input.kpis.monthlyBurn / 1000)}k/mo`
        : "—",
      hint: financialIsLive
        ? `${sym}${Math.round(input.funding.cashInBank / 1000)}k cash in bank`
        : "Add financial profile for live burn",
      tone: "default",
    },
    {
      label: "Objective progress",
      value: String(objectiveProgress.value),
      hint: objectiveProgress.hint ?? "Quarter strategic goals",
      tone: objectiveProgress.isEmpty
        ? "default"
        : (objectiveProgress.progressPct ?? 0) >= 75
          ? "healthy"
          : (objectiveProgress.progressPct ?? 0) >= 50
            ? "watch"
            : "at-risk",
      progressPct: objectiveProgress.progressPct,
    },
    {
      label: "Portfolio health",
      value: portfolioValue,
      hint:
        portfolioCounts.total > 0
          ? `${portfolioCounts.atRisk + portfolioCounts.offTrack} need attention`
          : "Projects appear after GO",
      tone:
        portfolioCounts.offTrack > 0
          ? "at-risk"
          : portfolioCounts.atRisk > 0
            ? "watch"
            : portfolioCounts.total > 0
              ? "healthy"
              : "default",
      progressPct:
        portfolioCounts.total > 0
          ? Math.round((portfolioCounts.onTrack / portfolioCounts.total) * 100)
          : undefined,
    },
    {
      label: "Decisions waiting",
      value: String(input.pendingDecisionsCount),
      hint:
        input.pendingDecisionsCount === 1
          ? "Needs your approval"
          : input.pendingDecisionsCount > 0
            ? "Need your approval"
            : "Nothing pending",
      tone: input.pendingDecisionsCount > 0 ? "watch" : "healthy",
      progressPct:
        input.pendingDecisionsCount > 0
          ? Math.min(100, input.pendingDecisionsCount * 25)
          : undefined,
    },
  ];

  return limitDashboardKpis(kpis, FOUNDER_STRATEGIC_KPI_MAX);
}
