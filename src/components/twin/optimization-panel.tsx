import { Lightbulb, Target } from "lucide-react";
import type { OptimizationAction } from "@/services/twinEngine";

const AREA_TONE: Record<OptimizationAction["area"], string> = {
  governance: "bg-violet-100 text-violet-700",
  dependency: "bg-amber-100 text-amber-700",
  scope: "bg-indigo-100 text-indigo-700",
  capacity: "bg-emerald-100 text-emerald-700",
};

export function OptimizationPanel({
  actions,
}: {
  actions: OptimizationAction[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
        <Lightbulb size={14} className="text-indigo-500" /> Strategic Optimisation
        <span className="ml-auto text-xs text-slate-400">
          {actions.length} {actions.length === 1 ? "action" : "actions"}
        </span>
      </div>

      <ul className="space-y-3">
        {actions.map((a) => (
          <li
            key={a.id}
            className="rounded-lg border border-slate-100 bg-slate-50/40 p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${AREA_TONE[a.area]}`}
              >
                {a.area}
              </span>
              <span className="text-[10px] text-slate-400">
                priority {Math.round(a.priority * 100)}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-900">
              {a.action}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              <span className="font-medium text-slate-600">Why:</span>{" "}
              {a.rationale}
            </p>
            <p className="mt-1 flex items-start gap-1 text-xs text-indigo-700">
              <Target size={11} className="mt-0.5 shrink-0" />
              <span>
                <span className="font-medium">Expected impact:</span>{" "}
                {a.expectedImpact}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
