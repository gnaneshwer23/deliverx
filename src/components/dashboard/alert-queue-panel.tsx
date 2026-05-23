"use client";

import Link from "next/link";
import type { DeliveryAlert } from "@/services/alerts";
import { DxBadge } from "@/components/dx/dx-badge";
import { dxClass } from "@/lib/dx-theme";

const TONE: Record<DeliveryAlert["severity"], "red" | "amber" | "green" | "slate"> = {
  critical: "red",
  high: "amber",
  medium: "slate",
  low: "slate",
};

export function AlertQueuePanel({ alerts }: { alerts: DeliveryAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className={`${dxClass.cardPad} text-sm text-[#6B6B64]`}>
        No active alerts — delivery signals are within normal range.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {alerts.slice(0, 12).map((a) => (
        <li key={a.id} className={`${dxClass.card} px-4 py-3`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <DxBadge tone={TONE[a.severity]}>{a.severity}</DxBadge>
                <span className="font-[family-name:var(--font-dx-mono)] text-[7px] uppercase text-[#A8A89E]">
                  {a.category}
                </span>
              </div>
              {a.href ? (
                <Link href={a.href} className="font-medium text-[#0D0D0B] hover:text-[#1C4A2E] hover:underline">
                  {a.title}
                </Link>
              ) : (
                <p className="font-medium">{a.title}</p>
              )}
              <p className="mt-0.5 text-xs text-[#6B6B64]">{a.description}</p>
            </div>
            {a.projectName ? (
              <span className="font-[family-name:var(--font-dx-mono)] text-[7px] text-[#1C4A2E]">
                {a.projectName}
              </span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
