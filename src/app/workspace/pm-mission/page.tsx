import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPmMissionControl } from "@/services/deliveryPmDashboard";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { DeliveryPmAiSummary } from "@/components/delivery-pm/delivery-pm-mission-overview";
import { DeliveryPmGuidedTasks } from "@/components/delivery-pm/delivery-pm-panels";
import {
  PmCompactRaidCard,
  PmDayOneKpiStrip,
  PmDayOneMilestonesPanel,
  PmGetOrientedCard,
  PmReviewAiBuiltPanel,
  PmTeamRosterPanel,
} from "@/components/delivery-pm/pm-day-one-panels";
import { PmMissionPanelSwitch } from "@/components/delivery-pm/pm-mission-panel-switch";
import {
  DeliveryPmAiSummary as SteadyStateAiSummary,
  PmGovernanceTabsPanel,
  PmNeedsAttentionPanel,
  PmSteadyStateKpiStrip,
  PmSteadyStateLayout,
  PmSteadyStateMilestonesPanel,
  PmTeamCapacityPanel,
} from "@/components/delivery-pm/pm-steady-state-panels";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";
import {
  listPendingArtifactReviews,
  listPendingArtifactReviewsForPersona,
} from "@/services/artifactReviews";
import { listPendingInvitations } from "@/services/invitations";
import { listOrgMembers, listOrgTasks } from "@/services/delivery";
import { getOrgGovernanceStats, listOrgChangeRequests } from "@/services/governance";
import { getProjectBootstrapStatus } from "@/services/projectBootstrap";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { hasBootstrapParitySummary } from "@/lib/bootstrap-checklist";
import { groupPendingReviewsByCategory } from "@/lib/pm-day-one-panels";
import { PM_DAY_ONE_SUBTITLE, resolvePmDashboardMode } from "@/lib/pm-dashboard-mode";
import {
  buildPmAttentionFeed,
  buildPmGovernanceTabCounts,
  buildPmSteadyStateSubtitle,
  buildPmTeamCapacityRows,
  countWaitingOnPm,
} from "@/lib/pm-steady-state-panels";
import { PmMissionHeaderActions } from "@/components/delivery-pm/pm-mission-header-actions";
import { PmMissionShell } from "@/components/delivery-pm/pm-mission-shell";
import { PmProjectChip } from "@/components/delivery-pm/pm-project-chip";
import {
  filterPendingReviewsForPersona,
  filterReviewsByProject,
  PERSONA_REVIEW_LABELS,
} from "@/lib/approval/persona-reviews";
import { NextUpStrip } from "@/components/dx/next-up-strip";
import { buildMissionNextUpItems } from "@/lib/mission-next-up";

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
  const [data, pendingReviews, pendingInvites, orgMembers, governanceStats, orgChanges] =
    await Promise.all([
      getPmMissionControl(params.project),
      listPendingArtifactReviewsForPersona("pm-mission").catch(() => []),
      listPendingInvitations().catch(() => []),
      listOrgMembers().catch(() => []),
      getOrgGovernanceStats().catch(() => ({ openChanges: 0, pendingDecisions: 0, openRisks: 0, openIssues: 0 })),
      listOrgChangeRequests({ status: ["draft", "submitted"], limit: 20 }).catch(() => []),
    ]);

  const projectId = data.primaryProject?.id;
  const projectTasks = projectId
    ? await listOrgTasks({ projectId, limit: 200 }).catch(() => [])
    : [];
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

  const projectChanges = projectId
    ? orgChanges.filter((change) => change.project_id === projectId)
    : orgChanges;
  const attentionFeed = buildPmAttentionFeed({
    stakeholderActionQueue: data.stakeholderActionQueue,
    decisions: data.decisions,
    blockedDependencies: data.overview.blockedDependencies,
    projectId,
  });
  const waitingOnYouCount = countWaitingOnPm(attentionFeed);
  const { members: capacityMembers, avgLoadPct } = buildPmTeamCapacityRows({
    tasks: projectTasks,
    members: orgMembers,
  });
  const governanceTabCounts = buildPmGovernanceTabCounts({
    raid: data.raid,
    openDecisions: data.overview.openDecisions,
    openChanges: projectChanges.length || governanceStats.openChanges,
    pendingReviews: projectPendingReviews,
  });
  const steadyStateSubtitle = buildPmSteadyStateSubtitle({
    projectName: data.primaryProject?.name,
    waitingOnYouCount,
    blockerCount: data.overview.blockedDependencies,
    openDecisions: data.overview.openDecisions,
  });

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

  const dayOnePanels = (
    <>
      <PmDayOneKpiStrip
        pendingReviewCount={projectPendingReviews.length}
        bootstrapSummary={bootstrapSummary}
        data={data}
        teamJoinedCount={teamJoinedCount}
        teamTotalCount={teamTotalCount}
      />
      <DeliveryPmAiSummary summary={data.aiSummary} projectId={data.primaryProject?.id} compact={projectPendingReviews.length > 0} />
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
    <PmSteadyStateLayout
      kpiStrip={
        <PmSteadyStateKpiStrip
          data={data}
          waitingOnYouCount={waitingOnYouCount}
          teamCapacityPct={avgLoadPct}
        />
      }
      aiSummary={
        <SteadyStateAiSummary summary={data.aiSummary} projectId={data.primaryProject?.id} compact />
      }
      leftColumn={
        <>
          <PmNeedsAttentionPanel
            stakeholderActionQueue={data.stakeholderActionQueue}
            data={data}
          />
          <PmGovernanceTabsPanel
            raid={data.raid}
            decisions={data.decisions}
            changes={projectChanges.map((change) => ({
              id: change.id,
              title: change.title,
              status: change.status,
              impact: change.impact,
            }))}
            pendingReviews={projectPendingReviews}
            tabCounts={governanceTabCounts}
            projectId={projectId}
          />
        </>
      }
      rightColumn={
        <>
          <PmSteadyStateMilestonesPanel
            milestones={data.milestones}
            goLiveProbability={data.overview.goLiveProbability}
            usesFallback={data.dataSources.deliveryPlan === "fallback"}
          />
          <PmTeamCapacityPanel
            members={capacityMembers}
            usesPlaceholder={avgLoadPct == null}
          />
          <DeliveryPmGuidedTasks tasks={data.guidedTasks} />
        </>
      }
    />
  );

  return (
    <MissionDashboardChrome
      personaId="pm-mission"
      header={{
        userName: data.userName,
        primaryProject: data.primaryProject,
        subtitle: serverPmMode === "day-one" ? PM_DAY_ONE_SUBTITLE : steadyStateSubtitle,
      }}
      headerActions={
        <PmMissionHeaderActions
          projectId={projectId}
          hasBootstrapSummary={hasBootstrapSummary}
          pendingReviewCount={pendingReviews.length}
          teamInvitesPending={teamInvitesPending}
        />
      }
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
          <NextUpStrip items={nextUpItems} personaLabel={PERSONA_REVIEW_LABELS["pm-mission"]} personaId="pm-mission" />
          {data.primaryProject ? (
            <PmProjectChip
              projects={data.projects.map((project) => ({ id: project.id, name: project.name }))}
              selectedProjectId={data.primaryProject.id}
            />
          ) : null}
          <PmMissionPanelSwitch dayOne={dayOnePanels} steadyState={steadyStatePanels} />
        </div>
      </PmMissionShell>
    </MissionDashboardChrome>
  );
}
