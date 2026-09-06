import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFounderMissionControl } from "@/services/founderDashboard";
import { getFounderContext } from "@/services/founderContext";
import { getProjectBootstrapStatus } from "@/services/projectBootstrap";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { hasBootstrapParitySummary } from "@/lib/bootstrap-checklist";
import {
  FOUNDER_DAY_ONE_SUBTITLE,
  resolveFounderDashboardMode,
} from "@/lib/founder-dashboard-mode";
import { buildFounderPortfolioSnapshotCounts } from "@/lib/founder-day-one-panels";
import { buildFounderDecisionCentreItems } from "@/lib/founder-decision-centre";
import { pickFounderDeliveryPatternInsight } from "@/lib/founder-delivery-patterns";
import {
  buildFounderBoardMemoNarrative,
  buildFounderBoardMemoSubtitle,
} from "@/lib/founder-narrative-summary";
import { FounderMissionShell } from "@/components/founder/founder-mission-shell";
import { FounderMissionHeaderActions } from "@/components/founder/founder-mission-header-actions";
import { FounderMissionPanelSwitch } from "@/components/founder/founder-mission-panel-switch";
import { FounderProjectChip } from "@/components/founder/founder-project-chip";
import { FounderGetOrientedCard } from "@/components/founder/founder-day-one-panels";
import { FounderBoardMemoLayout } from "@/components/founder/founder-board-memo-layout";
import { FounderNarrativeSummary } from "@/components/founder/founder-narrative-summary";
import { FounderExecutiveKpiStrip } from "@/components/founder/founder-executive-kpi-strip";
import { FounderLiveSignalsPanel } from "@/components/founder/founder-live-signals-panel";
import { FounderDecisionCentre } from "@/components/founder/founder-decision-centre";
import { FounderDeliveryPatternsCard } from "@/components/founder/founder-delivery-patterns-card";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";
import { MissionHelmCopilotSlot } from "@/components/copilot/mission-helm-copilot-slot";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { filterReviewsByProject } from "@/lib/approval/persona-reviews";
import { listOrgImpactEvents } from "@/services/deliveryImpact";
import { resolveWorkspaceOrgProjectId } from "@/lib/professional-workspace/project-context";

export const dynamic = "force-dynamic";

function primaryStrategicObjective(data: Awaited<ReturnType<typeof getFounderMissionControl>>) {
  if (data.strategicObjectives.length === 0) return null;
  return [...data.strategicObjectives].sort((a, b) => a.progress - b.progress)[0] ?? null;
}

