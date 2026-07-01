/**
 * S9 — Founder / sponsor executive KPI strip (3 honest KPIs: health, budget, risks).
 */

import { formatHonestKpi } from "@/lib/honest-kpi";
import type { FounderDayOneKpi } from "@/lib/founder-day-one-panels";
import type { FounderMissionControl } from "@/services/founderDashboard";

export const FOUNDER_EXECUTIVE_KPI_COUNT = 3;

export type FounderExecutiveKpi = FounderDayOneKpi;

export function buildFounderExecutiveKpis(
  data: FounderMissionControl,
): FounderExecutiveKpi[] {
  const financialIsLive = data.dataSources.financials === "live";
  const sym = data.funding.currency === "GBP" ? "£" : "$";

  const healthValue = data.portfolio.length > 0 ? data.companyHealth.label : null;
  const healthHint =
    data.portfolio.length > 0
      ? `${data.deliveryHealth.projectsOnTrack} projects on track`
      : "Projects appear after GO";

  const budgetFormatted = financialIsLive
    ? formatHonestKpi(
        `${sym}${Math.round(data.kpis.monthlyBurn / 1000)}k/mo burn · ${data.kpis.runwayMonths} mo runway`,
        "Set cash & burn in founder context",
      )
    : formatHonestKpi(null, "Set cash & burn in founder context");

  const risksFormatted =
    data.dataSources.intelligence === "live" || data.deliveryHealth.criticalRisks > 0
      ? formatHonestKpi(
          String(data.deliveryHealth.criticalRisks),
          data.deliveryHealth.criticalRisks === 1
            ? "Open high/critical risk in RAID"
            : "Open high/critical risks in RAID",
        )
      : formatHonestKpi(null, "Connect RAID for live risk count");

  const healthTone: FounderExecutiveKpi["tone"] =
    data.companyHealth.tier === "green"
      ? "healthy"
      : data.companyHealth.tier === "amber"
        ? "watch"
        : data.companyHealth.tier === "red"
          ? "at-risk"
          : "default";

  const risksTone: FounderExecutiveKpi["tone"] =
    risksFormatted.isEmpty
      ? "default"
      : data.deliveryHealth.criticalRisks > 2
        ? "at-risk"
        : data.deliveryHealth.criticalRisks > 0
          ? "watch"
          : "healthy";

  return [
    {
      label: "Programme health",
      value: String(formatHonestKpi(healthValue, "Upload business case for health tier").value),
      hint: healthHint,
      tone: healthFormattedIsEmpty(healthValue) ? "default" : healthTone,
    },
    {
      label: "Budget",
      value: String(budgetFormatted.value),
      hint: budgetFormatted.hint,
      tone: financialIsLive ? "default" : "default",
    },
    {
      label: "Open risks",
      value: String(risksFormatted.value),
      hint: risksFormatted.hint,
      tone: risksTone,
    },
  ];
}

function healthFormattedIsEmpty(value: string | null): boolean {
  return value === null || value.trim().length === 0;
}
