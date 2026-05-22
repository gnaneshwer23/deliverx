import { AlertTriangle } from "lucide-react";
import type { DriftSignal } from "@/services/adaptiveEngine";

const SEVERITY_DOT: Record<DriftSignal["severity"], string> = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

const SEVERITY_BORDER: Record<DriftSignal["severity"], string> = {
  high: "border-l-rose-500",
  medium: "border-l-amber-500",
  low: "border-l-slate-300",
};

const TYPE_LABEL: Record<DriftSignal["type"], string> = {
  timeline_drift: "Timeline",
  engagement_drift: "Engagement",
  execution_drift: "Execution",
  dependency_drift: "Dependency",
};

export function DriftSignalsPanel({ drift }: { drift: DriftSignal[] }) {
  const topSeverity =
    drift.find((d) => d.severity === "high") ??
    drift.find((d) => d.severity === "medium") ??
    drift[0];

  return (
    <section
      className={`rounded-xl border border-l-4 bg-white p-6 shadow-sm ${
        topSeverity ? SEVERITY_BORDER[topSeverity.severity] : "border-l-slate-200"
      }`}
    >
      <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
        <AlertTriangle size={14} /> Drift Signals
        <span className="ml-auto text-xs text-slate-400">
          {drift.length} active
        </span>
      </div>
      {drift.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          No drift signals above threshold.
        </p>
      ) : (
        <ul className="space-y-2">
          {drift.map((d, i) => (
            <li key={i} className="flex gap-2">
              <span
                className={`mt-1.5 size-2 shrink-0 rounded-full ${SEVERITY_DOT[d.severity]}`}
                aria-hidden
              />
              <div className="flex-1">
                <p className="text-sm text-slate-800">{d.message}</p>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {TYPE_LABEL[d.type]} · {d.severity}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
