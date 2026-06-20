import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import { MissionKpiCard, MissionKpiGrid, type MissionKpiTone } from "@/components/dx/mission-kpi-card";
import { EditableMissionAiSummary } from "@/components/dx/editable-mission-ai-summary";
import { formatHonestKpi, formatHonestPct, limitDashboardKpis } from "@/lib/honest-kpi";

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
  const deliveryIsLive = data.dataSources.deliveryPlan === "live";
  const timeline = deliveryIsLive
    ? formatHonestPct(overview.timelineComplete, "Connect milestones from charter")
    : formatHonestPct(null, "Connect milestones from charter");
  const budget = deliveryIsLive
    ? formatHonestKpi(overview.budgetLabel, "Set budget after charter review")
    : formatHonestKpi(null, "Set budget after charter review");
  const budgetPct = deliveryIsLive ? budgetProgressPct(overview.budgetLabel) : undefined;
  const goLive = formatHonestPct(
    overview.goLiveProbability != null ? overview.goLiveProbability * 100 : null,
    "Forecast after delivery planning",
  );

  const cards: Array<{
    key: string;
    label: string;
    value: string | number;
    hint?: string;
    tone?: MissionKpiTone;
    progressPct?: number;
    delta?: { value: string; direction: "up" | "down" | "warn" | "neutral" };
  }> = limitDashboardKpis([
    {
      key: "health",
      label: "Project health",
      value: tierLabel[overview.healthTier],
      tone: overview.healthTier,
      progressPct: overview.healthScore,
    },
    {
      key: "timeline",
      label: "Timeline",
      value: timeline.value,
      hint: timeline.hint,
      tone: timeline.isEmpty
        ? "default"
        : overview.timelineComplete >= 75
          ? "healthy"
          : overview.timelineComplete >= 50
            ? "watch"
            : "at-risk",
      progressPct: timeline.progressPct,
    },
    {
      key: "budget",
      label: "Budget",
      value: budget.value,
      hint: budget.hint,
      tone:
        budgetPct != null && budgetPct > 100
          ? "at-risk"
          : budgetPct != null && budgetPct > 90
            ? "watch"
            : "default",
      progressPct: budgetPct,
    },
    {
      key: "risks",
      label: "Critical risks",
      value: overview.criticalRisks,
      tone: overview.criticalRisks > 0 ? "watch" : "healthy",
      delta:
        overview.criticalRisks > 0
          ? { value: `${overview.criticalRisks} open`, direction: "warn" as const }
          : { value: "None", direction: "neutral" as const },
    },
    {
      key: "decisions",
      label: "Open decisions",
      value: overview.openDecisions,
      tone: overview.openDecisions > 0 ? "watch" : "default",
      delta:
        overview.openDecisions > 0
          ? { value: `${overview.openDecisions} pending`, direction: "warn" as const }
          : undefined,
    },
    {
      key: "blockers",
      label: "Blocked deps",
      value: overview.blockedDependencies,
      tone: overview.blockedDependencies > 0 ? "at-risk" : "healthy",
      delta:
        overview.blockedDependencies > 0
          ? { value: `${overview.blockedDependencies} blocked`, direction: "down" as const }
          : undefined,
    },
    {
      key: "go-live",
      label: "Go-live probability",
      value: goLive.value,
      hint: goLive.hint,
      tone: goLive.isEmpty
        ? "default"
        : (overview.goLiveProbability ?? 0) >= 0.75
          ? "healthy"
          : (overview.goLiveProbability ?? 0) >= 0.5
            ? "watch"
            : "at-risk",
      progressPct: goLive.progressPct,
    },
  ]);

  return (
    <MissionKpiGrid layout="wide">
      {cards.map((card) => (
        <MissionKpiCard
          key={card.key}
          label={card.label}
          value={card.value}
          hint={card.hint}
          tone={card.tone}
          progressPct={card.progressPct}
          delta={card.delta}
          valueSize="xl"
        />
      ))}
    </MissionKpiGrid>
  );
}

export function DeliveryPmAiSummary({
  summary,
  compact = false,
  title = "AI delivery summary",
}: {
  summary: string;
  projectId?: string;
  compact?: boolean;
  title?: string;
}) {
  return (
    <EditableMissionAiSummary title={title} summary={summary} compact={compact} icon />
  );
}
