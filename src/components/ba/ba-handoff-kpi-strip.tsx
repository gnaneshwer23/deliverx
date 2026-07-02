"use client";

import Link from "next/link";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { buildBaHandoffKpis } from "@/lib/ba-handoff-kpis";
import type { BaMissionControl } from "@/services/baDashboard";

export function BaHandoffKpiStrip({
  data,
  openClarifications,
  pendingReviewCount,
  projectId,
}: {
  data: BaMissionControl;
  openClarifications: number;
  pendingReviewCount: number;
  projectId?: string;
}) {
  const kpis = buildBaHandoffKpis({
    kpis: data.kpis,
    openClarifications,
    pendingReviewCount,
    projectId,
  });

  return (
    <div data-testid="ba-handoff-kpis">
      <MissionKpiGrid layout="wide" className="ba-handoff-kpis">
      {kpis.map((kpi) => {
        const card = (
          <MissionKpiCard
            label={kpi.label}
            value={kpi.value}
            hint={kpi.hint}
            tone={kpi.tone}
            progressPct={kpi.progressPct}
            valueSize="xl"
            className={kpi.href ? "transition hover:border-[#F0D4B0]" : undefined}
          />
        );
        return kpi.href ? (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B7620A]"
          >
            {card}
          </Link>
        ) : (
          <div key={kpi.label}>{card}</div>
        );
      })}
      </MissionKpiGrid>
    </div>
  );
}
