"use client";

import Link from "next/link";
import {
  GOVERNANCE_TABS,
  GOVERNANCE_TAB_LABELS,
  governanceTabHref,
  type GovernanceTabId,
} from "@/lib/governance-tabs";

export function GovernanceTabNav({
  activeTab,
  counts,
}: {
  activeTab: GovernanceTabId;
  counts?: Partial<Record<GovernanceTabId, number>>;
}) {
  return (
    <nav
      className="mb-6 flex flex-wrap gap-2 border-b border-[#E4E4DC] pb-3"
      aria-label="Governance sections"
    >
      {GOVERNANCE_TABS.map((tab) => {
        const count = counts?.[tab];
        const isActive = tab === activeTab;
        return (
          <Link
            key={tab}
            href={governanceTabHref(tab)}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.1em] transition-colors ${
              isActive
                ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
                : "border-[#E4E4DC] text-[#6B6B64] hover:border-[#1C4A2E] hover:text-[#1C4A2E]"
            }`}
          >
            {GOVERNANCE_TAB_LABELS[tab]}
            {typeof count === "number" && count > 0 ? (
              <span className="rounded-full bg-[#EDF7F7] px-1.5 py-0.5 text-[8px] tabular-nums text-[#1A5C5C]">
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
