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
  teal: "border-l-[#0F766E] text-[#0F766E]",
  amber: "border-l-amber-500 text-amber-600",
  rose: "border-l-rose-500 text-rose-600",
  slate: "border-l-slate-300 text-slate-600",
};

export function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const accent = ACCENT[item.accent ?? "slate"];
        const inner = (
          <div
            className={`rounded-xl border border-l-4 border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md ${accent.split(" ")[0]}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              {Icon ? <Icon size={14} className={accent.split(" ").slice(1).join(" ")} /> : null}
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">{item.value}</p>
            {item.hint ? <p className="mt-0.5 text-xs text-slate-400">{item.hint}</p> : null}
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
