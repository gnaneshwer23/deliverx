"use client";

import { useState, useTransition } from "react";
import { Loader2, Network } from "lucide-react";
import type {
  GraphImpactResult,
  GraphTracePath,
  ProjectGraphNode,
  ProjectKnowledgeGraph,
} from "@/services/projectKnowledgeGraphEngine";
import { dxClass } from "@/lib/dx-theme";

const NODE_COLOR: Record<string, string> = {
  project: "bg-slate-100 text-slate-700",
  business_case: "bg-[#EEF5F1] text-[#1C4A2E]",
  objective: "bg-indigo-100 text-indigo-700",
  requirement: "bg-teal-100 text-teal-800",
  story: "bg-cyan-100 text-cyan-800",
  task: "bg-blue-100 text-blue-700",
  test: "bg-violet-100 text-violet-700",
  milestone: "bg-amber-100 text-amber-800",
  benefit: "bg-emerald-100 text-emerald-800",
  meeting: "bg-orange-100 text-orange-800",
  decision: "bg-rose-100 text-rose-700",
  raid: "bg-red-100 text-red-700",
};

function NodeChip({
  node,
  active,
  onSelect,
}: {
  node: ProjectGraphNode;
  active?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-full px-2 py-0.5 text-left text-xs font-medium capitalize transition ${
        NODE_COLOR[node.type] ?? "bg-slate-100 text-slate-600"
      } ${active ? "ring-2 ring-[#1C4A2E]" : ""} ${onSelect ? "hover:opacity-90" : ""}`}
      title={node.id}
    >
      {node.type}: {node.label.length > 48 ? `${node.label.slice(0, 48)}…` : node.label}
    </button>
  );
}

export function DeliveryKnowledgeGraphPanel({
  projectId,
  graph,
}: {
  projectId: string;
  graph: ProjectKnowledgeGraph;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [impact, setImpact] = useState<GraphImpactResult | null>(null);
  const [trace, setTrace] = useState<GraphTracePath | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const nodesByType = graph.nodes.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] ?? 0) + 1;
    return acc;
  }, {});

  function selectNode(nodeId: string) {
    setSelectedId(nodeId);
    setError(null);
    startTransition(async () => {
      try {
        const [impactRes, traceRes] = await Promise.all([
          fetch(`/api/project/${projectId}/graph/impact?nodeId=${encodeURIComponent(nodeId)}`),
          fetch(`/api/project/${projectId}/graph/trace?nodeId=${encodeURIComponent(nodeId)}`),
        ]);
        const impactData = await impactRes.json();
        const traceData = await traceRes.json();
        if (!impactRes.ok) throw new Error(impactData.error ?? "Impact lookup failed");
        if (!traceRes.ok) throw new Error(traceData.error ?? "Trace lookup failed");
        setImpact(impactData as GraphImpactResult);
        setTrace(traceData as GraphTracePath);
      } catch (err) {
        setImpact(null);
        setTrace(null);
        setError(err instanceof Error ? err.message : "Graph lookup failed");
      }
    });
  }

  const selected = graph.nodes.find((n) => n.id === selectedId) ?? null;

  return (
    <section className={`${dxClass.card} space-y-5 p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Network size={18} className="text-[#1C4A2E]" />
            <h2 className={`${dxClass.display} text-lg`}>Knowledge graph</h2>
          </div>
          <p className="mt-1 text-sm text-[#6B6B64]">
            Business case → objective → requirement → story → task → test → benefit, plus
            meeting governance links.
          </p>
        </div>
        <div className="text-right text-xs text-[#A8A89E]">
          {graph.stats.nodeCount} nodes · {graph.stats.edgeCount} edges ·{" "}
          {graph.stats.chainCompletenessPct}% end-to-end chains
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(nodesByType).map(([type, count]) => (
          <span
            key={type}
            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${NODE_COLOR[type] ?? "bg-slate-100"}`}
          >
            {type} ({count})
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-[#E4E4DC] bg-[#FAFAF5] p-3 font-[family-name:var(--font-dx-mono)] text-xs text-[#6B6B64]">
          {graph.edges.length === 0 ? (
            <p className="font-[family-name:var(--font-dx-sans)] text-sm text-[#6B6B64]">
              Sync delivery traceability to populate the graph.
            </p>
          ) : (
            graph.edges.slice(0, 40).map((e, i) => (
              <p key={i}>
                {e.from} → {e.to}{" "}
                <span className="text-[#A8A89E]">({e.type})</span>
              </p>
            ))
          )}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#A8A89E]">
            Explore nodes
          </p>
          <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
            {graph.nodes
              .filter((n) => n.type !== "project")
              .slice(0, 24)
              .map((n) => (
                <NodeChip
                  key={n.id}
                  node={n}
                  active={selectedId === n.id}
                  onSelect={() => selectNode(n.id)}
                />
              ))}
          </div>

          {isPending ? (
            <p className="flex items-center gap-2 text-sm text-[#6B6B64]">
              <Loader2 size={14} className="animate-spin" /> Analysing impact…
            </p>
          ) : null}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          {selected && impact ? (
            <div className="rounded-lg border border-[#C6DDD0] bg-[#EEF5F1]/50 p-4 text-sm">
              <p className="font-medium text-[#2C2C28]">{selected.label}</p>
              <p className="mt-2 text-[#6B6B64]">{impact.summary}</p>
              {trace && trace.pathToBusinessCase.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs font-medium text-[#1C4A2E]">Trace to business case</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {trace.pathToBusinessCase.map((n) => (
                      <NodeChip key={n.id} node={n} />
                    ))}
                  </div>
                </div>
              ) : null}
              {trace && trace.pathToBenefit.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs font-medium text-[#1C4A2E]">Trace to benefit</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {trace.pathToBenefit.map((n) => (
                      <NodeChip key={n.id} node={n} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
