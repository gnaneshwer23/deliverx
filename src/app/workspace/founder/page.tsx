import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFounderMissionControl } from "@/services/founderDashboard";
import { getFounderContext } from "@/services/founderContext";
import { MissionPersonaHeader } from "@/components/dx/mission-persona-header";
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
import { MissionPredictionKpis } from "@/components/prediction/mission-prediction-kpis";
import { CollaborativePanelsGrid } from "@/components/collaborative/collaborative-panels-grid";
import { getCollaborativeLoopSnapshot } from "@/services/collaborativeLoop";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { PERSONA_REVIEW_LABELS } from "@/lib/approval/persona-reviews";
import { PendingReviewsStrip } from "@/components/approvals/pending-reviews-strip";
import { MockDataBanner } from "@/components/dx/mock-data-banner";

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

  return (
    <>
      <MissionPersonaHeader
        personaId="founder"
        userName={data.userName}
        orgName={data.orgName}
        primaryProject={data.portfolio[0] ? { id: data.portfolio[0].id, name: data.portfolio[0].name } : null}
      />
      <div className="space-y-6 p-6 md:p-8">
        <PendingReviewsStrip
          reviews={pendingReviews}
          personaLabel={PERSONA_REVIEW_LABELS.founder}
          persona="founder"
          inlineActions
        />
        {data.dataSources.financials === "fallback" ? (
          <MockDataBanner message="Financial KPIs are illustrative until you upload pitch deck or business case." />
        ) : null}

        <FounderMissionOverview data={data} />
        {data.portfolio[0] ? (
          <MissionPredictionKpis projectId={data.portfolio[0].id} />
        ) : null}
        <FounderAiSummary summary={data.aiSummary} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <FounderFundingPanel funding={data.funding} />
          <FounderObjectivesPanel
            objectives={data.strategicObjectives}
            insight={data.strategicInsight}
          />
        </div>

        <FounderPortfolioPanel portfolio={data.portfolio} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <FounderInvestmentArchivePanel reports={data.investmentReports} />
          <FounderBenefitsTrackerPanel benefits={data.benefitsTracker} />
        </div>
        <FounderInvestorPanel bullets={data.investorUpdate} />
        <FounderDecisionPanel decisions={data.decisionsNeeded} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <FounderDeliveryHealthPanel health={data.deliveryHealth} />
          <FounderProductHealthPanel health={data.productHealth} />
        </div>

        <FounderTeamHealthPanel health={data.teamHealth} />
        <CollaborativePanelsGrid snapshot={collaborativeLoop} />
        <FounderCrossRolePanel impacts={data.crossRoleImpact} />

        <FounderContextWorkspace
          companyType={ctx?.company_type}
          businessGoals={ctx?.business_goals}
          extractionStatus={data.extractionStatus}
        />
      </div>
    </>
  );
}
