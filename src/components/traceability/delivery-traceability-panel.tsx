"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { DeliveryTraceGraph } from "@/services/deliveryTraceabilityEngine";
import { dxClass } from "@/lib/dx-theme";

const toneDot: Record<string, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-rose-500",
};

function coverageTone(pct: number): string {
  if (pct >= 75) return toneDot.green;
  if (pct >= 50) return toneDot.amber;
  return toneDot.red;
}

export function DeliveryTraceabilityPanel({
  projectId,
  graph,
}: {
  projectId: string;
  graph: DeliveryTraceGraph;
}) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const { rows, coverage, gaps } = graph;

  async function syncLinks() {
    setSyncing(true);
    try {
      const res = await fetch(`/api/project/${projectId}/traceability/delivery`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      toast.success(`Traceability synced — ${data.created} new link${data.created === 1 ? "" : "s"}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Delivery traceability</h2>
          <p className="text-sm text-slate-500">
            Requirement → user story → task → test case chain from live Postgres data.
          </p>
        </div>
        <button
          type="button"
          onClick={syncLinks}
          disabled={syncing}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {syncing ? "Syncing…" : "Sync links"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Overall coverage", value: `${coverage.overallPct}%` },
          { label: "Story linked", value: `${coverage.storyCoveragePct}%` },
          { label: "Task linked", value: `${coverage.taskCoveragePct}%` },
          { label: "Test linked", value: `${coverage.testCoveragePct}%` },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-slate-500">{k.label}</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-bold">
              <span
                className={`size-2 rounded-full ${coverageTone(parseInt(k.value, 10))}`}
              />
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {gaps.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <p className="text-sm font-semibold text-amber-900">
            {gaps.length} traceability gap{gaps.length === 1 ? "" : "s"}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            {gaps.slice(0, 6).map((g) => (
              <li key={g.reqCode}>
                <span className="font-mono text-xs">{g.reqCode}</span> — missing{" "}
                {g.missing.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      ) : rows.length > 0 ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-800">
          Full chain coverage — all requirements trace to story, task, and test.
        </p>
      ) : null}

      <div className={`${dxClass.card} overflow-hidden p-0`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-[#E4E4DC] bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
                <th className="px-4 py-2">Objective</th>
                <th className="px-4 py-2">Requirement</th>
                <th className="px-4 py-2">Story</th>
                <th className="px-4 py-2">Task</th>
                <th className="px-4 py-2">Test</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.requirementId} className="border-b border-[#F0F0E8] last:border-0">
                    <td className="px-4 py-2 text-[#6B6B64]">{row.objective}</td>
                    <td className="px-4 py-2">
                      <span className="font-mono text-[10px] text-[#A8A89E]">{row.reqCode}</span>
                      <div className="font-medium">{row.requirement}</div>
                    </td>
                    <td className="px-4 py-2">
                      {row.storyCode ? (
                        <>
                          <span className="font-mono text-[10px] text-[#A8A89E]">
                            {row.storyCode}
                          </span>
                          <div>{row.story}</div>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2">{row.task ?? "—"}</td>
                    <td className="px-4 py-2">{row.testCode ?? row.test ?? "—"}</td>
                    <td className="px-4 py-2">{row.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-[#6B6B64]">
                    Approve requirements and generate stories to build the traceability matrix.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
