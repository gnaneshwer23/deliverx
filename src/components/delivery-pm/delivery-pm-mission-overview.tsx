import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import { dxClass } from "@/lib/dx-theme";

const tierLabel: Record<PmMissionControl["overview"]["healthTier"], string> = {
  healthy: "Green",
  watch: "Amber",
  "at-risk": "Red",
};

export function DeliveryPmMissionOverview({ data }: { data: PmMissionControl }) {
  const { overview } = data;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
      <Kpi label="Project health" value={tierLabel[overview.healthTier]} tone={overview.healthTier} />
      <Kpi label="Timeline" value={`${overview.timelineComplete}%`} hint="complete" />
      <Kpi label="Budget" value={overview.budgetLabel} />
      <Kpi label="Critical risks" value={overview.criticalRisks} tone={overview.criticalRisks > 0 ? "watch" : "healthy"} />
      <Kpi label="Open decisions" value={overview.openDecisions} />
      <Kpi label="Blocked deps" value={overview.blockedDependencies} />
      <Kpi label="Benefits" value={`${overview.benefitsDeliveredPct}%`} />
      <Kpi
        label="Go-live probability"
        value={overview.goLiveProbability != null ? `${Math.round(overview.goLiveProbability * 100)}%` : "—"}
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: PmMissionControl["overview"]["healthTier"];
}) {
  const color =
    tone === "healthy"
      ? "text-[#1A6B3A]"
      : tone === "at-risk"
        ? "text-[#C0392B]"
        : tone === "watch"
          ? "text-[#B8860B]"
          : "text-[#0D0D0B]";

  return (
    <div className={`${dxClass.card} p-4`}>
      <p className="font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.14em] text-[#A8A89E]">
        {label}
      </p>
      <p className={`${dxClass.display} mt-1 text-xl leading-none ${color}`}>{value}</p>
      {hint ? <p className="mt-1 text-[10px] text-[#A8A89E]">{hint}</p> : null}
    </div>
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
