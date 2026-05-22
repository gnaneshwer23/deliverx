import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type KpiItem = {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  icon?: LucideIcon;
  accent?: "teal" | "amber" | "rose" | "slate";
};

const ACCENT: Record<NonNullable<KpiItem["accent"]>, string> = {
  teal: "border-l-[#6ee7c7] text-[#0a0e14]",
  amber: "border-l-amber-500 text-amber-700",
  rose: "border-l-rose-500 text-rose-700",
  slate: "border-l-[#1a1a1a]/20 text-[#4b5563]",
};

export function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const accent = ACCENT[item.accent ?? "slate"];
        const inner = (
          <div
            className={`rounded-xl border border-[#1a1a1a]/8 border-l-4 bg-white p-4 shadow-sm transition hover:shadow-md ${accent.split(" ")[0]}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#6b7280]">
                {item.label}
              </p>
              {Icon ? <Icon size={14} className={accent.split(" ").slice(1).join(" ")} /> : null}
            </div>
            <p className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[#1a1a1a]">
              {item.value}
            </p>
            {item.hint ? <p className="mt-0.5 text-xs text-[#9ca3af]">{item.hint}</p> : null}
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
