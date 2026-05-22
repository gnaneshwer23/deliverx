import { Activity, TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { Stability } from "@/services/adaptiveEngine";

const TIER_BORDER: Record<Stability["tier"], string> = {
  stable: "border-l-emerald-500",
  watch: "border-l-amber-500",
  unstable: "border-l-rose-500",
};

const TIER_LABEL: Record<Stability["tier"], string> = {
  stable: "Stable",
  watch: "Needs watch",
  unstable: "Unstable",
};

const VOLATILITY_ICON = {
  rising: TrendingUp,
  falling: TrendingDown,
  steady: Minus,
} as const;

const VOLATILITY_COLOR = {
  rising: "text-rose-600",
  falling: "text-emerald-600",
  steady: "text-slate-500",
} as const;

export function StabilityPanel({ stability }: { stability: Stability }) {
  const Icon = VOLATILITY_ICON[stability.volatility];

  return (
    <section
      className={`rounded-xl border border-l-4 bg-white p-6 shadow-sm ${TIER_BORDER[stability.tier]}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Activity size={14} /> Execution Stability
        </div>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
          {TIER_LABEL[stability.tier]}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <h3 className="text-3xl font-bold">{stability.score}</h3>
        <span className="text-sm text-slate-500">/ 100</span>
      </div>
      <div className="mt-3 h-1.5 rounded bg-slate-200">
        <div
          className="h-1.5 rounded bg-indigo-500"
          style={{ width: `${stability.score}%` }}
        />
      </div>
      <p
        className={`mt-2 flex items-center gap-1 text-xs ${VOLATILITY_COLOR[stability.volatility]}`}
      >
        <Icon size={12} /> Volatility {stability.volatility}
      </p>
      <ul className="mt-3 space-y-1 text-xs text-slate-500">
        {stability.drivers.map((d, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-slate-400">•</span>
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
