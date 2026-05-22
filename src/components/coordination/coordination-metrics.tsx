import { GitMerge } from "lucide-react";

export function CoordinationStabilityPanel({
  stability,
}: {
  stability: number;
}) {
  const tier =
    stability >= 80 ? "Stable" : stability >= 60 ? "Watch" : "Unstable";
  const color =
    stability >= 80
      ? "border-l-emerald-500"
      : stability >= 60
        ? "border-l-amber-500"
        : "border-l-rose-500";

  return (
    <div
      className={`rounded-xl border border-l-4 bg-white p-6 shadow-sm ${color}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">Coordination Stability</p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">{stability}</h3>
            <span className="text-sm text-slate-500">/ 100</span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-600">{tier}</p>
        </div>
        <GitMerge size={16} className="text-slate-400" />
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Multi-agent alignment across programmes, dependencies, and governance.
      </p>
    </div>
  );
}

export function GovernanceFrictionPanel({
  friction,
}: {
  friction: number;
}) {
  const tier =
    friction < 30 ? "Low friction" : friction < 60 ? "Moderate" : "High friction";
  const color =
    friction < 30
      ? "border-l-emerald-500"
      : friction < 60
        ? "border-l-amber-500"
        : "border-l-rose-500";

  return (
    <div
      className={`rounded-xl border border-l-4 bg-white p-6 shadow-sm ${color}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">Governance Friction Index</p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">{friction}</h3>
            <span className="text-sm text-slate-500">/ 100</span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-600">{tier}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Approval latency and governance gate delays across the portfolio.
      </p>
    </div>
  );
}
