"use client";

import Link from "next/link";
import type { StakeholderActionRow } from "@/services/deliveryPmEngine";
import { dxClass } from "@/lib/dx-theme";

const toneDot: Record<string, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-rose-500",
};

export function DeliveryStakeholderActionQueue({
  actions,
}: {
  actions: StakeholderActionRow[];
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Stakeholder action queue</h3>
      </div>
      <ul className="divide-y divide-[#F0F0E8]">
        {actions.length ? (
          actions.map((a) => (
            <li key={a.id} className="px-6 py-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 font-medium">
                    <span className={`size-2 rounded-full ${toneDot[a.tone]}`} />
                    {a.stakeholder}
                  </p>
                  <p className="mt-1 text-[#6B6B64]">{a.action}</p>
                  <p className="mt-1 text-xs text-[#A8A89E]">
                    Priority: {a.priority} · Due: {a.dueLabel}
                  </p>
                </div>
                {a.href ? (
                  <Link href={a.href} className={`${dxClass.btnGhost} shrink-0 text-[10px]`}>
                    Open
                  </Link>
                ) : null}
              </div>
            </li>
          ))
        ) : (
          <li className="px-6 py-4 text-[#6B6B64]">
            No pending stakeholder actions from live governance signals.
          </li>
        )}
      </ul>
    </div>
  );
}
