import type { ProductMissionControl } from "@/services/pmDashboard";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { FALLBACK_KPI_HINT } from "@/components/dx/mock-data-banner";
import { MissionAiSummaryBlock } from "@/components/dx/mission-ai-summary-block";
import { PanelAiInsight } from "@/components/dx/panel-ai-insight";
import { dxClass } from "@/lib/dx-theme";

export function ProductMissionOverview({ data }: { data: ProductMissionControl }) {
  const { kpis } = data;
  const roadmapHint =
    data.dataSources.roadmapRice === "fallback" ? FALLBACK_KPI_HINT : undefined;

  return (
    <MissionKpiGrid layout="mission">
      <MissionKpiCard
        label="Product health"
        value={`${kpis.productHealth}/100`}
        tone={kpis.productHealth >= 75 ? "healthy" : kpis.productHealth >= 50 ? "watch" : "default"}
        progressPct={kpis.productHealth}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Feature adoption"
        value={`${kpis.featureAdoption}%`}
        progressPct={kpis.featureAdoption}
        tone={kpis.featureAdoption >= 60 ? "healthy" : "default"}
        valueSize="xl"
      />
      <MissionKpiCard
        label="NPS"
        value={kpis.nps ?? "—"}
        tone={kpis.nps != null && kpis.nps >= 40 ? "healthy" : kpis.nps != null && kpis.nps < 20 ? "watch" : "default"}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Retention"
        value={kpis.retention != null ? `${kpis.retention}%` : "—"}
        progressPct={kpis.retention ?? undefined}
        tone={kpis.retention != null && kpis.retention >= 70 ? "healthy" : "default"}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Now horizon"
        value={kpis.featuresNow}
        hint={roadmapHint ?? `${kpis.featuresTotal} total`}
        tone="default"
        valueSize="xl"
      />
      <MissionKpiCard
        label="Customer insights"
        value={kpis.insightsCount}
        delta={kpis.insightsCount > 0 ? { value: "Active", direction: "up" } : undefined}
        valueSize="xl"
      />
    </MissionKpiGrid>
  );
}

export function ProductAiSummary({
  summary,
  differentiation,
}: {
  summary: string;
  differentiation: string | null;
  projectId?: string;
}) {
  return (
    <div className="space-y-3">
      <MissionAiSummaryBlock title="AI CPO summary" summary={summary} />
      {differentiation ? (
        <PanelAiInsight text={differentiation} label="Differentiation" className="mt-0" />
      ) : null}
    </div>
  );
}

export function ProductVisionPanel({
  vision,
}: {
  vision: ProductMissionControl["vision"];
}) {
  if (!vision) return null;
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} text-lg`}>Vision & strategy</h3>
      <p className="mt-3 text-sm font-medium text-[#0D0D0B]">{vision.statement}</p>
      <p className="mt-2 text-xs text-[#6B6B64]">
        North star: <span className="font-semibold">{vision.northStarMetric}</span>
      </p>
      {vision.objectives?.length ? (
        <ul className="mt-3 list-inside list-disc text-sm text-[#6B6B64]">
          {vision.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
