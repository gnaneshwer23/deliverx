"use client";

import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { DxStatusPill, teamNeedStatusToPillTone } from "@/components/dx/dx-status-pill";
import { DxWidgetHeader } from "@/components/dx/dx-widget-header";
import { dxClass } from "@/lib/dx-theme";
import type { PmTeamNeedFeedItem } from "@/lib/pm-team-needs-feed";

function TeamNeedFeedRow({ item }: { item: PmTeamNeedFeedItem }) {
  return (
    <li className="px-5 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EDF7F7] text-[10px] font-semibold text-[#1A5C5C]">
          {item.avatarInitials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-[#2C2C28]">{item.name}</p>
            <span className="text-[10px] text-[#A8A89E]">{item.role}</span>
            <DxStatusPill tone={teamNeedStatusToPillTone(item.status)} size="xs">
              {item.status}
            </DxStatusPill>
          </div>
          <p className="mt-1 text-sm text-[#2C2C28]">{item.need}</p>
          <p className="mt-1 text-[10px] text-[#A8A89E]">{item.waitLabel}</p>
        </div>
        <div className="flex shrink-0 flex-row gap-1.5 sm:flex-col">
          {item.href ? (
            <Link
              href={item.href}
              className="inline-flex min-h-9 touch-manipulation items-center gap-1 rounded border border-[#C6DDD0] bg-white px-2 py-1 text-[10px] font-medium text-[#1C4A2E] hover:bg-[#EEF5F1]"
            >
              Open
              <ExternalLink size={10} />
            </Link>
          ) : null}
          {item.escalateHref ? (
            <Link
              href={item.escalateHref}
              className="inline-flex min-h-9 touch-manipulation items-center gap-1 rounded border border-[#E4E4DC] px-2 py-1 text-[10px] font-medium text-[#6B6B64] hover:bg-[#FAFAF7]"
            >
              <ArrowUpRight size={10} />
              Escalate
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function PmTeamNeedsFeed({ items }: { items: PmTeamNeedFeedItem[] }) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`} data-panel="pm-team-needs-feed">
      <DxWidgetHeader
        title="AI Review Queue"
        subtitle="Items waiting for your review before anything is applied"
        count={items.length}
        countTone={items.some((i) => i.status === "Urgent") ? "urgent" : "accent"}
      />
      <ul className="divide-y divide-[#F0F0E8]">
        {items.length ? (
          items.map((item) => <TeamNeedFeedRow key={item.id} item={item} />)
        ) : (
          <li className="px-6 py-8 text-center text-sm text-[#6B6B64]">
            No items in your AI Review Queue — team signals are clear.
          </li>
        )}
      </ul>
    </div>
  );
}
