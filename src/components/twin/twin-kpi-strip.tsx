import { Activity, ShieldAlert, AlertOctagon, Layers } from "lucide-react";
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
  return (
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
        value={`${Math.round(state.portfolio.failureProbability * 100)}%`}
        icon={AlertOctagon}
        border={RISK_BORDER(state.portfolio.failureProbability)}
      />
      <Card
        label="Milestone Risk"
        value={`${Math.round(state.portfolio.milestoneRisk * 100)}%`}
        icon={ShieldAlert}
        border={RISK_BORDER(state.portfolio.milestoneRisk)}
      />
    </div>
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
  icon: React.ComponentType<{ size?: number; className?: string }>;
  border: string;
}) {
  return (
    <div
      className={`rounded-xl border border-l-4 bg-white p-6 shadow-sm ${border}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon size={14} className="text-slate-400" />
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <h3 className="text-3xl font-bold">{value}</h3>
        {suffix ? (
          <span className="text-sm text-slate-500">{suffix}</span>
        ) : null}
      </div>
    </div>
  );
}
