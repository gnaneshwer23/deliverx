import type { ProductMissionControl } from "@/services/pmDashboard";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { formatHonestKpi, formatHonestPct } from "@/lib/honest-kpi";
import { MissionAiSummaryBlock } from "@/components/dx/mission-ai-summary-block";
import { PanelAiInsight } from "@/components/dx/panel-ai-insight";
import { dxClass } from "@/lib/dx-theme";

export function ProductMissionOverview({ data }: { data: ProductMissionControl }) {
  const { kpis } = data;
  const isLive = data.dataSources.roadmapRice === "live";

  const health = formatHonestPct(
    isLive && kpis.productHealth > 0 ? kpis.productHealth : null,
    "Run product analysis for health score",
  );
  const adoption = formatHonestPct(
    isLive && kpis.featureAdoption > 0 ? kpis.featureAdoption : null,
    "Connect usage data for adoption",
  );
  const nps = formatHonestKpi(kpis.nps, "Add NPS survey data");
  const retention = formatHonestPct(kpis.retention, "Connect retention analytics");
  const nowHorizon = formatHonestKpi(
    isLive ? kpis.featuresNow : null,
    "Populate roadmap after product analysis",
  );

  return (
    <MissionKpiGrid layout="mission">
      <MissionKpiCard
        label="Product health"
        value={String(health.value)}
        tone={health.isEmpty ? "default" : (health.progressPct ?? 0) >= 75 ? "healthy" : "watch"}
        progressPct={health.progressPct}
        hint={health.hint}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Feature adoption"
        value={String(adoption.value)}
        progressPct={adoption.progressPct}
        tone={adoption.isEmpty ? "default" : (adoption.progressPct ?? 0) >= 60 ? "healthy" : "default"}
        hint={adoption.hint}
        valueSize="xl"
      />
      <MissionKpiCard
        label="NPS"
        value={String(nps.value)}
        tone={typeof nps.value === "number" && nps.value >= 40 ? "healthy" : "default"}
        hint={nps.hint}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Retention"
        value={String(retention.value)}
        progressPct={retention.progressPct}
        tone={retention.isEmpty ? "default" : (retention.progressPct ?? 0) >= 70 ? "healthy" : "default"}
        hint={retention.hint}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Now horizon"
        value={String(nowHorizon.value)}
        hint={nowHorizon.hint ?? `${kpis.featuresTotal} total features`}
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
