import type { FounderMissionControl } from "@/services/founderDashboard";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { FALLBACK_KPI_HINT } from "@/components/dx/mock-data-banner";
import { EditableMissionAiSummary } from "@/components/dx/editable-mission-ai-summary";

const tierTone = {
  green: "healthy" as const,
  amber: "watch" as const,
  red: "at-risk" as const,
};

export function FounderMissionOverview({ data }: { data: FounderMissionControl }) {
  const sym = data.funding.currency === "GBP" ? "£" : "$";
  const runwayPct = Math.min(100, Math.round((data.kpis.runwayMonths / 18) * 100));
  const financialHint =
    data.dataSources.financials === "fallback" ? FALLBACK_KPI_HINT : undefined;

  return (
    <MissionKpiGrid layout="mission">
      <MissionKpiCard label="Startup health" value={data.companyHealth.label} tone={tierTone[data.companyHealth.tier]} valueSize="xl" hint={financialHint} />
      <MissionKpiCard label="Runway" value={`${data.kpis.runwayMonths} mo`} progressPct={runwayPct} tone={data.kpis.runwayMonths >= 12 ? "healthy" : data.kpis.runwayMonths >= 6 ? "watch" : "at-risk"} valueSize="xl" hint={financialHint} />
      <MissionKpiCard label="Burn rate" value={`${sym}${Math.round(data.kpis.monthlyBurn / 1000)}k/mo`} valueSize="xl" hint={financialHint} />
      <MissionKpiCard label="MRR" value={`${sym}${Math.round(data.kpis.mrr / 1000)}k`} valueSize="xl" hint={financialHint} />
      <MissionKpiCard label="ARR" value={`${sym}${Math.round(data.kpis.arr / 1000)}k`} valueSize="xl" hint={financialHint} />
      <MissionKpiCard label="Growth" value={`+${data.kpis.growthPct}%`} tone="healthy" progressPct={Math.min(100, data.kpis.growthPct)} delta={{ value: "MoM", direction: "up" }} valueSize="xl" hint={financialHint} />
      <MissionKpiCard label="Team velocity" value={data.kpis.teamVelocity} valueSize="xl" />
    </MissionKpiGrid>
  );
}

export function FounderAiSummary({ summary }: { summary: string }) {
  return <EditableMissionAiSummary title="AI Chief of Staff summary" summary={summary} />;
}
