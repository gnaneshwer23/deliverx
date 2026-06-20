"use client";

import Link from "next/link";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { buildQaReleaseKpis } from "@/lib/qa-release-kpis";
import type { QaMissionControl } from "@/services/qaDashboard";

export function QaReleaseKpiStrip({
  data,
  projectId,
}: {
  data: QaMissionControl;
  projectId?: string;
}) {
  const kpis = buildQaReleaseKpis({
    overview: data.overview,
    releaseReadiness: data.releaseReadiness,
    automation: data.automation,
    dataSources: data.dataSources,
    projectId,
  });

  return (
    <MissionKpiGrid layout="wide" className="qa-release-kpis">
      {kpis.map((kpi) => {
        const card = (
          <MissionKpiCard
            label={kpi.label}
            value={kpi.value}
            hint={kpi.hint}
            tone={kpi.tone}
            progressPct={kpi.progressPct}
            valueSize="xl"
            className={kpi.href ? "transition hover:border-[#D4C0E8]" : undefined}
          />
        );
        return kpi.href ? (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B3FA0]"
          >
            {card}
          </Link>
        ) : (
          <div key={kpi.label}>{card}</div>
        );
      })}
    </MissionKpiGrid>
  );
}
