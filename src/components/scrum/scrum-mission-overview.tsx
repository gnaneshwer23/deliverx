import type { ScrumMissionControl } from "@/services/scrumDashboard";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { MissionAiSummaryBlock } from "@/components/dx/mission-ai-summary-block";

export function ScrumMissionOverview({ data }: { data: ScrumMissionControl }) {
  const { overview } = data;

  return (
    <MissionKpiGrid layout="wide">
      <MissionKpiCard label="Sprint" value={overview.sprintLabel} valueSize="xl" />
      <MissionKpiCard
        label="Completion"
        value={`${overview.completionPct}%`}
        progressPct={overview.completionPct}
        tone={overview.completionPct >= 75 ? "healthy" : overview.completionPct >= 50 ? "watch" : "default"}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Days left"
        value={overview.daysRemaining}
        tone={overview.daysRemaining <= 2 ? "watch" : "default"}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Blocked"
        value={overview.blockedStories}
        tone={overview.blockedStories > 0 ? "watch" : "healthy"}
        delta={
          overview.blockedStories > 0
            ? { value: `${overview.blockedStories} blocked`, direction: "down" }
            : undefined
        }
        valueSize="xl"
      />
      <MissionKpiCard label="Velocity" value={overview.velocityTrend} valueSize="xl" />
      <MissionKpiCard
        label="Team health"
        value={overview.teamHealth}
        tone={overview.teamHealth === "Green" ? "healthy" : "watch"}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Burnout risk"
        value={overview.burnoutRisk}
        tone={overview.burnoutRisk === "Low" ? "healthy" : "watch"}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Success prob."
        value={`${overview.sprintSuccessProbability}%`}
        progressPct={overview.sprintSuccessProbability}
        tone={
          overview.sprintSuccessProbability >= 75
            ? "healthy"
            : overview.sprintSuccessProbability >= 50
              ? "watch"
              : "at-risk"
        }
        valueSize="xl"
      />
    </MissionKpiGrid>
  );
}

export function ScrumAiSummary({ summary }: { summary: string }) {
  return <MissionAiSummaryBlock title="AI agile coach" summary={summary} />;
}
