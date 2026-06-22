import type { FounderMissionControl } from "@/services/founderDashboard";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { formatHonestKpi, formatHonestPct } from "@/lib/honest-kpi";
import { EditableMissionAiSummary } from "@/components/dx/editable-mission-ai-summary";

const tierTone = {
  green: "healthy" as const,
  amber: "watch" as const,
  red: "at-risk" as const,
};

export function FounderMissionOverview({ data }: { data: FounderMissionControl }) {
  const sym = data.funding.currency === "GBP" ? "£" : "$";
  const financialIsLive = data.dataSources.financials === "live";

  const runway = formatHonestKpi(
    financialIsLive ? `${data.kpis.runwayMonths} mo` : null,
    "Set cash & burn in founder context",
  );
  const burn = formatHonestKpi(
    financialIsLive ? `${sym}${Math.round(data.kpis.monthlyBurn / 1000)}k/mo` : null,
    "Add financial profile for live burn",
  );
  const mrr = formatHonestKpi(
    financialIsLive ? `${sym}${Math.round(data.kpis.mrr / 1000)}k` : null,
    "Add revenue data for MRR",
  );
  const arr = formatHonestKpi(
    financialIsLive ? `${sym}${Math.round(data.kpis.arr / 1000)}k` : null,
    "Add revenue data for ARR",
  );
  const growth = formatHonestPct(
    financialIsLive ? data.kpis.growthPct : null,
    "Add growth metrics from financials",
  );
  const velocity = formatHonestKpi(
    financialIsLive ? data.kpis.teamVelocity : null,
    "Team velocity appears after delivery signals",
  );

  return (
    <MissionKpiGrid layout="mission">
      <MissionKpiCard
        label="Startup health"
        value={financialIsLive ? data.companyHealth.label : "—"}
        tone={financialIsLive ? tierTone[data.companyHealth.tier] : "default"}
        hint={runway.hint}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Runway"
        value={String(runway.value)}
        progressPct={
          financialIsLive
            ? Math.min(100, Math.round((data.kpis.runwayMonths / 18) * 100))
            : undefined
        }
        tone={
          financialIsLive
            ? data.kpis.runwayMonths >= 12
              ? "healthy"
              : data.kpis.runwayMonths >= 6
                ? "watch"
                : "at-risk"
            : "default"
        }
        hint={runway.hint}
        valueSize="xl"
      />
      <MissionKpiCard label="Burn rate" value={String(burn.value)} hint={burn.hint} valueSize="xl" />
      <MissionKpiCard label="MRR" value={String(mrr.value)} hint={mrr.hint} valueSize="xl" />
      <MissionKpiCard label="ARR" value={String(arr.value)} hint={arr.hint} valueSize="xl" />
      <MissionKpiCard
        label="Growth"
        value={String(growth.value)}
        tone={growth.isEmpty ? "default" : "healthy"}
        progressPct={growth.progressPct}
        hint={growth.hint}
        valueSize="xl"
      />
      <MissionKpiCard label="Team velocity" value={String(velocity.value)} hint={velocity.hint} valueSize="xl" />
    </MissionKpiGrid>
  );
}

export function FounderAiSummary({ summary }: { summary: string }) {
  return <EditableMissionAiSummary title="AI Chief of Staff summary" summary={summary} />;
}
