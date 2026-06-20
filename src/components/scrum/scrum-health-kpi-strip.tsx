"use client";

import Link from "next/link";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { buildScrumHealthKpis } from "@/lib/scrum-health-kpis";
import type { ScrumMissionControl } from "@/services/scrumDashboard";

export function ScrumHealthKpiStrip({
  data,
  projectId,
}: {
  data: ScrumMissionControl;
  projectId?: string;
}) {
  const kpis = buildScrumHealthKpis({
    overview: data.overview,
    sprintHealth: data.sprintHealth,
    impediments: data.impediments,
    dataSources: data.dataSources,
    projectId,
  });

  return (
    <MissionKpiGrid layout="wide" className="scrum-health-kpis">
      {kpis.map((kpi) => {
        const card = (
          <MissionKpiCard
            label={kpi.label}
            value={kpi.value}
            hint={kpi.hint}
            tone={kpi.tone}
            progressPct={kpi.progressPct}
            valueSize="xl"
            className={kpi.href ? "transition hover:border-[#B8DDD0]" : undefined}
          />
        );
        return kpi.href ? (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6B4A]"
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
