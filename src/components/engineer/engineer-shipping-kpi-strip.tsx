"use client";

import Link from "next/link";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { buildEngineerShippingKpis } from "@/lib/engineer-shipping-kpis";
import type { EngineerMissionControl } from "@/services/engineerDashboard";

export function EngineerShippingKpiStrip({
  data,
  blockedDependencies,
  projectId,
}: {
  data: EngineerMissionControl;
  blockedDependencies: number;
  projectId?: string;
}) {
  const kpis = buildEngineerShippingKpis({
    overview: data.overview,
    prDashboard: data.prDashboard,
    cicd: data.cicd,
    githubConfigured: data.github.configured,
    blockedDependencies,
    projectId,
  });

  return (
    <MissionKpiGrid layout="wide" className="engineer-shipping-kpis">
      {kpis.map((kpi) => {
        const card = (
          <MissionKpiCard
            label={kpi.label}
            value={kpi.value}
            hint={kpi.hint}
            tone={kpi.tone}
            progressPct={kpi.progressPct}
            valueSize="xl"
            className={kpi.href ? "transition hover:border-[#B8CCE0]" : undefined}
          />
        );
        return kpi.href ? (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3F6B]"
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
