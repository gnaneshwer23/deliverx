import type { QaMissionControl } from "@/services/qaDashboard";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { FALLBACK_KPI_HINT } from "@/components/dx/mock-data-banner";
import { MissionAiSummaryBlock } from "@/components/dx/mission-ai-summary-block";

export function QaMissionOverview({ data }: { data: QaMissionControl }) {
  const { overview } = data;
  const metricsHint = data.dataSources.qaMetrics === "fallback" ? FALLBACK_KPI_HINT : undefined;

  return (
    <MissionKpiGrid layout="mission">
      <MissionKpiCard label="Release readiness" value={`${overview.releaseReadiness}%`} progressPct={overview.releaseReadiness} tone={overview.releaseReadiness >= 80 ? "healthy" : overview.releaseReadiness >= 50 ? "watch" : "at-risk"} valueSize="xl" hint={metricsHint} />
      <MissionKpiCard label="Test coverage" value={`${overview.testCoverage}%`} progressPct={overview.testCoverage} tone="healthy" valueSize="xl" hint={metricsHint} />
      <MissionKpiCard label="Automation" value={`${overview.automationCoverage}%`} progressPct={overview.automationCoverage} tone={overview.automationCoverage >= 60 ? "healthy" : "default"} valueSize="xl" hint={metricsHint} />
      <MissionKpiCard label="Open defects" value={overview.openDefects} delta={overview.openDefects > 0 ? { value: `${overview.openDefects} open`, direction: "warn" } : undefined} valueSize="xl" />
      <MissionKpiCard label="Critical" value={overview.criticalDefects} tone={overview.criticalDefects > 0 ? "watch" : "healthy"} delta={overview.criticalDefects > 0 ? { value: `${overview.criticalDefects} critical`, direction: "down" } : undefined} valueSize="xl" />
      <MissionKpiCard label="UAT completion" value={`${overview.uatCompletion}%`} progressPct={overview.uatCompletion} tone={overview.uatCompletion >= 90 ? "healthy" : "watch"} valueSize="xl" />
      <MissionKpiCard label="Prod. risk" value={overview.productionRisk} tone={overview.productionRisk === "Low" ? "healthy" : "watch"} valueSize="xl" />
    </MissionKpiGrid>
  );
}

export function QaAiSummary({ summary }: { summary: string }) {
  return <MissionAiSummaryBlock title="AI quality engineer" summary={summary} />;
}
