import type { FounderMissionControl } from "@/services/founderDashboard";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";

const tierTone = {
  green: "healthy" as const,
  amber: "watch" as const,
  red: "at-risk" as const,
};

export function FounderMissionOverview({ data }: { data: FounderMissionControl }) {
  const sym = data.funding.currency === "GBP" ? "£" : "$";
  const runwayPct = Math.min(100, Math.round((data.kpis.runwayMonths / 18) * 100));

  return (
    <MissionKpiGrid layout="mission">
      <MissionKpiCard
        label="Startup health"
        value={data.companyHealth.label}
        tone={tierTone[data.companyHealth.tier]}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Runway"
        value={`${data.kpis.runwayMonths} mo`}
        progressPct={runwayPct}
        tone={data.kpis.runwayMonths >= 12 ? "healthy" : data.kpis.runwayMonths >= 6 ? "watch" : "at-risk"}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Burn rate"
        value={`${sym}${Math.round(data.kpis.monthlyBurn / 1000)}k/mo`}
        valueSize="xl"
      />
      <MissionKpiCard label="MRR" value={`${sym}${Math.round(data.kpis.mrr / 1000)}k`} valueSize="xl" />
      <MissionKpiCard label="ARR" value={`${sym}${Math.round(data.kpis.arr / 1000)}k`} valueSize="xl" />
      <MissionKpiCard
        label="Growth"
        value={`+${data.kpis.growthPct}%`}
        tone="healthy"
        progressPct={Math.min(100, data.kpis.growthPct)}
        delta={{ value: "MoM", direction: "up" }}
        valueSize="xl"
      />
      <MissionKpiCard label="Team velocity" value={data.kpis.teamVelocity} valueSize="xl" />
    </MissionKpiGrid>
  );
}

export function FounderAiSummary({ summary }: { summary: string }) {
  return (
    <div className="rounded-xl border border-[#C6DDD0] bg-[#EEF5F1]/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#1C4A2E]">
        AI Chief of Staff summary
      </p>
      <p className="mt-2 text-sm leading-relaxed">&ldquo;{summary}&rdquo;</p>
    </div>
  );
}
