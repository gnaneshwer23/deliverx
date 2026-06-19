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
import { groupPendingFounderReviewsByCategory } from "@/lib/founder-day-one-panels";
import {
  buildFounderAttentionFeed,
  buildFounderGovernanceTabCounts,
  buildFounderSteadyStateSubtitle,
  countWaitingOnFounder,
} from "@/lib/founder-steady-state-panels";
import { FounderMissionShell } from "@/components/founder/founder-mission-shell";
import { FounderMissionHeaderActions } from "@/components/founder/founder-mission-header-actions";
import { FounderMissionPanelSwitch } from "@/components/founder/founder-mission-panel-switch";
import { FounderProjectChip } from "@/components/founder/founder-project-chip";
import {
  FounderCompactDecisionsCard,
  FounderCompactPortfolioCard,
  FounderDayOneFundingCard,
  FounderDayOneKpiStrip,
  FounderGetOrientedCard,
  FounderReviewInboxPanel,
} from "@/components/founder/founder-day-one-panels";
import {
  FounderAiReviewInboxPanel,
  FounderDeliveryHealthPanel,
  FounderGovernanceTabsPanel,
  FounderIntelligenceFeedPanel,
  FounderNeedsAttentionPanel,
  FounderProductHealthPanel,
  FounderSteadyStateContextPanel,
  FounderSteadyStateKpiStrip,
  FounderSteadyStateLayout,
  FounderTeamHealthPanel,
} from "@/components/founder/founder-steady-state-panels";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { DashboardPanelShell } from "@/components/dx/dashboard-panel-shell";
import { FounderAiSummary } from "@/components/founder/founder-mission-overview";
import { FounderContextWorkspace } from "@/components/founder/founder-workspace";
import { MissionPredictionKpis } from "@/components/prediction/mission-prediction-kpis";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import {
  filterReviewsByProject,
  PERSONA_REVIEW_LABELS,
} from "@/lib/approval/persona-reviews";
import { NextUpStrip } from "@/components/dx/next-up-strip";
import { buildMissionNextUpItems } from "@/lib/mission-next-up";
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";

