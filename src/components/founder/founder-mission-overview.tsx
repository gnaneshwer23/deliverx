import type { FounderMissionControl } from "@/services/founderDashboard";
import { dxClass } from "@/lib/dx-theme";

const tierColor = {
  green: "text-[#1A6B3A]",
  amber: "text-[#B8860B]",
  red: "text-[#C0392B]",
};

export function FounderMissionOverview({ data }: { data: FounderMissionControl }) {
  const sym = data.funding.currency === "GBP" ? "£" : "$";
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
      <Kpi
        label="Startup health"
        value={data.companyHealth.label}
        tone={data.companyHealth.tier}
      />
      <Kpi label="Runway" value={`${data.kpis.runwayMonths} mo`} />
      <Kpi label="Burn rate" value={`${sym}${Math.round(data.kpis.monthlyBurn / 1000)}k/mo`} />
      <Kpi label="MRR" value={`${sym}${Math.round(data.kpis.mrr / 1000)}k`} />
      <Kpi label="ARR" value={`${sym}${Math.round(data.kpis.arr / 1000)}k`} />
      <Kpi label="Growth" value={`+${data.kpis.growthPct}%`} tone="green" />
      <Kpi label="Team velocity" value={data.kpis.teamVelocity} />
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
      <p className={`${dxClass.display} mt-1 text-xl leading-none ${tone ? tierColor[tone] : "text-[#0D0D0B]"}`}>
        {value}
      </p>
    </div>
  );
}

export function FounderAiSummary({ summary }: { summary: string }) {
  return (
    <div className="rounded-xl border border-[#C6DDD0] bg-[#EEF5F1]/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#1C4A2E]">
        AI Chief of Staff summary
      </p>
      <p className="mt-2 text-sm leading-relaxed">&ldquo;{summary}&rdquo;</p>
    </div>
  );
}