export default async function FounderMissionControlPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .maybeSingle();

  if (profile?.role !== "executive" && profile?.role !== "pm") {
    redirect("/workspace/dashboard");
  }

  const params = await searchParams;
  const projectId = resolveWorkspaceOrgProjectId(params.project);
  const [data, , pendingReviewsRaw, impactEventsRaw] = await Promise.all([
    getFounderMissionControl(projectId ?? undefined),
    getFounderContext().catch(() => null),
    listPendingArtifactReviewsForPersona("founder").catch(() => []),
    listOrgImpactEvents({ limit: 20, projectId: projectId ?? undefined }).catch(() => []),
  ]);

  const activeProjectId = data.primaryProject?.id;
  const projectPendingReviews = filterReviewsByProject(pendingReviewsRaw, activeProjectId);

  let bootstrapSummary: ProjectBootstrapSummary | null = null;
  let hasBootstrapSummary = false;

  if (projectId) {
    const bootstrap = await getProjectBootstrapStatus(projectId).catch(() => null);
    if (bootstrap && hasBootstrapParitySummary(bootstrap.summary)) {
      bootstrapSummary = bootstrap.summary;
      hasBootstrapSummary = true;
    }
  }

  const pendingDecisionsCount = data.decisionsNeeded.length;
  const serverFounderMode = resolveFounderDashboardMode({
    projectId: activeProjectId,
    hasBootstrapSummary,
    pendingReviewCount: projectPendingReviews.length,
    pendingDecisionsCount,
    bridgeDismissed: false,
  });

  const portfolioCounts = buildFounderPortfolioSnapshotCounts(data.portfolio);
  const laggingObjective = primaryStrategicObjective(data);
  const boardMemoNarrative = buildFounderBoardMemoNarrative({
    projectName: data.primaryProject?.name,
    runwayMonths: data.kpis.runwayMonths,
    pendingDecisionsCount,
    pendingReviewCount: projectPendingReviews.length,
    portfolioOnTrack: portfolioCounts.onTrack,
    portfolioTotal: portfolioCounts.total,
    primaryObjectiveProgress: laggingObjective?.progress ?? null,
    primaryObjectiveTitle: laggingObjective?.title ?? null,
    runwayBelowThreshold: data.kpis.runwayMonths < 6,
    fallbackSummary: data.aiSummary,
  });

  const steadyStateSubtitle = buildFounderBoardMemoSubtitle({
    projectName: data.primaryProject?.name,
    pendingDecisionsCount,
    pendingReviewCount: projectPendingReviews.length,
  });

  const deliveryPatternInsight = pickFounderDeliveryPatternInsight(
    data.intelligenceFeed,
    data.dataSources.intelligence,
  );

  const dayOneDecisionItems = buildFounderDecisionCentreItems({
    decisions: data.decisionsNeeded,
    pendingReviews: projectPendingReviews,
    projectId: activeProjectId,
    mode: "day-one",
  });

  const steadyStateDecisionItems = buildFounderDecisionCentreItems({
    decisions: data.decisionsNeeded,
    pendingReviews: projectPendingReviews,
    projectId: activeProjectId,
    mode: "steady-state",
  });

  const dayOneBoardMemo = (
    <FounderBoardMemoLayout
      narrativeSummary={<FounderNarrativeSummary summary={boardMemoNarrative} />}
      strategicKpis={<FounderExecutiveKpiStrip data={data} />}
      decisionCentre={
        dayOneDecisionItems.length > 0 ? (
          <FounderDecisionCentre
            items={dayOneDecisionItems}
            projectId={activeProjectId}
            dataSource={data.dataSources.decisions}
          />
        ) : null
      }
      footer={<FounderGetOrientedCard projectId={activeProjectId} />}
    />
  );

  const steadyStateBoardMemo = (
    <FounderBoardMemoLayout
      narrativeSummary={<FounderNarrativeSummary summary={boardMemoNarrative} />}
      strategicKpis={<FounderExecutiveKpiStrip data={data} />}
      decisionCentre={
        steadyStateDecisionItems.length > 0 ? (
          <FounderDecisionCentre
            items={steadyStateDecisionItems}
            projectId={activeProjectId}
            dataSource={data.dataSources.decisions}
          />
        ) : null
      }
      deliveryPatterns={<FounderDeliveryPatternsCard insight={deliveryPatternInsight} />}
    />
  );

  return (
    <MissionDashboardChrome
      personaId="founder"
      header={{
        userName: data.userName,
        orgName: data.orgName,
        primaryProject: data.primaryProject,
        subtitle:
          serverFounderMode === "day-one" ? FOUNDER_DAY_ONE_SUBTITLE : steadyStateSubtitle,
      }}
      headerActions={
        <FounderMissionHeaderActions
          projectId={activeProjectId}
          hasBootstrapSummary={hasBootstrapSummary}
          pendingReviewCount={projectPendingReviews.length}
          pendingDecisionsCount={pendingDecisionsCount}
        />
      }
    >
      <FounderMissionShell
        projectId={activeProjectId}
        hasBootstrapSummary={hasBootstrapSummary}
        pendingReviewCount={projectPendingReviews.length}
        pendingDecisionsCount={pendingDecisionsCount}
        summary={bootstrapSummary}
      >
        <div className="space-y-4 p-6 md:p-8">
          <MissionBootstrapBanner
            personaId="founder"
            projectId={activeProjectId}
            showFallback={data.dataSources.financials === "fallback"}
          />
          {data.primaryProject ? (
            <FounderProjectChip
              projects={data.projects.map((project) => ({
                id: project.id,
                name: project.name,
              }))}
              selectedProjectId={data.primaryProject.id}
            />
          ) : null}
          <FounderMissionPanelSwitch dayOne={dayOneBoardMemo} steadyState={steadyStateBoardMemo} />
          <FounderLiveSignalsPanel events={impactEventsRaw} projectId={activeProjectId} />
          <MissionHelmCopilotSlot personaId="founder" projectId={activeProjectId} />
        </div>
      </FounderMissionShell>
    </MissionDashboardChrome>
  );
}
