"use client";

import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { buildFounderStrategicKpis } from "@/lib/founder-strategic-kpis";
import type { FounderMissionControl } from "@/services/founderDashboard";

export function FounderStrategicKpiStrip({
  data,
  pendingDecisionsCount,
}: {
  data: FounderMissionControl;
  pendingDecisionsCount: number;
}) {
  const kpis = buildFounderStrategicKpis({
    funding: data.funding,
    kpis: data.kpis,
    portfolio: data.portfolio,
    strategicObjectives: data.strategicObjectives,
    pendingDecisionsCount,
    dataSources: data.dataSources,
  });

  return (
    <div data-panel="founder-strategic-kpis">
      <MissionKpiGrid layout="wide">
        {kpis.map((kpi) => (
          <MissionKpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            hint={kpi.hint}
            tone={kpi.tone}
            progressPct={kpi.progressPct}
            valueSize="xl"
          />
        ))}
      </MissionKpiGrid>
    </div>
  );
}
