import type { QaMissionControl } from "@/services/qaDashboard";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";

export function QaMissionOverview({ data }: { data: QaMissionControl }) {
  const { overview } = data;

  return (
    <MissionKpiGrid layout="mission">
      <MissionKpiCard
        label="Release readiness"
        value={`${overview.releaseReadiness}%`}
        progressPct={overview.releaseReadiness}
        tone={overview.releaseReadiness >= 80 ? "healthy" : overview.releaseReadiness >= 50 ? "watch" : "at-risk"}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Test coverage"
        value={`${overview.testCoverage}%`}
        progressPct={overview.testCoverage}
        tone="healthy"
        valueSize="xl"
      />
      <MissionKpiCard
        label="Automation"
        value={`${overview.automationCoverage}%`}
        progressPct={overview.automationCoverage}
        tone={overview.automationCoverage >= 60 ? "healthy" : "default"}
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
        value={`${overview.uatCompletion}%`}
        progressPct={overview.uatCompletion}
        tone={overview.uatCompletion >= 90 ? "healthy" : "watch"}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Prod. risk"
        value={overview.productionRisk}
        tone={overview.productionRisk === "Low" ? "healthy" : "watch"}
        valueSize="xl"
      />
    </MissionKpiGrid>
  );
}

export function QaAiSummary({ summary }: { summary: string }) {
  return (
    <div className="rounded-xl border border-[#C6DDD0] bg-[#EEF5F1]/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#1C4A2E]">
        AI quality engineer
      </p>
      <p className="mt-2 text-sm leading-relaxed">&ldquo;{summary}&rdquo;</p>
    </div>
  );
}
