import type { QaMissionControl } from "@/services/qaDashboard";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { formatHonestKpi, formatHonestPct } from "@/lib/honest-kpi";
import { MissionAiSummaryBlock } from "@/components/dx/mission-ai-summary-block";

export function QaMissionOverview({ data }: { data: QaMissionControl }) {
  const { overview } = data;
  const isLive = data.dataSources.qaMetrics === "live";

  const readiness = formatHonestPct(
    isLive && overview.releaseReadiness > 0 ? overview.releaseReadiness : null,
    "Run QA analysis for readiness score",
  );
  const coverage = formatHonestPct(
    isLive && overview.testCoverage > 0 ? overview.testCoverage : null,
    "Add test cases for coverage",
  );
  const automation = formatHonestPct(
    isLive && overview.automationCoverage > 0 ? overview.automationCoverage : null,
    "Automate regression suite",
  );
  const uat = formatHonestPct(
    isLive && overview.uatCompletion > 0 ? overview.uatCompletion : null,
    "Set up UAT plan",
  );
  const productionRisk = formatHonestKpi(
    isLive ? overview.productionRisk : null,
    "Connect QA metrics for risk assessment",
  );

  return (
    <MissionKpiGrid layout="mission">
      <MissionKpiCard
        label="Release readiness"
        value={String(readiness.value)}
        progressPct={readiness.progressPct}
        tone={readiness.isEmpty ? "default" : (readiness.progressPct ?? 0) >= 80 ? "healthy" : "watch"}
        hint={readiness.hint}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Test coverage"
        value={String(coverage.value)}
        progressPct={coverage.progressPct}
        tone={coverage.isEmpty ? "default" : "healthy"}
        hint={coverage.hint}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Automation"
        value={String(automation.value)}
        progressPct={automation.progressPct}
        tone={automation.isEmpty ? "default" : (automation.progressPct ?? 0) >= 60 ? "healthy" : "default"}
        hint={automation.hint}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Open defects"
        value={overview.openDefects}
        delta={overview.openDefects > 0 ? { value: `${overview.openDefects} open`, direction: "warn" } : undefined}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Critical"
        value={overview.criticalDefects}
        tone={overview.criticalDefects > 0 ? "watch" : "healthy"}
        delta={
          overview.criticalDefects > 0
            ? { value: `${overview.criticalDefects} critical`, direction: "down" }
            : undefined
        }
        valueSize="xl"
      />
      <MissionKpiCard
        label="UAT completion"
        value={String(uat.value)}
        progressPct={uat.progressPct}
        tone={uat.isEmpty ? "default" : (uat.progressPct ?? 0) >= 90 ? "healthy" : "watch"}
        hint={uat.hint}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Prod. risk"
        value={String(productionRisk.value)}
        tone={productionRisk.isEmpty ? "default" : overview.productionRisk === "Low" ? "healthy" : "watch"}
        hint={productionRisk.hint}
        valueSize="xl"
      />
    </MissionKpiGrid>
  );
}

export function QaAiSummary({ summary }: { summary: string }) {
  return <MissionAiSummaryBlock title="AI quality engineer" summary={summary} />;
}
