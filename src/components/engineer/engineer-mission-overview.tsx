import type { EngineerMissionControl } from "@/services/engineerDashboard";
import { dxClass } from "@/lib/dx-theme";

const healthColor = {
  green: "text-[#1A6B3A]",
  amber: "text-[#B8860B]",
  red: "text-[#C0392B]",
};

export function EngineerMissionOverview({ data }: { data: EngineerMissionControl }) {
  const { overview } = data;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
      <Kpi label="Assigned stories" value={overview.assignedStories} />
      <Kpi
        label="Blocked stories"
        value={overview.blockedStories}
        tone={overview.blockedStories > 0 ? "amber" : undefined}
      />
      <Kpi label="Open PRs" value={overview.openPrs} />
      <Kpi
        label="Build health"
        value={overview.buildHealth}
        tone={overview.buildHealth}
      />
      <Kpi label="Sprint progress" value={`${overview.sprintProgress}%`} />
      <Kpi label="Technical debt" value={overview.technicalDebt} />
      <Kpi label="Deployment risk" value={overview.deploymentRisk} />
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
  tone?: "green" | "amber" | "red";
}) {
  return (
    <div className={`${dxClass.card} p-4`}>
      <p className="font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.14em] text-[#A8A89E]">
        {label}
      </p>
      <p
        className={`${dxClass.display} mt-1 text-xl capitalize leading-none ${
          tone ? healthColor[tone] : "text-[#0D0D0B]"
        }`}
      >
        {value}
      </p>
    </div>
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
