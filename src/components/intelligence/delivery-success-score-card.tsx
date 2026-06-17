import type { DeliverySuccessScore } from "@/services/successScoreEngine";

const TIER_BAR: Record<DeliverySuccessScore["tier"], string> = {
  healthy: "bg-emerald-500",
  watch: "bg-amber-500",
  "at-risk": "bg-rose-500",
};

const TIER_LABEL: Record<DeliverySuccessScore["tier"], string> = {
  healthy: "On track",
  watch: "Watch",
  "at-risk": "At risk",
};

export function DeliverySuccessScoreCard({
  score,
}: {
  score: DeliverySuccessScore;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">Delivery success score</p>
      <div className="mt-1 flex items-baseline gap-2">
        <h3 className="text-3xl font-bold">{score.score}</h3>
        <span className="text-sm text-slate-500">/ 100</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {TIER_LABEL[score.tier]}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded bg-slate-200">
        <div
          className={`h-2 rounded ${TIER_BAR[score.tier]} transition-all`}
          style={{ width: `${score.score}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
        {(
          [
            ["Timeline", score.components.timeline],
            ["Confidence", score.components.deliveryConfidence],
            ["Health", score.components.health],
            ["Alignment", score.components.alignment],
            ["Estimates", score.components.estimation],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="rounded-lg bg-slate-50 px-2 py-1.5 text-center">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
            <p className="font-semibold text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      <ul className="mt-3 space-y-1">
        {score.factors.map((factor) => (
          <li key={factor} className="text-xs text-slate-600">
            · {factor}
          </li>
        ))}
      </ul>
    </div>
  );
}
