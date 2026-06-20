"use client";

import Link from "next/link";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { buildProductRoadmapKpis } from "@/lib/product-roadmap-kpis";
import type { ProductMissionControl } from "@/services/pmDashboard";

export function ProductRoadmapKpiStrip({
  data,
  projectId,
}: {
  data: ProductMissionControl;
  projectId?: string;
}) {
  const kpis = buildProductRoadmapKpis({
    kpis: data.kpis,
    roadmap: data.roadmap,
    topFeatures: data.topFeatures,
    dataSources: data.dataSources,
    projectId,
  });

  return (
    <MissionKpiGrid layout="wide" className="product-roadmap-kpis">
      {kpis.map((kpi) => {
        const card = (
          <MissionKpiCard
            label={kpi.label}
            value={kpi.value}
            hint={kpi.hint}
            tone={kpi.tone}
            progressPct={kpi.progressPct}
            valueSize="xl"
            className={kpi.href ? "transition hover:border-[#E8C8C0]" : undefined}
          />
        );
        return kpi.href ? (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B4A3A]"
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
