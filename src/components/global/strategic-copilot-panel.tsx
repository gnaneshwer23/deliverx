"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { COPILOT_SCENARIOS, type CopilotResult } from "@/services/globalEngine";

export function StrategicCopilotPanel() {
  const [scenario, setScenario] = useState(COPILOT_SCENARIOS[0].id);
  const [result, setResult] = useState<CopilotResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/copilot/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario }),
        });
        const data = (await res.json()) as CopilotResult & { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Simulation failed");
          return;
        }
        setResult(data);
      } catch {
        setError("Simulation failed");
      }
    });
  }

  return (
    <section className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={16} className="text-indigo-600" />
        <h3 className="font-semibold text-indigo-700">Strategic Copilot</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value as typeof scenario)}
          className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          {COPILOT_SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={isPending}
          onClick={run}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : null}
          Simulate
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

      {result ? (
        <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/40 p-4 text-sm">
          <p className="font-medium text-slate-800">{result.recommendation}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-slate-500">Stability</span>
              <p className="font-semibold">
                {result.impact.stability > 0 ? "+" : ""}
                {result.impact.stability}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Risk</span>
              <p className="font-semibold">
                {result.impact.risk > 0 ? "+" : ""}
                {result.impact.risk}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Gov. friction</span>
              <p className="font-semibold">
                {result.impact.governanceFriction > 0 ? "+" : ""}
                {result.impact.governanceFriction}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">{result.reasoning}</p>
          <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase text-amber-800">
            Human review required
          </span>
        </div>
      ) : null}
    </section>
  );
}
