"use client";

import type { ProductMissionControl } from "@/services/pmDashboard";
import { DxWidgetHeader } from "@/components/dx/dx-widget-header";
import { dxClass } from "@/lib/dx-theme";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";

const productAccent = getMissionPersonaAccent("product");

const COLUMN_STYLE = {
  now: {
    header: "Now",
    headerBg: productAccent.primary,
    headerText: "#FFFFFF",
    bg: productAccent.bg,
    border: productAccent.border,
    countBg: "rgba(255,255,255,0.22)",
  },
  next: {
    header: "Next",
    headerBg: "#B7620A",
    headerText: "#FFFFFF",
    bg: "#FEF6EC",
    border: "#F0D4B0",
    countBg: "rgba(255,255,255,0.22)",
  },
  later: {
    header: "Later",
    headerBg: "#6B6B64",
    headerText: "#FFFFFF",
    bg: "#FAFAF7",
    border: "#E4E4DC",
    countBg: "rgba(255,255,255,0.22)",
  },
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
    <div
      className={`${dxClass.card} overflow-hidden border-t-[3px] p-0`}
      style={{ borderTopColor: productAccent.primary }}
      data-panel="product-roadmap-kanban"
    >
      <DxWidgetHeader
        title="Now / Next / Later"
        subtitle="What should we build next?"
        count={totalItems}
        countTone="neutral"
        href={projectId ? `/project/${projectId}/product` : undefined}
        actionLabel="Edit roadmap"
      />
      {usesFallback ? (
        <p className="border-b border-[#E4E4DC] px-6 py-2 text-xs text-[#6B6B64]">
          Connect product context to replace placeholder horizons with live roadmap items.
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-0 md:grid-cols-3 md:divide-x md:divide-[#E4E4DC]">
        {columns.map((col) => {
          const style = COLUMN_STYLE[col.key];
          return (
            <div key={col.key} className="flex flex-col">
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ backgroundColor: style.headerBg, color: style.headerText }}
              >
                <span className="text-xs font-bold uppercase tracking-wider">{style.header}</span>
                <span
                  className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums"
                  style={{ backgroundColor: style.countBg }}
                >
                  {col.items.length}
                </span>
              </div>
              <div className="flex-1 p-4" style={{ backgroundColor: style.bg }}>
                <ul className="min-h-[80px] space-y-2">
                  {col.items.length ? (
                    col.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-lg border bg-white px-3 py-2.5 text-sm text-[#2C2C28] shadow-[0_1px_4px_rgba(13,13,11,0.04)]"
                        style={{ borderColor: style.border }}
                      >
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-[#A8A89E]" style={{ borderColor: style.border }}>
                      Drop items here
                    </li>
                  )}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
