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
import { FounderMissionShell } from "@/components/founder/founder-mission-shell";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { DashboardPanelShell } from "@/components/dx/dashboard-panel-shell";
import {
  FounderAiSummary,
  FounderMissionOverview,
} from "@/components/founder/founder-mission-overview";
import {
  FounderCrossRolePanel,
  FounderDecisionPanel,
  FounderDeliveryHealthPanel,
  FounderFundingPanel,
  FounderInvestorPanel,
  FounderInvestmentArchivePanel,
  FounderBenefitsTrackerPanel,
  FounderObjectivesPanel,
  FounderPortfolioPanel,
  FounderProductHealthPanel,
  FounderTeamHealthPanel,
} from "@/components/founder/founder-panels";
import { FounderContextWorkspace } from "@/components/founder/founder-workspace";
import { FounderIntelligenceFeedPanel } from "@/components/founder/founder-intelligence-feed-panel";
import { MissionPredictionKpis } from "@/components/prediction/mission-prediction-kpis";
import { CollaborativePanelsGrid } from "@/components/collaborative/collaborative-panels-grid";
import { getCollaborativeLoopSnapshot } from "@/services/collaborativeLoop";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { PERSONA_REVIEW_LABELS } from "@/lib/approval/persona-reviews";
import { NextUpStrip } from "@/components/dx/next-up-strip";
import { buildMissionNextUpItems } from "@/lib/mission-next-up";
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";

export const dynamic = "force-dynamic";

export default async function FounderMissionControlPage() {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .maybeSingle();

  if (profile?.role !== "executive" && profile?.role !== "pm") {
    redirect("/workspace/dashboard");
  }

  const [data, ctx, collaborativeLoop, pendingReviews] = await Promise.all([
    getFounderMissionControl(),
    getFounderContext().catch(() => null),
    getCollaborativeLoopSnapshot("founder"),
    listPendingArtifactReviewsForPersona("founder").catch(() => []),
  ]);

  const primaryProject = data.portfolio[0]
    ? { id: data.portfolio[0].id, name: data.portfolio[0].name }
    : null;
  const projectId = primaryProject?.id;

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
    pendingReviewCount: pendingReviews.length,
    pendingDecisionsCount,
    bridgeDismissed: false,
  });

  const nextUpItems = buildMissionNextUpItems({
    personaId: "founder",
    primaryProject,
    hasProjects: data.portfolio.length > 0,
    pendingReviews,
    openDecisions: pendingDecisionsCount,
    decisionTitle: data.decisionsNeeded[0]?.title,
    blockedTasks: data.deliveryHealth.blockedDependencies,
  });

  return (
    <MissionDashboardChrome
      personaId="founder"
      header={{
        userName: data.userName,
        orgName: data.orgName,
        primaryProject,
        subtitle: serverFounderMode === "day-one" ? FOUNDER_DAY_ONE_SUBTITLE : undefined,
      }}
    >
      <FounderMissionShell
        projectId={projectId}
        hasBootstrapSummary={hasBootstrapSummary}
        pendingReviewCount={pendingReviews.length}
        pendingDecisionsCount={pendingDecisionsCount}
        summary={bootstrapSummary}
      >
        <div className="space-y-4 p-6 md:p-8">
          <NextUpStrip items={nextUpItems} personaLabel={PERSONA_REVIEW_LABELS.founder} />
          <MissionBootstrapBanner
            personaId="founder"
            projectId={data.portfolio[0]?.id}
            showFallback={data.dataSources.financials === "fallback"}
          />

          <FounderMissionOverview data={data} />
          {data.portfolio[0] ? (
            <MissionPredictionKpis projectId={data.portfolio[0].id} />
          ) : null}
          <FounderAiSummary summary={data.aiSummary} />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <DashboardPanelShell panelId="funding" title="Funding & runway">
              <FounderFundingPanel funding={data.funding} />
            </DashboardPanelShell>
            <DashboardPanelShell panelId="objectives" title="Strategic objectives" ownerNote="">
              <FounderObjectivesPanel
                objectives={data.strategicObjectives}
                insight={data.strategicInsight}
              />
            </DashboardPanelShell>
          </div>

          <DashboardPanelShell panelId="portfolio" title="Project portfolio">
            <FounderPortfolioPanel portfolio={data.portfolio} />
          </DashboardPanelShell>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <DashboardPanelShell panelId="investment-archive" title="Investment report archive">
              <FounderInvestmentArchivePanel reports={data.investmentReports} />
            </DashboardPanelShell>
            <DashboardPanelShell panelId="benefits-tracker" title="Benefits tracker">
              <FounderBenefitsTrackerPanel benefits={data.benefitsTracker} />
            </DashboardPanelShell>
          </div>
          <DashboardPanelShell panelId="investor" title="Investor dashboard">
            <FounderInvestorPanel bullets={data.investorUpdate} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="decisions" title="Decision centre" ownerNote="">
            <FounderDecisionPanel
              decisions={data.decisionsNeeded}
              dataSource={data.dataSources.decisions}
            />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="intelligence-feed" title="Intelligence feed">
            <FounderIntelligenceFeedPanel
              items={data.intelligenceFeed}
              dataSource={data.dataSources.intelligence}
            />
          </DashboardPanelShell>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <DashboardPanelShell panelId="delivery-health" title="Delivery health">
              <FounderDeliveryHealthPanel health={data.deliveryHealth} />
            </DashboardPanelShell>
            <DashboardPanelShell panelId="product-health" title="Product health">
              <FounderProductHealthPanel health={data.productHealth} />
            </DashboardPanelShell>
          </div>

          <DashboardPanelShell panelId="team-health" title="Team health">
            <FounderTeamHealthPanel health={data.teamHealth} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="collaborative-loop" title="Collaborative loop">
            <CollaborativePanelsGrid snapshot={collaborativeLoop} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="cross-role" title="Cross-role impact">
            <FounderCrossRolePanel impacts={data.crossRoleImpact} />
          </DashboardPanelShell>

          <DashboardPanelShell panelId="founder-context" title="Founder context">
            <FounderContextWorkspace
              companyType={ctx?.company_type}
              businessGoals={ctx?.business_goals}
              extractionStatus={data.extractionStatus}
            />
          </DashboardPanelShell>
        </div>
      </FounderMissionShell>
    </MissionDashboardChrome>
  );
}
