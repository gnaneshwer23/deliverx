import { Network } from "lucide-react";
import { BENCHMARKS_RECOMMENDATIONS_NAV_LABEL } from "@/lib/intelligence-nav-labels";
import type { GlobalKnowledgeGraph } from "@/services/globalEngine";

export function GlobalGraphPanel({ graph }: { graph: GlobalKnowledgeGraph }) {
  const typeCounts = graph.nodes.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Network size={16} className="text-slate-500" />
        <h3 className="font-semibold">{BENCHMARKS_RECOMMENDATIONS_NAV_LABEL}</h3>
        <span className="text-xs text-slate-400">
          {graph.nodes.length} nodes · {graph.edges.length} edges
        </span>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {Object.entries(typeCounts).map(([type, count]) => (
          <span
            key={type}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium capitalize text-slate-600"
          >
            {type.replace("_", " ")} ({count})
          </span>
        ))}
      </div>
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/50 p-3 font-mono text-xs text-slate-600">
        {graph.edges.slice(0, 20).map((e, i) => (
          <p key={i}>
            {e.from} → {e.to}{" "}
            <span className="text-slate-400">({e.type})</span>
          </p>
        ))}
      </div>
    </section>
  );
}
