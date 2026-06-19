import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPmMissionControl } from "@/services/deliveryPmDashboard";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { DashboardPanelShell } from "@/components/dx/dashboard-panel-shell";
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
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";
import { ProjectMemoryPanel } from "@/components/memory/project-memory-panel";
import { MeetingIntelligencePanel } from "@/components/meetings/meeting-intelligence-panel";
import { getProjectMemoryStats } from "@/services/projectMemoryRag";
import { getProjectMeetingIntelligenceStats } from "@/services/meetingIntelligence";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { PERSONA_REVIEW_LABELS } from "@/lib/approval/persona-reviews";
import { NextUpStrip } from "@/components/dx/next-up-strip";
import { buildMissionNextUpItems } from "@/lib/mission-next-up";
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

  const nextUpItems = buildMissionNextUpItems({
    personaId: "pm-mission",
    primaryProject: data.primaryProject,
    hasProjects: data.projects.length > 0,
    pendingReviews,
    openDecisions: data.overview.openDecisions,
    decisionTitle: data.decisions.find((d) => d.status === "proposed")?.title,
    blockedTasks: data.overview.blockedDependencies,
    guidedTaskTitle: data.guidedTasks[0]?.title,
    guidedTaskHref: data.primaryProject
      ? `/project/${data.primaryProject.id}/delivery`
      : undefined,
  });

  return (
    <MissionDashboardChrome
      personaId="pm-mission"
      header={{
        userName: data.userName,
        primaryProject: data.primaryProject,
      }}
    >
      <div className="space-y-4 p-6 md:p-8">
        {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="PM" /> : null}
        <MissionBootstrapBanner
          projectId={data.primaryProject?.id}
          showFallback={data.dataSources.deliveryPlan === "fallback"}
          fallbackMessage="Milestones, budget, and timeline are illustrative until you upload a project charter."
        />
        <NextUpStrip items={nextUpItems} personaLabel={PERSONA_REVIEW_LABELS["pm-mission"]} />

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

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="guided-tasks" title="Today's guided tasks">
            <DeliveryPmGuidedTasks tasks={data.guidedTasks} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="health" title="Project health">
            <DeliveryHealthPanel
              dimensions={data.healthDimensions}
              insight={data.healthInsight}
            />
          </DashboardPanelShell>
        </div>

        <DashboardPanelShell panelId="stakeholders" title="Stakeholders">
          <DeliveryStakeholdersPanel rows={data.stakeholders} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="stakeholder-actions" title="Stakeholder action queue">
          <DeliveryStakeholderActionQueue actions={data.stakeholderActionQueue} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="status-reports" title="Status reports">
          <DeliveryStatusReportsPanel
            projectId={data.primaryProject?.id}
            reports={data.statusReports}
          />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="project-memory" title="Project memory">
          <ProjectMemoryPanel
            projectId={data.primaryProject?.id}
            initialStats={memoryStats}
          />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="meeting-intelligence" title="Meeting intelligence">
          <MeetingIntelligencePanel
            projectId={data.primaryProject?.id}
            stats={meetingStats}
          />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="raid" title="RAID control centre">
          <DeliveryRaidPanel raid={data.raid} />
        </DashboardPanelShell>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="milestones" title="Milestones & timeline">
            <DeliveryMilestonesPanel
              milestones={data.milestones}
              goLiveProbability={data.overview.goLiveProbability}
              usesFallback={data.dataSources.deliveryPlan === "fallback"}
            />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="budget" title="Budget">
            <DeliveryBudgetPanel
              budget={data.budget}
              usesFallback={data.dataSources.deliveryPlan === "fallback"}
            />
          </DashboardPanelShell>
        </div>

        <DashboardPanelShell panelId="benefits" title="Benefits realisation">
          <DeliveryBenefitsPanel benefits={data.benefits} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="decisions" title="Decision register">
          <DeliveryDecisionsPanel decisions={data.decisions} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="collaborative-loop" title="Collaborative loop">
          <CollaborativePanelsGrid snapshot={collaborativeLoop} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="cross-role" title="Cross-role impact">
          <DeliveryCrossRolePanel impacts={data.crossRoleImpact} />
        </DashboardPanelShell>
      </div>
    </MissionDashboardChrome>
  );
}
