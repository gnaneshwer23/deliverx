"use client";

import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";
import type { PmTeamNeedFeedItem, PmTeamNeedStatus } from "@/lib/pm-team-needs-feed";

const STATUS_STYLE: Record<PmTeamNeedStatus, string> = {
  Urgent: "border-rose-200 bg-rose-50 text-rose-700",
  Waiting: "border-[#E4E4DC] bg-[#FAFAF7] text-[#6B6B64]",
  Review: "border-amber-200 bg-amber-50 text-amber-800",
  Clear: "border-[#C6DDD0] bg-[#EEF5F1] text-[#1C4A2E]",
};

function TeamNeedFeedRow({ item }: { item: PmTeamNeedFeedItem }) {
  return (
    <li className="px-5 py-3">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EDF7F7] text-[10px] font-semibold text-[#1A5C5C]">
          {item.avatarInitials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-[#2C2C28]">{item.name}</p>
            <span className="text-[10px] text-[#A8A89E]">{item.role}</span>
            <span
              className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${STATUS_STYLE[item.status]}`}
            >
              {item.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#2C2C28]">{item.need}</p>
          <p className="mt-1 text-[10px] text-[#A8A89E]">{item.waitLabel}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          {item.href ? (
            <Link
              href={item.href}
              className="inline-flex items-center gap-1 rounded border border-[#C6DDD0] bg-white px-2 py-1 text-[10px] font-medium text-[#1C4A2E] hover:bg-[#EEF5F1]"
            >
              Open
              <ExternalLink size={10} />
            </Link>
          ) : null}
          {item.escalateHref ? (
            <Link
              href={item.escalateHref}
              className="inline-flex items-center gap-1 rounded border border-[#E4E4DC] px-2 py-1 text-[10px] font-medium text-[#6B6B64] hover:bg-[#FAFAF7]"
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
      <div className="flex items-center justify-between border-b border-[#E4E4DC] px-6 py-3">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Team needs</h3>
          <p className="mt-0.5 text-xs text-[#6B6B64]">Who is waiting on what from you</p>
        </div>
        <span className="rounded-full bg-[#EDF7F7] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[#1A5C5C]">
          {items.length}
        </span>
      </div>
      <ul className="divide-y divide-[#F0F0E8]">
        {items.length ? (
          items.map((item) => <TeamNeedFeedRow key={item.id} item={item} />)
        ) : (
          <li className="px-6 py-8 text-center text-sm text-[#6B6B64]">
            No one is waiting on you — team signals are clear.
          </li>
        )}
      </ul>
    </div>
  );
}
