"use client";

import type { QaDefect } from "@/services/qaEngine";
import { dxClass } from "@/lib/dx-theme";

const SEVERITY_ORDER = ["critical", "high", "medium", "low"] as const;

const SEVERITY_STYLE: Record<string, string> = {
  critical: "border-rose-300 bg-rose-50 text-rose-800",
  high: "border-orange-200 bg-orange-50 text-orange-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-slate-200 bg-slate-50 text-slate-700",
};

function groupDefectsBySeverity(defects: QaDefect[]): Record<string, QaDefect[]> {
  const groups: Record<string, QaDefect[]> = {};
  for (const d of defects) {
    const key = d.severity.toLowerCase();
    if (!groups[key]) groups[key] = [];
    groups[key].push(d);
  }
  return groups;
}

export function QaDefectBoard({ defects }: { defects: QaDefect[] }) {
  const groups = groupDefectsBySeverity(defects);
  const columns = SEVERITY_ORDER.filter((s) => (groups[s]?.length ?? 0) > 0);

  return (
    <div className={`${dxClass.card} overflow-hidden p-0`} data-panel="qa-defect-board">
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Defect board</h3>
        <p className="text-xs text-[#6B6B64]">Grouped by severity — fix critical first</p>
      </div>
      {columns.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-[#6B6B64]">—</p>
      ) : (
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 lg:grid-cols-4 md:divide-x md:divide-[#E4E4DC]">
          {columns.map((severity) => (
            <div key={severity} className="p-4">
              <p
                className={`mb-3 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${SEVERITY_STYLE[severity] ?? SEVERITY_STYLE.low}`}
              >
                {severity}
                <span className="ml-1 tabular-nums">{(groups[severity] ?? []).length}</span>
              </p>
              <ul className="space-y-2">
                {(groups[severity] ?? []).map((d) => (
                  <li
                    key={d.code}
                    className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-[#0D0D0B]">
                      <span className="font-mono text-[10px] text-[#A8A89E]">{d.code}</span>{" "}
                      {d.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#A8A89E]">
                      {d.owner} · {d.status}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
