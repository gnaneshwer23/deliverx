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
import {
  PmCompactRaidCard,
  PmDayOneKpiStrip,
  PmDayOneMilestonesPanel,
  PmGetOrientedCard,
  PmReviewAiBuiltPanel,
  PmTeamRosterPanel,
} from "@/components/delivery-pm/pm-day-one-panels";
import { PmMissionPanelSwitch } from "@/components/delivery-pm/pm-mission-panel-switch";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";
import { ProjectMemoryPanel } from "@/components/memory/project-memory-panel";
import { MeetingIntelligencePanel } from "@/components/meetings/meeting-intelligence-panel";
import { getProjectMemoryStats } from "@/services/projectMemoryRag";
import { getProjectMeetingIntelligenceStats } from "@/services/meetingIntelligence";
import {
  listPendingArtifactReviews,
  listPendingArtifactReviewsForPersona,
} from "@/services/artifactReviews";
import { listPendingInvitations } from "@/services/invitations";
import { listOrgMembers } from "@/services/delivery";
import { getProjectBootstrapStatus } from "@/services/projectBootstrap";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { hasBootstrapParitySummary } from "@/lib/bootstrap-checklist";
import { groupPendingReviewsByCategory } from "@/lib/pm-day-one-panels";
import { PM_DAY_ONE_SUBTITLE, resolvePmDashboardMode } from "@/lib/pm-dashboard-mode";
import { PmMissionShell } from "@/components/delivery-pm/pm-mission-shell";
import {
  filterPendingReviewsForPersona,
  filterReviewsByProject,
  PERSONA_REVIEW_LABELS,
} from "@/lib/approval/persona-reviews";
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
  const [data, collaborativeLoop, pendingReviews, pendingInvites, orgMembers] = await Promise.all([
    getPmMissionControl(params.project),
    getCollaborativeLoopSnapshot("pm", params.project),
    listPendingArtifactReviewsForPersona("pm-mission").catch(() => []),
    listPendingInvitations().catch(() => []),
    listOrgMembers().catch(() => []),
  ]);

  const projectId = data.primaryProject?.id;
  let bootstrapSummary: ProjectBootstrapSummary | null = null;
  let hasBootstrapSummary = false;

  if (projectId) {
    const bootstrap = await getProjectBootstrapStatus(projectId).catch(() => null);
    if (bootstrap && hasBootstrapParitySummary(bootstrap.summary)) {
      bootstrapSummary = bootstrap.summary;
      hasBootstrapSummary = true;
    }
  }

  const allPmReviews = filterPendingReviewsForPersona(
    await listPendingArtifactReviews(50).catch(() => []),
    "pm-mission",
  );
  const projectPendingReviews = filterReviewsByProject(allPmReviews, projectId);
  const reviewGroups = groupPendingReviewsByCategory(projectPendingReviews);

  const teamInvitesPending = pendingInvites.length;
  const teamJoinedCount =
    orgMembers.length || bootstrapSummary?.structure?.stakeholders || 1;
  const teamTotalCount = Math.max(teamJoinedCount + teamInvitesPending, teamJoinedCount);

  const serverPmMode = resolvePmDashboardMode({
    projectId,
    hasBootstrapSummary,
    pendingReviewCount: pendingReviews.length,
    teamInvitesPending,
    bridgeDismissed: false,
  });
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

  const projectPicker =
    data.projects.length > 1 && data.primaryProject ? (
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
    ) : null;

  const dayOnePanels = (
    <>
      <PmDayOneKpiStrip
        pendingReviewCount={projectPendingReviews.length}
        bootstrapSummary={bootstrapSummary}
        data={data}
        teamJoinedCount={teamJoinedCount}
        teamTotalCount={teamTotalCount}
      />
      <DeliveryPmAiSummary summary={data.aiSummary} projectId={data.primaryProject?.id} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <PmReviewAiBuiltPanel
            groups={reviewGroups}
            projectId={projectId}
            pendingReviews={projectPendingReviews}
          />
          <PmDayOneMilestonesPanel
            milestones={data.milestones}
            usesFallback={data.dataSources.deliveryPlan === "fallback"}
          />
          <DeliveryPmGuidedTasks tasks={data.guidedTasks} />
        </div>
        <div className="space-y-4">
          <PmCompactRaidCard raid={data.raid} projectId={projectId} />
          <PmTeamRosterPanel
            members={orgMembers}
            pendingInvites={pendingInvites}
            bootstrapSummary={bootstrapSummary}
          />
          <PmGetOrientedCard projectId={projectId} />
        </div>
      </div>
    </>
  );

  const steadyStatePanels = (
    <>
      <DeliveryPmMissionOverview data={data} />
      {data.primaryProject ? (
        <MissionPredictionKpis projectId={data.primaryProject.id} />
      ) : null}
      <DeliveryPmAiSummary summary={data.aiSummary} projectId={data.primaryProject?.id} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardPanelShell panelId="guided-tasks" title="Today's guided tasks" ownerNote="">
          <DeliveryPmGuidedTasks tasks={data.guidedTasks} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="health" title="Project health" ownerNote="">
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
    </>
  );

  return (
    <MissionDashboardChrome
      personaId="pm-mission"
      header={{
        userName: data.userName,
        primaryProject: data.primaryProject,
        subtitle: serverPmMode === "day-one" ? PM_DAY_ONE_SUBTITLE : undefined,
      }}
    >
      <PmMissionShell
        projectId={projectId}
        hasBootstrapSummary={hasBootstrapSummary}
        pendingReviewCount={pendingReviews.length}
        teamInvitesPending={teamInvitesPending}
        summary={bootstrapSummary}
        teamJoinedCount={bootstrapSummary?.structure?.stakeholders}
      >
        <div className="space-y-4 p-6 md:p-8">
          {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="PM" /> : null}
          <MissionBootstrapBanner
            personaId="pm-mission"
            projectId={data.primaryProject?.id}
            showFallback={data.dataSources.deliveryPlan === "fallback"}
          />
          <NextUpStrip items={nextUpItems} personaLabel={PERSONA_REVIEW_LABELS["pm-mission"]} />
          {projectPicker}
          <PmMissionPanelSwitch dayOne={dayOnePanels} steadyState={steadyStatePanels} />
        </div>
      </PmMissionShell>
    </MissionDashboardChrome>
  );
}
