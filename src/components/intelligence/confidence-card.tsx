import type { Confidence } from "@/services/intelligenceEngine";

const TIER_BAR: Record<Confidence["tier"], string> = {
  healthy: "bg-green-500",
  watch: "bg-yellow-500",
  "at-risk": "bg-red-500",
};

export function ConfidenceCard({ confidence }: { confidence: Confidence }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">Delivery Confidence</p>
      <div className="mt-1 flex items-baseline gap-2">
        <h3 className="text-3xl font-bold">{confidence.score}</h3>
        <span className="text-sm text-slate-500">%</span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded bg-slate-200">
        <div
          className={`h-2 rounded ${TIER_BAR[confidence.tier]} transition-all`}
          style={{ width: `${confidence.score}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-600">{confidence.explanation}</p>
    </div>
  );
}
