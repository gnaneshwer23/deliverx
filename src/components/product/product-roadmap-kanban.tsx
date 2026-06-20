"use client";

import Link from "next/link";
import type { ProductMissionControl } from "@/services/pmDashboard";
import { dxClass } from "@/lib/dx-theme";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";

const productAccent = getMissionPersonaAccent("product");

const COLUMN_STYLE = {
  now: { header: "Now", bg: productAccent.bg, border: productAccent.border },
  next: { header: "Next", bg: "#FAFAF7", border: "#E4E4DC" },
  later: { header: "Later", bg: "#FAFAF7", border: "#E4E4DC" },
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

  return (
    <div
      className={`${dxClass.card} overflow-hidden border-t-2 p-0`}
      style={{ borderTopColor: productAccent.primary }}
      data-panel="product-roadmap-kanban"
    >
      <div className="flex items-center justify-between border-b border-[#E4E4DC] px-6 py-4">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Now / Next / Later</h3>
          <p className="text-xs text-[#6B6B64]">What should we build next?</p>
        </div>
        {projectId ? (
          <Link
            href={`/project/${projectId}/product`}
            className="text-xs font-medium hover:underline"
            style={{ color: productAccent.text }}
          >
            Edit roadmap →
          </Link>
        ) : null}
      </div>
      {usesFallback ? (
        <p className="border-b border-[#E4E4DC] px-6 py-2 text-xs text-[#6B6B64]">
          Connect product context to replace placeholder horizons with live roadmap items.
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-0 md:grid-cols-3 md:divide-x md:divide-[#E4E4DC]">
        {columns.map((col) => {
          const style = COLUMN_STYLE[col.key];
          return (
            <div
              key={col.key}
              className="p-4"
              style={{ backgroundColor: style.bg }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: col.key === "now" ? productAccent.text : "#6B6B64" }}
              >
                {style.header}
                <span className="ml-2 tabular-nums text-[#A8A89E]">{col.items.length}</span>
              </p>
              <ul className="mt-3 min-h-[80px] space-y-2">
                {col.items.length ? (
                  col.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border px-3 py-2 text-sm text-[#2C2C28]"
                      style={{ borderColor: style.border }}
                    >
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[#A8A89E]">—</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