export const dynamic = "force-dynamic";

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
  const [data, ctx, pendingReviews] = await Promise.all([
    getFounderMissionControl(params.project),
    getFounderContext().catch(() => null),
    listPendingArtifactReviewsForPersona("founder").catch(() => []),
  ]);

  const projectId = data.primaryProject?.id;
  const projectPendingReviews = filterReviewsByProject(pendingReviews, projectId);
  const reviewGroups = groupPendingFounderReviewsByCategory(projectPendingReviews);

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
    projectId,
    hasBootstrapSummary,
    pendingReviewCount: projectPendingReviews.length,
    pendingDecisionsCount,
    bridgeDismissed: false,
  });

  const attentionFeed = buildFounderAttentionFeed({
    decisions: data.decisionsNeeded,
    pendingReviewCount: projectPendingReviews.length,
    criticalRisks: data.deliveryHealth.criticalRisks,
    blockedDependencies: data.deliveryHealth.blockedDependencies,
    portfolio: data.portfolio,
    intelligenceFeed: data.intelligenceFeed,
    runwayMonths: data.kpis.runwayMonths,
    projectId,
  });
  const waitingOnYouCount = countWaitingOnFounder(attentionFeed);
  const governanceTabCounts = buildFounderGovernanceTabCounts({
    decisionsCount: pendingDecisionsCount,
    portfolioCount: data.portfolio.length,
    objectivesCount: data.strategicObjectives.length,
    runwayMonths: data.kpis.runwayMonths,
  });
  const steadyStateSubtitle = buildFounderSteadyStateSubtitle({
    projectName: data.primaryProject?.name,
    pendingDecisionsCount,
    pendingReviewCount: projectPendingReviews.length,
    criticalRisks: data.deliveryHealth.criticalRisks,
  });

  const nextUpItems = buildMissionNextUpItems({
    personaId: "founder",
    primaryProject: data.primaryProject,
    hasProjects: data.projects.length > 0,
    pendingReviews: projectPendingReviews,
    openDecisions: pendingDecisionsCount,
    decisionTitle: data.decisionsNeeded[0]?.title,
    blockedTasks: data.deliveryHealth.blockedDependencies,
  });

  const dayOnePanels = (
    <>
      <FounderDayOneKpiStrip
        pendingReviewCount={projectPendingReviews.length}
        pendingDecisionsCount={pendingDecisionsCount}
        data={data}
      />
      <FounderAiSummary summary={data.aiSummary} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <FounderReviewInboxPanel
            groups={reviewGroups}
            projectId={projectId}
            pendingReviews={projectPendingReviews}
          />
          <FounderCompactDecisionsCard
            decisions={data.decisionsNeeded}
            projectId={projectId}
            dataSource={data.dataSources.decisions}
          />
          <FounderDayOneFundingCard funding={data.funding} />
        </div>
        <div className="space-y-4">
          <FounderCompactPortfolioCard portfolio={data.portfolio} projectId={projectId} />
          <FounderGetOrientedCard projectId={projectId} />
          <DashboardPanelShell panelId="founder-context" title="Founder context">
            <FounderContextWorkspace
              companyType={ctx?.company_type}
              businessGoals={ctx?.business_goals}
              extractionStatus={data.extractionStatus}
            />
          </DashboardPanelShell>
        </div>
      </div>
    </>
  );

  const steadyStatePanels = (
    <FounderSteadyStateLayout
      kpiStrip={
        <FounderSteadyStateKpiStrip data={data} waitingOnYouCount={waitingOnYouCount} />
      }
      aiSummary={<FounderAiSummary summary={data.aiSummary} />}
      leftColumn={
        <>
          <FounderNeedsAttentionPanel
            data={data}
            pendingReviewCount={projectPendingReviews.length}
            projectId={projectId}
          />
          <FounderGovernanceTabsPanel
            data={data}
            tabCounts={governanceTabCounts}
            projectId={projectId}
          />
          <FounderAiReviewInboxPanel
            pendingReviews={projectPendingReviews}
            projectId={projectId}
          />
        </>
      }
      rightColumn={
        <>
          <FounderCompactPortfolioCard portfolio={data.portfolio} projectId={projectId} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div data-panel="delivery-health">
              <FounderDeliveryHealthPanel health={data.deliveryHealth} />
            </div>
            <div data-panel="product-health">
              <FounderProductHealthPanel health={data.productHealth} />
            </div>
          </div>
          <FounderIntelligenceFeedPanel
            items={data.intelligenceFeed}
            dataSource={data.dataSources.intelligence}
          />
          <FounderTeamHealthPanel health={data.teamHealth} />
          {projectId ? <MissionPredictionKpis projectId={projectId} /> : null}
          <FounderSteadyStateContextPanel
            ctx={ctx}
            extractionStatus={data.extractionStatus}
            projectId={projectId}
          />
        </>
      }
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
          projectId={projectId}
          hasBootstrapSummary={hasBootstrapSummary}
          pendingReviewCount={projectPendingReviews.length}
          pendingDecisionsCount={pendingDecisionsCount}
        />
      }
    >
      <FounderMissionShell
        projectId={projectId}
        hasBootstrapSummary={hasBootstrapSummary}
        pendingReviewCount={projectPendingReviews.length}
        pendingDecisionsCount={pendingDecisionsCount}
        summary={bootstrapSummary}
      >
        <div className="space-y-4 p-6 md:p-8">
          <NextUpStrip items={nextUpItems} personaLabel={PERSONA_REVIEW_LABELS.founder} personaId="founder" />
          <MissionBootstrapBanner
            personaId="founder"
            projectId={projectId}
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
          <FounderMissionPanelSwitch dayOne={dayOnePanels} steadyState={steadyStatePanels} />
        </div>
      </FounderMissionShell>
    </MissionDashboardChrome>
  );
}
