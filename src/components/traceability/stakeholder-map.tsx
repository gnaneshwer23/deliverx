"use client";

import type { StakeholderRow } from "@/services/traceability";

const LEVEL_OFFSET: Record<string, number> = { low: 18, medium: 50, high: 82 };

const SENTIMENT_COLOR: Record<string, string> = {
  champion: "bg-emerald-500",
  neutral: "bg-slate-400",
  skeptic: "bg-amber-500",
  blocker: "bg-rose-500",
};

export function StakeholderMap({ stakeholders }: { stakeholders: StakeholderRow[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Influence × interest map
      </p>
      <div className="relative aspect-square max-h-72 w-full rounded-lg border border-dashed border-slate-200 bg-slate-50/80">
        <div className="absolute inset-x-0 top-1/2 border-t border-slate-200" />
        <div className="absolute inset-y-0 left-1/2 border-l border-slate-200" />
        <span className="absolute left-2 top-2 text-[10px] text-slate-400">High influence</span>
        <span className="absolute bottom-2 left-2 text-[10px] text-slate-400">Low influence</span>
        <span className="absolute bottom-2 right-2 text-[10px] text-slate-400">High interest</span>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400">
          Low interest
        </span>

        {stakeholders.map((s) => (
          <div
            key={s.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${LEVEL_OFFSET[s.interest] ?? 50}%`,
              top: `${100 - (LEVEL_OFFSET[s.influence] ?? 50)}%`,
            }}
            title={`${s.name} — ${s.sentiment}`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white shadow ${SENTIMENT_COLOR[s.sentiment] ?? "bg-slate-400"}`}
            >
              {s.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        ))}

        {stakeholders.length === 0 ? (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
            Add stakeholders to plot the map
          </p>
        ) : null}
      </div>
    </div>
  );
}
