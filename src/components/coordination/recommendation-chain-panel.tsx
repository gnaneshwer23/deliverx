import { Link2 } from "lucide-react";
import type { UnifiedRecommendation } from "@/services/coordinationEngine";

export function RecommendationChainPanel({
  recommendations,
  chainSummary,
}: {
  recommendations: UnifiedRecommendation[];
  chainSummary: string[];
}) {
  return (
    <section className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Link2 size={16} className="text-indigo-600" />
        <h3 className="font-semibold text-indigo-700">
          Unified Recommendation Chain
        </h3>
      </div>

      <div className="mb-4 rounded-lg border border-dashed border-indigo-100 bg-indigo-50/40 p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-500">
          Agent chain
        </p>
        <ol className="space-y-1 text-xs text-slate-700">
          {chainSummary.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      {recommendations.length === 0 ? (
        <p className="text-sm text-slate-500">No coordinated actions proposed.</p>
      ) : (
        <ul className="space-y-3">
          {recommendations.map((rec) => (
            <li
              key={rec.id}
              className="rounded-lg border border-indigo-100 p-3 text-sm"
            >
              <p className="font-medium text-slate-800">{rec.action}</p>
              <p className="mt-1 text-xs text-slate-500">{rec.reasoning}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500">
                  Confidence {Math.round(rec.confidence * 100)}%
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-indigo-600">
                  {rec.agents.join(" + ")}
                </span>
                <span className="ml-auto rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-amber-800">
                  Human review required
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
