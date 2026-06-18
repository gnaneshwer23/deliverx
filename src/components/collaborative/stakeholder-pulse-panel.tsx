import Link from "next/link";
import { dxClass } from "@/lib/dx-theme";
import type { StakeholderPulseItem } from "@/services/collaborativeLoopEngine";

const TONE_COLOR: Record<StakeholderPulseItem["tone"], string> = {
  neutral: "text-slate-700",
  warning: "text-amber-600",
  critical: "text-rose-600",
  info: "text-indigo-600",
};

export function StakeholderPulsePanel({ items }: { items: StakeholderPulseItem[] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} text-lg`}>Stakeholder pulse</h3>
      <p className="mt-1 mb-4 text-xs text-[#6B6B64]">
        Governance and delivery signal mini-KPIs
      </p>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const inner = (
            <>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">{item.label}</p>
              <p className={`mt-1 text-xl font-bold ${TONE_COLOR[item.tone]}`}>{item.value}</p>
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 transition hover:border-[#0F766E]/20 hover:bg-white"
              >
                {inner}
              </Link>
            );
          }

          return (
            <div
              key={item.label}
              className="rounded-lg border border-slate-100 bg-slate-50/80 p-3"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
