"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { BaMissionControl } from "@/services/baDashboard";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";

const impactTone = {
  green: "healthy" as const,
  amber: "watch" as const,
  red: "at-risk" as const,
};

export function BaMissionOverview({ data }: { data: BaMissionControl }) {
  const { kpis } = data;
  const approvalPct =
    kpis.extracted > 0 ? Math.round((kpis.approved / kpis.extracted) * 100) : undefined;

  return (
    <MissionKpiGrid layout="mission">
      <MissionKpiCard label="Requirements extracted" value={kpis.extracted} valueSize="xl" />
      <MissionKpiCard
        label="Approved"
        value={kpis.approved}
        tone="healthy"
        progressPct={approvalPct}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Pending clarification"
        value={kpis.pendingClarification}
        tone={kpis.pendingClarification > 0 ? "watch" : "default"}
        delta={
          kpis.pendingClarification > 0
            ? { value: `${kpis.pendingClarification} open`, direction: "warn" }
            : undefined
        }
        valueSize="xl"
      />
      <MissionKpiCard
        label="Stakeholder reviews"
        value={kpis.stakeholderReviewsPending}
        tone={kpis.stakeholderReviewsPending > 0 ? "watch" : "default"}
        valueSize="xl"
      />
      <MissionKpiCard label="Stories ready" value={kpis.storiesReady} tone="healthy" valueSize="xl" />
      <MissionKpiCard
        label="Traceability"
        value={`${kpis.traceabilityScore}%`}
        progressPct={kpis.traceabilityScore}
        tone={kpis.traceabilityScore >= 80 ? "healthy" : kpis.traceabilityScore >= 50 ? "watch" : "default"}
        valueSize="xl"
      />
      <MissionKpiCard
        label="Delivery impact"
        value={kpis.deliveryImpact}
        tone={impactTone[kpis.deliveryImpactTone]}
        valueSize="xl"
      />
    </MissionKpiGrid>
  );
}

export function BaAiSummary({ summary, projectId }: { summary: string; projectId?: string }) {
  return (
    <div className="rounded-xl border border-[#C6DDD0] bg-[#EEF5F1]/60 p-5">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#1C4A2E]">
        <Sparkles size={14} />
        AI summary
      </div>
      <p className="text-sm leading-relaxed text-[#0D0D0B]">&ldquo;{summary}&rdquo;</p>
      {projectId ? (
        <Link
          href={`/project/${projectId}/requirements`}
          className="mt-3 inline-block text-xs font-medium text-[#1C4A2E] hover:underline"
        >
          Open requirements workspace →
        </Link>
      ) : null}
    </div>
  );
}
