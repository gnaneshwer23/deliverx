import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";

const tierLabel: Record<PmMissionControl["overview"]["healthTier"], string> = {
  healthy: "Green",
  watch: "Amber",
  "at-risk": "Red",
};

function budgetProgressPct(budgetLabel: string): number | undefined {
  const match = budgetLabel.match(/([\d,.]+)\s*\/\s*([\d,.]+)/);
  if (!match) return undefined;
  const spent = Number.parseFloat(match[1].replace(/,/g, ""));
  const approved = Number.parseFloat(match[2].replace(/,/g, ""));
  if (!Number.isFinite(spent) || !Number.isFinite(approved) || approved <= 0) return undefined;
  return Math.round((spent / approved) * 100);
}

export function DeliveryPmMissionOverview({ data }: { data: PmMissionControl }) {
  const { overview } = data;
  const budgetPct = budgetProgressPct(overview.budgetLabel);
  const goLivePct =
    overview.goLiveProbability != null ? Math.round(overview.goLiveProbability * 100) : undefined;

  return (
    <MissionKpiGrid layout="wide">
      <MissionKpiCard
        label="Project health"
        value={tierLabel[overview.healthTier]}
        tone={overview.healthTier}
        progressPct={overview.healthScore}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Timeline"
        value={`${overview.timelineComplete}%`}
        hint="complete"
        tone={overview.timelineComplete >= 75 ? "healthy" : overview.timelineComplete >= 50 ? "watch" : "at-risk"}
        progressPct={overview.timelineComplete}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Budget"
        value={overview.budgetLabel}
        tone={
          budgetPct != null && budgetPct > 90
            ? "watch"
            : budgetPct != null && budgetPct > 100
              ? "at-risk"
              : "default"
        }
        progressPct={budgetPct}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Critical risks"
        value={overview.criticalRisks}
        tone={overview.criticalRisks > 0 ? "watch" : "healthy"}
        delta={
          overview.criticalRisks > 0
            ? { value: `${overview.criticalRisks} open`, direction: "warn" }
            : { value: "None", direction: "neutral" }
        }
        valueSize="xl"
      />
      <MissionKpiCard
        label="Open decisions"
        value={overview.openDecisions}
        tone={overview.openDecisions > 0 ? "watch" : "default"}
        delta={
          overview.openDecisions > 0
            ? { value: `${overview.openDecisions} pending`, direction: "warn" }
            : undefined
        }
        valueSize="xl"
      />
      <MissionKpiCard
        label="Blocked deps"
        value={overview.blockedDependencies}
        tone={overview.blockedDependencies > 0 ? "at-risk" : "healthy"}
        delta={
          overview.blockedDependencies > 0
            ? { value: `${overview.blockedDependencies} blocked`, direction: "down" }
            : undefined
        }
        valueSize="xl"
      />
      <MissionKpiCard
        label="Benefits"
        value={`${overview.benefitsDeliveredPct}%`}
        tone={overview.benefitsDeliveredPct >= 75 ? "healthy" : overview.benefitsDeliveredPct >= 40 ? "watch" : "default"}
        progressPct={overview.benefitsDeliveredPct}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Go-live probability"
        value={goLivePct != null ? `${goLivePct}%` : "—"}
        tone={
          goLivePct == null
            ? "default"
            : goLivePct >= 75
              ? "healthy"
              : goLivePct >= 50
                ? "watch"
                : "at-risk"
        }
        progressPct={goLivePct}
        valueSize="xl"
      />
    </MissionKpiGrid>
  );
}

export function DeliveryPmAiSummary({
  summary,
  projectId,
}: {
  summary: string;
  projectId?: string;
}) {
  return (
    <div className="rounded-xl border border-[#C6DDD0] bg-[#EEF5F1]/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#1C4A2E]">AI CPO summary</p>
      <p className="mt-2 text-sm leading-relaxed">&ldquo;{summary}&rdquo;</p>
      {projectId ? (
        <p className="mt-2 text-[10px] text-[#A8A89E]">
          Run delivery analysis in the project workspace to refresh insights.
        </p>
      ) : null}
    </div>
  );
}
