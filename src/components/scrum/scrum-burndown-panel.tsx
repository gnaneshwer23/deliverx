"use client";

import type { ScrumBurndownPoint } from "@/lib/scrum-health-kpis";
import { dxClass } from "@/lib/dx-theme";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";

const scrumAccent = getMissionPersonaAccent("scrum");

export function ScrumBurndownPanel({
  points,
  sprintLabel,
  plannedPoints,
  completedPoints,
  usesFallback = false,
}: {
  points: ScrumBurndownPoint[];
  sprintLabel: string;
  plannedPoints: number;
  completedPoints: number;
  usesFallback?: boolean;
}) {
  const maxY = Math.max(plannedPoints, ...points.map((p) => Math.max(p.remaining, p.ideal)), 1);

  return (
    <div
      className={`${dxClass.card} border-t-2 p-6`}
      style={{ borderTopColor: scrumAccent.primary }}
      data-panel="scrum-burndown"
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Sprint burndown</h3>
          <p className="text-xs text-[#6B6B64]">{sprintLabel}</p>
        </div>
        <div className="text-right text-xs tabular-nums text-[#6B6B64]">
          <p>
            <span className="font-semibold text-[#0D0D0B]">{completedPoints}</span> / {plannedPoints} pts
          </p>
        </div>
      </div>
      {usesFallback ? (
        <p className="mb-3 text-xs text-[#6B6B64]">
          Velocity uses fallback until delivery context is connected.
        </p>
      ) : null}
      {points.length === 0 || plannedPoints <= 0 ? (
        <p className="text-sm text-[#6B6B64]">—</p>
      ) : (
        <div className="flex items-end gap-1" style={{ height: 120 }}>
          {points.map((point) => {
            const actualH = Math.round((point.remaining / maxY) * 100);
            const idealH = Math.round((point.ideal / maxY) * 100);
            return (
              <div key={point.label} className="flex flex-1 flex-col items-center gap-1">
                <div className="relative flex w-full items-end justify-center gap-0.5" style={{ height: 100 }}>
                  <div
                    className="w-2 rounded-t bg-[#E4E4DC]"
                    style={{ height: `${idealH}%` }}
                    title={`Ideal: ${point.ideal}`}
                  />
                  <div
                    className="w-3 rounded-t"
                    style={{ height: `${actualH}%`, backgroundColor: scrumAccent.mid }}
                    title={`Remaining: ${point.remaining}`}
                  />
                </div>
                <span className="text-[9px] text-[#A8A89E]">{point.label}</span>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-3 flex gap-4 text-[10px] text-[#6B6B64]">
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-sm bg-[#E4E4DC]" /> Ideal
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-sm" style={{ backgroundColor: scrumAccent.mid }} /> Actual
        </span>
      </div>
    </div>
  );
}
