"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  PROPOSALS_PERSONA_LABELS,
  PROPOSALS_PERSONA_TABS,
  type ProposalsPersonaTab,
} from "@/lib/approval/persona-reviews";

export function ProposalsPersonaFilter({
  counts,
  currentPersona = "all",
}: {
  counts: Partial<Record<ProposalsPersonaTab, number>>;
  currentPersona?: ProposalsPersonaTab;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(persona: ProposalsPersonaTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (persona === "all") {
      params.delete("persona");
    } else {
      params.set("persona", persona);
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {PROPOSALS_PERSONA_TABS.map((persona) => {
        const count = counts[persona] ?? 0;
        const active = currentPersona === persona;
        return (
          <Link
            key={persona}
            href={hrefFor(persona)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
              active
                ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
                : "border-[#E4E4DC] text-[#6B6B64] hover:border-[#A8A89E]"
            }`}
          >
            {PROPOSALS_PERSONA_LABELS[persona]}
            {persona !== "all" && count > 0 ? (
              <span className="min-w-[16px] rounded-full bg-[#B7620A] px-1.5 text-center text-[10px] text-white">
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
