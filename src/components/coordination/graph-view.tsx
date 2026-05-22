import { Network } from "lucide-react";
import type { KnowledgeGraph } from "@/services/coordinationEngine";

const NODE_COLOR: Record<string, string> = {
  project: "bg-blue-100 text-blue-700",
  programme: "bg-indigo-100 text-indigo-700",
  risk: "bg-rose-100 text-rose-700",
  blocker: "bg-orange-100 text-orange-700",
  partner: "bg-violet-100 text-violet-700",
  governance: "bg-amber-100 text-amber-700",
};

export function GraphView({ graph }: { graph: KnowledgeGraph }) {
  const nodesByType = graph.nodes.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Network size={16} className="text-slate-500" />
        <h3 className="font-semibold">Enterprise Knowledge Graph</h3>
        <span className="text-xs text-slate-400">
          {graph.nodes.length} nodes · {graph.edges.length} edges
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(nodesByType).map(([type, count]) => (
          <span
            key={type}
            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${NODE_COLOR[type] ?? "bg-slate-100 text-slate-600"}`}
          >
            {type} ({count})
          </span>
        ))}
      </div>

      <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs font-mono text-slate-600">
        {graph.edges.length === 0 ? (
          <p className="font-sans text-sm text-slate-500">
            Graph will populate once projects, dependencies, and partners exist.
          </p>
        ) : (
          graph.edges.slice(0, 24).map((e, i) => (
            <p key={i}>
              {e.from} → {e.to}{" "}
              <span className="text-slate-400">({e.type})</span>
            </p>
          ))
        )}
      </div>
    </section>
  );
}
