import type { EngineerMissionControl } from "@/services/engineerDashboard";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";

const buildHealthTone = {
  green: "healthy" as const,
  amber: "watch" as const,
  red: "at-risk" as const,
};

export function EngineerMissionOverview({ data }: { data: EngineerMissionControl }) {
  const { overview } = data;

  return (
    <MissionKpiGrid layout="mission">
      <MissionKpiCard label="Assigned stories" value={overview.assignedStories} valueSize="xl" />
      <MissionKpiCard
        label="Blocked stories"
        value={overview.blockedStories}
        tone={overview.blockedStories > 0 ? "watch" : "healthy"}
        delta={
          overview.blockedStories > 0
            ? { value: `${overview.blockedStories} blocked`, direction: "down" }
            : undefined
        }
        valueSize="xl"
      />
      <MissionKpiCard label="Open PRs" value={overview.openPrs} valueSize="xl" />
      <MissionKpiCard
        label="Build health"
        value={overview.buildHealth}
        tone={buildHealthTone[overview.buildHealth]}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Sprint progress"
        value={`${overview.sprintProgress}%`}
        progressPct={overview.sprintProgress}
        tone={overview.sprintProgress >= 75 ? "healthy" : overview.sprintProgress >= 40 ? "watch" : "default"}
        valueSize="xl"
      />
      <MissionKpiCard label="Technical debt" value={overview.technicalDebt} valueSize="xl" />
      <MissionKpiCard
        label="Deployment risk"
        value={overview.deploymentRisk}
        tone={
          overview.deploymentRisk.toLowerCase() === "low"
            ? "healthy"
            : overview.deploymentRisk.toLowerCase() === "high"
              ? "at-risk"
              : "watch"
        }
        valueSize="xl"
      />
    </MissionKpiGrid>
  );
}

export function EngineerAiSummary({ summary }: { summary: string }) {
  return (
    <div className="rounded-xl border border-[#C6DDD0] bg-[#EEF5F1]/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#1C4A2E]">
        AI engineering copilot
      </p>
      <p className="mt-2 text-sm leading-relaxed">&ldquo;{summary}&rdquo;</p>
    </div>
  );
}
