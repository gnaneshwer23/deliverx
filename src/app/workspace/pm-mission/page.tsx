import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPmMissionControl } from "@/services/deliveryPmDashboard";
import { MissionPersonaHeader } from "@/components/dx/mission-persona-header";
import {
  DeliveryPmAiSummary,
  DeliveryPmMissionOverview,
} from "@/components/delivery-pm/delivery-pm-mission-overview";
import {
  DeliveryBenefitsPanel,
  DeliveryBudgetPanel,
  DeliveryCrossRolePanel,
  DeliveryDecisionsPanel,
  DeliveryHealthPanel,
  DeliveryMilestonesPanel,
  DeliveryPmGuidedTasks,
  DeliveryRaidPanel,
  DeliveryStakeholdersPanel,
} from "@/components/delivery-pm/delivery-pm-panels";
import { DeliveryStatusReportsPanel } from "@/components/delivery-pm/delivery-status-reports-panel";
import { DeliveryStakeholderActionQueue } from "@/components/delivery-pm/delivery-stakeholder-action-queue";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MockDataBanner } from "@/components/dx/mock-data-banner";
import { ProjectMemoryPanel } from "@/components/memory/project-memory-panel";
import { MeetingIntelligencePanel } from "@/components/meetings/meeting-intelligence-panel";
import { getProjectMemoryStats } from "@/services/projectMemoryRag";
import { getProjectMeetingIntelligenceStats } from "@/services/meetingIntelligence";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { PERSONA_REVIEW_LABELS } from "@/lib/approval/persona-reviews";
import { PendingReviewsStrip } from "@/components/approvals/pending-reviews-strip";
import { dxClass } from "@/lib/dx-theme";
import { MissionPredictionKpis } from "@/components/prediction/mission-prediction-kpis";
import { CollaborativePanelsGrid } from "@/components/collaborative/collaborative-panels-grid";
import { getCollaborativeLoopSnapshot } from "@/services/collaborativeLoop";

export const dynamic = "force-dynamic";

export default async function PmMissionControlPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .maybeSingle();

  if (profile?.role !== "pm" && profile?.role !== "executive") {
    redirect("/workspace/dashboard");
  }

  const params = await searchParams;
  const [data, collaborativeLoop, pendingReviews] = await Promise.all([
    getPmMissionControl(params.project),
    getCollaborativeLoopSnapshot("pm", params.project),
    listPendingArtifactReviewsForPersona("pm-mission").catch(() => []),
  ]);
  const memoryStats = data.primaryProject
    ? await getProjectMemoryStats(data.primaryProject.id).catch(() => ({
        totalChunks: 0,
        bySource: {},
      }))
    : undefined;
  const meetingStats = data.primaryProject
    ? await getProjectMeetingIntelligenceStats(data.primaryProject.id).catch(() => undefined)
    : undefined;

  return (
    <>
      <MissionPersonaHeader
        personaId="pm-mission"
        userName={data.userName}
        primaryProject={data.primaryProject}
      />
      <div className="space-y-6 p-6 md:p-8">
        {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="PM" /> : null}
        {data.dataSources.deliveryPlan === "fallback" ? (
          <MockDataBanner message="Milestones, budget, and timeline panels use illustrative defaults until you connect a project charter or run AI delivery analysis." />
        ) : null}
        <PendingReviewsStrip
          reviews={pendingReviews}
          personaLabel={PERSONA_REVIEW_LABELS["pm-mission"]}
          persona="pm-mission"
          inlineActions
        />

        {data.projects.length > 1 && data.primaryProject ? (
          <div className="flex flex-wrap gap-2">
            {data.projects.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                href={`/workspace/pm-mission?project=${p.id}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  p.id === data.primaryProject?.id
                    ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
                    : "border-[#E4E4DC] text-[#6B6B64]"
                }`}
              >
                {p.name}
              </Link>
            ))}
          </div>
        ) : null}

        <DeliveryPmMissionOverview data={data} />
        {data.primaryProject ? (
          <MissionPredictionKpis projectId={data.primaryProject.id} />
        ) : null}
        <DeliveryPmAiSummary summary={data.aiSummary} projectId={data.primaryProject?.id} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <DeliveryPmGuidedTasks tasks={data.guidedTasks} />
          <DeliveryHealthPanel
            dimensions={data.healthDimensions}
            insight={data.healthInsight}
          />
        </div>

        <DeliveryStakeholdersPanel rows={data.stakeholders} />
        <DeliveryStakeholderActionQueue actions={data.stakeholderActionQueue} />
        <DeliveryStatusReportsPanel
          projectId={data.primaryProject?.id}
          reports={data.statusReports}
        />
        <ProjectMemoryPanel
          projectId={data.primaryProject?.id}
          initialStats={memoryStats}
        />
        <MeetingIntelligencePanel
          projectId={data.primaryProject?.id}
          stats={meetingStats}
        />
        <DeliveryRaidPanel raid={data.raid} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <DeliveryMilestonesPanel
            milestones={data.milestones}
            goLiveProbability={data.overview.goLiveProbability}
            usesFallback={data.dataSources.deliveryPlan === "fallback"}
          />
          <DeliveryBudgetPanel
            budget={data.budget}
            usesFallback={data.dataSources.deliveryPlan === "fallback"}
          />
        </div>

        <DeliveryBenefitsPanel benefits={data.benefits} />
        <DeliveryDecisionsPanel decisions={data.decisions} />
        <CollaborativePanelsGrid snapshot={collaborativeLoop} />
        <DeliveryCrossRolePanel impacts={data.crossRoleImpact} />
      </div>
    </>
  );
}
