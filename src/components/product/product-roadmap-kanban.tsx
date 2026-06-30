"use client";

import type { ProductMissionControl } from "@/services/pmDashboard";
import { DashboardPanelShell } from "@/components/dx/dashboard-panel-shell";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";

const productAccent = getMissionPersonaAccent("product");

const COLUMN_LABELS = {
  now: "Now",
  next: "Next",
  later: "Later",
} as const;

export function ProductRoadmapKanban({
  roadmap,
  usesFallback = false,
  projectId,
}: {
  roadmap: ProductMissionControl["roadmap"];
  usesFallback?: boolean;
  projectId?: string;
}) {
  const columns = [
    { key: "now" as const, items: roadmap.now },
    { key: "next" as const, items: roadmap.next },
    { key: "later" as const, items: roadmap.later },
  ];
  const totalItems = columns.reduce((sum, col) => sum + col.items.length, 0);

  return (
    <DashboardPanelShell
      panelId="product-roadmap-kanban"
      title="Now / Next / Later"
      subtitle={
        usesFallback
          ? "— · Connect product context to populate live roadmap horizons"
          : "What should we build next?"
      }
      count={totalItems}
      countTone="neutral"
      href={projectId ? `/project/${projectId}/product` : undefined}
      actionLabel="Edit roadmap"
      card
    >
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto md:grid md:grid-cols-3 md:overflow-visible md:snap-none">
        {columns.map((col) => (
          <div
            key={col.key}
            className="flex min-w-[85%] shrink-0 snap-start flex-col rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] md:min-w-0"
          >
            <div className="flex items-center justify-between border-b border-[#E4E4DC] px-3 py-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: col.key === "now" ? productAccent.text : "#6B6B64" }}
              >
                {COLUMN_LABELS[col.key]}
              </span>
              <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-[#F0F0E8] px-1.5 py-0.5 font-[family-name:var(--font-dx-mono)] text-[9px] font-bold tabular-nums text-[#6B6B64]">
                {col.items.length}
              </span>
            </div>
            <ul className="min-h-[72px] space-y-2 p-3">
              {col.items.length ? (
                col.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-[#E4E4DC] bg-white px-3 py-2 text-sm text-[#2C2C28]"
                  >
                    {item}
                  </li>
                ))
              ) : (
                <li className="rounded-md border border-dashed border-[#E4E4DC] px-3 py-3 text-center text-sm text-[#A8A89E]">
                  —
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </DashboardPanelShell>
  );
}
