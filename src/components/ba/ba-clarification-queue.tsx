"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";
import type { BaClarificationQueueItem } from "@/lib/ba-clarification-queue";

const STATUS_STYLE = {
  Urgent: "border-rose-200 bg-rose-50 text-rose-700",
  Waiting: "border-[#F0D4B0] bg-[#FEF6EC] text-[#8B4A08]",
  Review: "border-amber-200 bg-amber-50 text-amber-800",
} as const;

export function BaClarificationQueue({ items }: { items: BaClarificationQueueItem[] }) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`} data-panel="ba-clarification-queue">
      <div className={dxClass.panelHeader}>
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Clarification queue</h3>
          <p className="mt-0.5 text-xs text-[var(--dx-mut)]">What&apos;s blocking handoff to dev and QA</p>
        </div>
        <span className="rounded-full bg-[#FEF6EC] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[#8B4A08]">
          {items.length}
        </span>
      </div>
      <ul className="dx-divide-rows">
        {items.length ? (
          items.map((item) => (
            <li key={item.id} className="px-5 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-[#2C2C28]">{item.stakeholder}</span>
                    <span
                      className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${STATUS_STYLE[item.status]}`}
                    >
                      {item.status}
                    </span>
                    <span className="text-[10px] capitalize text-[#A8A89E]">{item.priority}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#2C2C28]">{item.question}</p>
                  <p className="mt-1 text-[10px] text-[#A8A89E]">
                    {item.waitLabel}
                    {item.blocks ? ` · Blocks ${item.blocks}` : ""}
                  </p>
                </div>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="inline-flex shrink-0 items-center gap-1 rounded border border-[#F0D4B0] bg-white px-2 py-1 text-[10px] font-medium text-[#8B4A08] hover:bg-[#FEF6EC]"
                  >
                    Resolve
                    <ExternalLink size={10} />
                  </Link>
                ) : null}
              </div>
            </li>
          ))
        ) : (
          <li className="px-6 py-8 text-center text-sm text-[#6B6B64]">
            No open clarifications — requirements are ready for handoff.
          </li>
        )}
      </ul>
    </div>
  );
}
