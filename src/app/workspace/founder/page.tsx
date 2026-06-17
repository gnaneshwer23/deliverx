import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFounderMissionControl } from "@/services/founderDashboard";
import { getFounderContext } from "@/services/founderContext";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
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
import { dxClass } from "@/lib/dx-theme";

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

  const [data, ctx] = await Promise.all([
    getFounderMissionControl(),
    getFounderContext().catch(() => null),
  ]);

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX OS · Founder"
        title="Founder Mission"
        titleEm="control"
        action={
          <Link href="/workspace/portfolio" className={`${dxClass.btnGhost} text-[10px]`}>
            Full portfolio →
          </Link>
        }
      />
      <div className="space-y-6 p-6 md:p-8">
        <p className="max-w-3xl text-sm text-[#6B6B64]">
          AI Chief of Staff — vision, runway, portfolio health, decisions, investor updates, and
          cross-role signals from product through delivery to revenue.
        </p>

        <FounderMissionOverview data={data} />
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
