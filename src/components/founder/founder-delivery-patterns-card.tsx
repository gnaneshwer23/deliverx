"use client";

import Link from "next/link";
import { ArrowUpRight, BrainCircuit } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";
import { DELIVERY_PATTERNS_NAV_LABEL } from "@/lib/intelligence-nav-labels";
import type { DeliveryPatternInsight } from "@/lib/delivery-patterns-insight";

const SEVERITY_ACCENT: Record<DeliveryPatternInsight["severity"], string> = {
  high: "border-l-rose-400",
  medium: "border-l-amber-400",
  low: "border-l-[#C6DDD0]",
  neutral: "border-l-[#C6DDD0]",
};

export function DeliveryPatternsInsightCard({
  insight,
}: {
  insight: DeliveryPatternInsight | null;
}) {
  if (!insight) return null;

  return (
    <div
      className={`${dxClass.card} border-l-4 p-6 ${SEVERITY_ACCENT[insight.severity]}`}
      data-panel="delivery-patterns-insight"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#1C4A2E]">
            <BrainCircuit size={14} aria-hidden />
            {DELIVERY_PATTERNS_NAV_LABEL}
          </div>
          <p className="mt-2 text-base font-medium text-[#2C2C28]">{insight.headline}</p>
          <p className="mt-1 text-sm text-[#6B6B64]">
            <span className="font-medium text-[#1C4A2E]">{insight.badge}</span>
            {" · "}
            {insight.detail}
          </p>
        </div>
        <Link
          href={insight.href}
          className="inline-flex shrink-0 items-center gap-1 rounded border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-1.5 text-xs font-medium text-[#1C4A2E] hover:bg-[#E4EDE8]"
        >
          View {DELIVERY_PATTERNS_NAV_LABEL.toLowerCase()}
          <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  );
}

/** @deprecated Use DeliveryPatternsInsightCard */
export const FounderDeliveryPatternsCard = DeliveryPatternsInsightCard;
