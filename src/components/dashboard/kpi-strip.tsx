import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";

export type KpiItem = {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  icon?: LucideIcon;
  accent?: "teal" | "amber" | "rose" | "slate";
};

const ACCENT: Record<NonNullable<KpiItem["accent"]>, string> = {
  teal: "text-[#1A6B3A]",
  amber: "text-[#B7620A]",
  rose: "text-[#C0392B]",
  slate: "text-[#0D0D0B]",
};

const BAR: Record<NonNullable<KpiItem["accent"]>, string> = {
  teal: "bg-[#1A6B3A]",
  amber: "bg-[#B7620A]",
  rose: "bg-[#C0392B]",
  slate: "bg-[#1C4A2E]",
};

export function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 xl:grid-cols-4">
      {items.map((item) => {
        const accent = ACCENT[item.accent ?? "slate"];
        const bar = BAR[item.accent ?? "slate"];
        const inner = (
          <div className={`${dxClass.card} p-4 transition hover:shadow-[0_4px_20px_rgba(13,13,11,0.09)]`}>
            <p className="mb-1.5 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.14em] text-[#A8A89E]">
              {item.label}
            </p>
            <p className={`${dxClass.display} text-[2rem] leading-none ${accent}`}>{item.value}</p>
            {item.hint ? (
              <p className="mt-1 font-[family-name:var(--font-dx-mono)] text-[8px] text-[#6B6B64]">
                {item.hint}
              </p>
            ) : null}
            <div className="mt-2 h-[3px] overflow-hidden bg-[#F0F0E8]">
              <div className={`h-full w-3/4 ${bar}`} />
            </div>
          </div>
        );

        return item.href ? (
          <Link key={item.label} href={item.href} className="block">
            {inner}
          </Link>
        ) : (
          <div key={item.label}>{inner}</div>
        );
      })}
    </div>
  );
}
