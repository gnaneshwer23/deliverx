import { Activity, AlertOctagon, Layers, ShieldAlert } from "lucide-react";
import type { DigitalTwinState } from "@/services/twinEngine";

const SCORE_BORDER = (score: number) =>
  score >= 80
    ? "border-l-emerald-500"
    : score >= 60
      ? "border-l-amber-500"
      : "border-l-rose-500";

const RISK_BORDER = (p: number) =>
  p < 0.3
    ? "border-l-emerald-500"
    : p < 0.6
      ? "border-l-amber-500"
      : "border-l-rose-500";

export function TwinKpiStrip({ state }: { state: DigitalTwinState }) {
  const failurePct = Math.round(state.portfolio.failureProbability * 100);
  const milestonePct = Math.round(state.portfolio.milestoneRisk * 100);
  const summary = [
    `Portfolio health ${state.portfolio.health} of 100`,
    `Stability ${state.portfolio.stability} of 100`,
    `Failure risk ${failurePct} percent`,
    `Milestone risk ${milestonePct} percent`,
  ].join(". ");

  return (
    <section aria-label="Digital Twin portfolio KPIs">
      <p className="sr-only">{summary}</p>
      <p className="mb-3 text-xs text-slate-500">
        Text summary: {summary}. These are portfolio simulation signals — not
        capability scores.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <Card
          label="Portfolio Health"
          value={`${state.portfolio.health}`}
          suffix=" / 100"
          icon={Activity}
          border={SCORE_BORDER(state.portfolio.health)}
        />
        <Card
          label="Stability"
          value={`${state.portfolio.stability}`}
          suffix=" / 100"
          icon={Layers}
          border={SCORE_BORDER(state.portfolio.stability)}
        />
        <Card
          label="Failure Risk"
          value={`${failurePct}%`}
          icon={AlertOctagon}
          border={RISK_BORDER(state.portfolio.failureProbability)}
        />
        <Card
          label="Milestone Risk"
          value={`${milestonePct}%`}
          icon={ShieldAlert}
          border={RISK_BORDER(state.portfolio.milestoneRisk)}
        />
      </div>
    </section>
  );
}

function Card({
  label,
  value,
  suffix,
  icon: Icon,
  border,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
  border: string;
}) {
  return (
    <div
      className={`rounded-xl border border-l-4 bg-white p-6 shadow-sm ${border}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon size={14} className="text-slate-400" aria-hidden />
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <p className="text-3xl font-bold" aria-label={`${label}: ${value}${suffix ?? ""}`}>
          {value}
        </p>
        {suffix ? (
          <span className="text-sm text-slate-500">{suffix}</span>
        ) : null}
      </div>
    </div>
  );
}
