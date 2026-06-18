import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  MissionKpiCard,
  MissionKpiGrid,
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
    <MissionKpiGrid layout="wide">
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
            valueSize="xl"
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
    </MissionKpiGrid>
  );
}
