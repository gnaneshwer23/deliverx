"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { ProgrammeOrchestrationSnapshot } from "@/services/programmeOrchestrationEngine";
import { dxClass } from "@/lib/dx-theme";

type Response = { ok: true; snapshot: ProgrammeOrchestrationSnapshot };

export function ProgrammeOrchestrationPanel({
  programmeId,
}: {
  programmeId: string;
}) {
  const [snapshot, setSnapshot] = useState<ProgrammeOrchestrationSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run() {
    setError(null);
    start(async () => {
      try {
        const res = await fetch(`/api/programme/${programmeId}/orchestrate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = (await res.json()) as Response & { error?: string };
        if (!res.ok || !data.ok) {
          setError(data.error ?? "Orchestration failed");
          return;
        }
        setSnapshot(data.snapshot);
      } catch {
        setError("Could not reach orchestration endpoint");
      }
    });
  }

  return (
    <section className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-indigo-900">Portfolio orchestration</h2>
          <p className="mt-1 text-sm text-slate-600">
            Chief of Staff routes specialist agents across all programme projects — human approval
            required.
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={run}
          className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-100 disabled:opacity-60"
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {pending ? "Orchestrating…" : "Run programme sweep"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {snapshot ? (
        <div className="space-y-4 text-sm">
          <p className="rounded-lg bg-indigo-50/80 p-3 text-indigo-950">{snapshot.portfolioBrief}</p>
          <ul className="space-y-2">
            {snapshot.projectResults.map((row) => (
              <li key={row.projectId} className="rounded-md border border-slate-200 px-3 py-2">
                <p className="font-medium">{row.projectName}</p>
                <p className="mt-1 text-xs text-slate-600">{row.synthesis}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
