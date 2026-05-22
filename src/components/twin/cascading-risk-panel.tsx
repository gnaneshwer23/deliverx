import { ArrowRight, Zap } from "lucide-react";
import type { CascadingFailure } from "@/services/twinEngine";

const SEVERITY_STYLE: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-rose-100 text-rose-700",
};

export function CascadingRiskPanel({
  cascading,
}: {
  cascading: CascadingFailure[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
        <Zap size={14} className="text-rose-500" /> Cascading Risk
        <span className="ml-auto text-xs text-slate-400">
          {cascading.length} {cascading.length === 1 ? "path" : "paths"}
        </span>
      </div>

      {cascading.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          No cascading risk paths detected.
        </p>
      ) : (
        <ul className="space-y-2">
          {cascading.map((c, i) => (
            <li
              key={`${c.sourceProjectId}-${c.targetProjectId}-${i}`}
              className="rounded-lg border border-slate-100 bg-slate-50/40 p-3"
            >
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium text-slate-900">
                  {c.sourceName}
                </span>
                <ArrowRight size={12} className="text-slate-400" />
                <span className="font-medium text-slate-900">
                  {c.targetName}
                </span>
                <span
                  className={`ml-auto rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                    SEVERITY_STYLE[c.severity] ?? SEVERITY_STYLE.medium
                  }`}
                >
                  {c.severity}
                </span>
                <span className="text-[10px] text-slate-400">
                  hop {c.hops}
                </span>
              </div>
              {c.programmesAffected.length > 0 ? (
                <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                  Affects: {c.programmesAffected.join(" · ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
