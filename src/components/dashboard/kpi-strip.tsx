import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  MissionKpiCard,
  accentToTone,
  type MissionKpiDelta,
  type MissionKpiTone,
} from "@/components/dx/mission-kpi-card";

export type KpiItem = {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  icon?: LucideIcon;
  /** @deprecated Prefer `tone` — kept for existing call sites. */
  accent?: "teal" | "amber" | "rose" | "slate";
  tone?: MissionKpiTone;
  progressPct?: number;
  delta?: MissionKpiDelta;
};

export function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 xl:grid-cols-4">
      {items.map((item) => {
        const tone = item.tone ?? accentToTone(item.accent);
        const card = (
          <MissionKpiCard
            label={item.label}
            value={item.value}
            hint={item.hint}
            tone={tone}
            progressPct={item.progressPct}
            delta={item.delta}
          />
        );

        return item.href ? (
          <Link key={item.label} href={item.href} className="block">
            {card}
          </Link>
        ) : (
          <div key={item.label}>{card}</div>
        );
      })}
    </div>
  );
}
