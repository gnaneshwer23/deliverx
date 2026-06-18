import type { BaMissionControl } from "@/services/baDashboard";
import Link from "next/link";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { MissionAiSummaryBlock } from "@/components/dx/mission-ai-summary-block";

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
    <MissionAiSummaryBlock title="AI summary" summary={summary} icon>
      {projectId ? (
        <Link
          href={`/project/${projectId}/requirements`}
          className="mt-3 inline-block text-xs font-medium text-[#1C4A2E] hover:underline"
        >
          Open requirements workspace →
        </Link>
      ) : null}
    </MissionAiSummaryBlock>
  );
}
