import { GitBranch } from "lucide-react";
import type { Scenario } from "@/services/adaptiveEngine";

export function ScenarioPanel({ scenarios }: { scenarios: Scenario[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
        <GitBranch size={14} /> Forecast Scenarios
      </div>
      {scenarios.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          No scenarios generated.
        </p>
      ) : (
        <ul className="space-y-3">
          {scenarios.map((s, i) => (
            <li
              key={i}
              className="rounded-lg border border-slate-100 bg-slate-50/40 p-3"
            >
              <p className="text-sm font-medium text-slate-900">{s.scenario}</p>
              <p className="mt-0.5 text-xs text-slate-600">{s.outcome}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 rounded bg-slate-200">
                  <div
                    className="h-1 rounded bg-indigo-500"
                    style={{ width: `${s.probability * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">
                  {Math.round(s.probability * 100)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
