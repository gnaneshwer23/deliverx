import type { ScrumMissionControl } from "@/services/scrumDashboard";
import { dxClass } from "@/lib/dx-theme";

export function ScrumMissionOverview({ data }: { data: ScrumMissionControl }) {
  const { overview } = data;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
      <Kpi label="Sprint" value={overview.sprintLabel} />
      <Kpi label="Completion" value={`${overview.completionPct}%`} />
      <Kpi label="Days left" value={overview.daysRemaining} />
      <Kpi label="Blocked" value={overview.blockedStories} tone={overview.blockedStories > 0 ? "amber" : undefined} />
      <Kpi label="Velocity" value={overview.velocityTrend} />
      <Kpi label="Team health" value={overview.teamHealth} tone={overview.teamHealth === "Green" ? "green" : "amber"} />
      <Kpi label="Burnout risk" value={overview.burnoutRisk} />
      <Kpi label="Success prob." value={`${overview.sprintSuccessProbability}%`} />
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "green" | "amber";
}) {
  return (
    <div className={`${dxClass.card} p-4`}>
      <p className="font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.14em] text-[#A8A89E]">
        {label}
      </p>
      <p
        className={`${dxClass.display} mt-1 text-xl leading-none ${
          tone === "green" ? "text-[#1A6B3A]" : tone === "amber" ? "text-[#B8860B]" : "text-[#0D0D0B]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function ScrumAiSummary({ summary }: { summary: string }) {
  return (
    <div className="rounded-xl border border-[#C6DDD0] bg-[#EEF5F1]/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#1C4A2E]">AI agile coach</p>
      <p className="mt-2 text-sm leading-relaxed">&ldquo;{summary}&rdquo;</p>
    </div>
  );
}
