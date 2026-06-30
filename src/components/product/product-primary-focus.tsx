"use client";

import { useState, type ReactNode } from "react";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";

type ProductFocusTab = "roadmap" | "rice";

const productAccent = getMissionPersonaAccent("product");

export function ProductPrimaryFocus({
  roadmapKanban,
  riceBacklog,
  showRiceTab,
}: {
  roadmapKanban: ReactNode;
  riceBacklog: ReactNode;
  showRiceTab: boolean;
}) {
  const [tab, setTab] = useState<ProductFocusTab>("roadmap");

  if (!showRiceTab) {
    return <div data-product-focus="roadmap">{roadmapKanban}</div>;
  }

  return (
    <div data-product-focus={tab}>
      <div
        className="mb-4 flex flex-wrap gap-2 border-b border-[#E4E4DC] pb-3"
        role="tablist"
        aria-label="Product prioritization views"
      >
        {(
          [
            { id: "roadmap" as const, label: "Now / Next / Later" },
            { id: "rice" as const, label: "RICE backlog" },
          ] as const
        ).map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`product-focus-panel-${item.id}`}
              id={`product-focus-tab-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`inline-flex min-h-9 touch-manipulation items-center rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                selected ? "text-white" : "bg-[#F0F0E8] text-[#6B6B64] hover:bg-[#E8E8E0]"
              }`}
              style={
                selected
                  ? { backgroundColor: productAccent.primary, color: "#FFFFFF" }
                  : undefined
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        id="product-focus-panel-roadmap"
        role="tabpanel"
        aria-labelledby="product-focus-tab-roadmap"
        hidden={tab !== "roadmap"}
      >
        {roadmapKanban}
      </div>
      <div
        id="product-focus-panel-rice"
        role="tabpanel"
        aria-labelledby="product-focus-tab-rice"
        hidden={tab !== "rice"}
      >
        {riceBacklog}
      </div>
    </div>
  );
}
