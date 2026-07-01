"use client";

import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { buildFounderExecutiveKpis } from "@/lib/founder-executive-kpis";
import type { FounderMissionControl } from "@/services/founderDashboard";

/** Three honest executive KPIs — health, budget, risks (S9 sponsor view). */
export function FounderExecutiveKpiStrip({ data }: { data: FounderMissionControl }) {
  const kpis = buildFounderExecutiveKpis(data);

  return (
    <div data-panel="founder-executive-kpis">
      <MissionKpiGrid layout="strip" className="lg:grid-cols-3 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <MissionKpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            hint={kpi.hint}
            tone={kpi.tone}
            valueSize="xl"
          />
        ))}
      </MissionKpiGrid>
    </div>
  );
}
