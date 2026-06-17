import type { QaMissionControl } from "@/services/qaDashboard";
import { dxClass } from "@/lib/dx-theme";

export function QaMissionOverview({ data }: { data: QaMissionControl }) {
  const { overview } = data;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
      <Kpi label="Release readiness" value={`${overview.releaseReadiness}%`} />
      <Kpi label="Test coverage" value={`${overview.testCoverage}%`} tone="green" />
      <Kpi label="Automation" value={`${overview.automationCoverage}%`} />
      <Kpi label="Open defects" value={overview.openDefects} />
      <Kpi
        label="Critical"
        value={overview.criticalDefects}
        tone={overview.criticalDefects > 0 ? "amber" : undefined}
      />
      <Kpi label="UAT completion" value={`${overview.uatCompletion}%`} />
      <Kpi
        label="Prod. risk"
        value={overview.productionRisk}
        tone={overview.productionRisk === "Low" ? "green" : "amber"}
      />
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
