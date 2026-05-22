import { Flame } from "lucide-react";
import type { PressureIndicator } from "@/services/adaptiveEngine";

const INTENSITY_BG: Record<PressureIndicator["intensity"], string> = {
  high: "bg-rose-50",
  medium: "bg-amber-50",
  low: "bg-slate-50",
};

const AREA_LABEL: Record<PressureIndicator["area"], string> = {
  workload: "Workload",
  blockers: "Blockers",
  dependency: "Dependency",
  velocity: "Velocity",
};

export function PressurePanel({
  pressures,
}: {
  pressures: PressureIndicator[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
        <Flame size={14} /> Execution Pressure
        <span className="ml-auto text-xs text-slate-400">
          {pressures.length} signal{pressures.length === 1 ? "" : "s"}
        </span>
      </div>
      {pressures.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          No pressure indicators above threshold.
        </p>
      ) : (
        <ul className="space-y-2">
          {pressures.map((p, i) => (
            <li
              key={i}
              className={`rounded-lg px-3 py-2 text-sm ${INTENSITY_BG[p.intensity]}`}
            >
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                {AREA_LABEL[p.area]} · {p.intensity}
              </p>
              <p className="mt-0.5 text-slate-800">{p.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
