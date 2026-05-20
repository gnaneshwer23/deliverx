import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { Health } from "@/services/intelligenceEngine";

const TIER_BORDER: Record<Health["tier"], string> = {
  healthy: "border-green-500",
  watch: "border-yellow-500",
  "at-risk": "border-red-500",
};

const TIER_LABEL: Record<Health["tier"], string> = {
  healthy: "Healthy",
  watch: "Needs watch",
  "at-risk": "At risk",
};

export function ProjectHealthCard({ health }: { health: Health }) {
  const Arrow =
    health.trend === "down" ? ArrowDownRight : health.trend === "up" ? ArrowUpRight : Minus;
  const trendLabel =
    health.trend === "down" ? "Declining" : health.trend === "up" ? "Improving" : "Stable";

  return (
    <div
      className={`rounded-xl border border-l-4 bg-white p-6 shadow-sm ${TIER_BORDER[health.tier]}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Project Health</p>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
          {TIER_LABEL[health.tier]}
        </span>
      </div>

      <div className="mt-1 flex items-baseline gap-2">
        <h3 className="text-3xl font-bold">{health.score}</h3>
        <span className="text-sm text-slate-500">/ 100</span>
      </div>

      <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
        <Arrow size={12} /> {trendLabel}
      </p>

      <ul className="mt-3 space-y-1 text-sm text-slate-600">
        {health.factors.map((factor) => (
          <li key={factor} className="flex gap-2">
            <span className="text-slate-400">•</span>
            <span>{factor}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
