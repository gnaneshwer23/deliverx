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
  PmReviewAiBuiltPanel,
  PmTeamRosterPanel,
} from "@/components/delivery-pm/pm-day-one-panels";
import { PmMissionPanelSwitch } from "@/components/delivery-pm/pm-mission-panel-switch";
import {
  PmControlRoomKpiStrip,
  PmControlRoomLayout,
  PmGovernanceTabsPanel,
  PmSteadyStateMilestonesPanel,
  PmTeamCapacityPanel,
} from "@/components/delivery-pm/pm-steady-state-panels";
import { PmTeamNeedsFeed } from "@/components/delivery-pm/pm-team-needs-feed";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";
import {
  listPendingArtifactReviews,
  listPendingArtifactReviewsForPersona,
} from "@/services/artifactReviews";
import { listPendingInvitations } from "@/services/invitations";
import { listOrgMembers, listOrgTasks } from "@/services/delivery";
import { loadProjectSprintMetrics } from "@/services/sprintData";
import { getOrgGovernanceStats, listOrgChangeRequests } from "@/services/governance";
import { getProjectBootstrapStatus } from "@/services/projectBootstrap";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { hasBootstrapParitySummary } from "@/lib/bootstrap-checklist";
import { groupPendingReviewsByCategory } from "@/lib/pm-day-one-panels";
import { PM_DAY_ONE_SUBTITLE, resolvePmDashboardMode } from "@/lib/pm-dashboard-mode";
import {
  buildPmBlockingYouSynthesis,
  countCriticalRaidItems,
  countOverdueTasks,
} from "@/lib/pm-control-room-kpis";
import {
  buildPmGovernanceTabCounts,
  buildPmSteadyStateSubtitle,
  buildPmTeamCapacityRows,
} from "@/lib/pm-steady-state-panels";
import { buildPmTeamNeedsFeed } from "@/lib/pm-team-needs-feed";
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
import {
  impactEventsToNextUpItems,
  mergeImpactIntoMissionNextUp,
} from "@/lib/mission-impact-next-up";
import { listProjectImpactEvents } from "@/services/deliveryImpact";
import { getCollaborativeLoopSnapshot } from "@/services/collaborativeLoop";
import { listPendingMeetingProposals } from "@/services/proposedActions";
import { getProjectBusinessCaseStatus } from "@/services/projectBusinessCaseFlow";
import { getCurrentOrganisationProfile } from "@/services/organisationProfile";
import { getWorkspaceFlowSnapshot } from "@/services/workspaceFlowSnapshot";
import { buildPmInviteRoleRows, shouldElevatePmInviteSection, summarizePmInviteRoleRows } from "@/lib/workspace-flow-invites";
import { getRequirementStats } from "@/services/baRequirements";
import { PmBusinessCaseFlowPanel } from "@/components/delivery-pm/pm-business-case-flow-panel";
import { PmBusinessCaseSummaryCard } from "@/components/workspace-flow/pm-business-case-summary-card";
import { PmRoleInviteSection } from "@/components/workspace-flow/pm-role-invite-section";
import { PmBaHandoffBanner } from "@/components/workspace-flow/pm-ba-handoff-banner";
import { PmFirstLoginStageBarSlot } from "@/components/workspace-flow/pm-first-login-stage-bar-slot";
import { resolveWorkspaceFlowStageFromSnapshot } from "@/lib/workspace-flow-stage-from-snapshot";
import { MeetingIntelReviewPanel } from "@/components/meetings/meeting-intel-review-panel";
import { MissionHelmCopilotSlot } from "@/components/copilot/mission-helm-copilot-slot";
import { dxClass } from "@/lib/dx-theme";
import { isMeetingReviewDeepLink, pmMeetingReviewUrl } from "@/lib/meeting-flow";

export const dynamic = "force-dynamic";

export default async function PmMissionControlPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; meeting?: string; meetingId?: string; onboard?: string }>;
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
  const onboardMode = params.onboard === "1";
  const [data, pendingReviews, pendingInvites, orgMembers, governanceStats, orgChanges, collaborativeLoop, orgProfile] =
    await Promise.all([
      getPmMissionControl(params.project),
      listPendingArtifactReviewsForPersona("pm-mission").catch(() => []),
      listPendingInvitations().catch(() => []),
      listOrgMembers().catch(() => []),
      getOrgGovernanceStats().catch(() => ({ openChanges: 0, pendingDecisions: 0, openRisks: 0, openIssues: 0 })),
      listOrgChangeRequests({ status: ["draft", "submitted"], limit: 20 }).catch(() => []),
      getCollaborativeLoopSnapshot("pm", params.project).catch(() => null),
      getCurrentOrganisationProfile().catch(() => ({ industry: null, deliveryType: null })),
    ]);

  const projectId = data.primaryProject?.id;

  if (isMeetingReviewDeepLink(params.meeting) && projectId) {
    const meetingId =
      params.meetingId ??
      (await listPendingMeetingProposals(projectId, 1).catch(() => []))[0]?.source_id ??
      undefined;
    if (meetingId) {
      redirect(pmMeetingReviewUrl(projectId, meetingId));
    }
  }

  const projectTasks = projectId
    ? await listOrgTasks({ projectId, limit: 200 }).catch(() => [])
    : [];
  const sprintMetrics = projectId
    ? await loadProjectSprintMetrics(projectId).catch(() => null)
    : null;
  let bootstrapSummary: ProjectBootstrapSummary | null = null;
  let hasBootstrapSummary = false;
  let businessCaseStatus = null;
  let flowSnapshot = null;
  let inviteRoleRows = null;
  let requirementStats = null;
  let meetingProposals: Awaited<ReturnType<typeof listPendingMeetingProposals>> = [];
  let pmImpactEvents: Awaited<ReturnType<typeof listProjectImpactEvents>> = [];

  if (projectId) {
    const bootstrap = await getProjectBootstrapStatus(projectId).catch(() => null);
    if (bootstrap && hasBootstrapParitySummary(bootstrap.summary)) {
      bootstrapSummary = bootstrap.summary;
      hasBootstrapSummary = true;
    }
    [businessCaseStatus, flowSnapshot, inviteRoleRows, requirementStats, meetingProposals, pmImpactEvents] =
      await Promise.all([
      getProjectBusinessCaseStatus(projectId).catch(() => null),
      getWorkspaceFlowSnapshot(projectId).catch(() => null),
      buildPmInviteRoleRows(projectId).catch(() => null),
      getRequirementStats(projectId).catch(() => null),
      listPendingMeetingProposals(projectId, 8).catch(() => []),
      listProjectImpactEvents(projectId, 12).catch(() => []),
    ]);
  }

  const allPmReviews = filterPendingReviewsForPersona(
    await listPendingArtifactReviews(50).catch(() => []),
    "pm-mission",
  );
  const projectPendingReviews = filterReviewsByProject(allPmReviews, projectId);
  const reviewGroups = groupPendingReviewsByCategory(projectPendingReviews);

  const teamInvitesPending = pendingInvites.length;
  const inviteSummary = inviteRoleRows ? summarizePmInviteRoleRows(inviteRoleRows) : null;
  const elevateInviteSection = shouldElevatePmInviteSection(inviteRoleRows, teamInvitesPending);
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
  const teamNeedsFeed = buildPmTeamNeedsFeed({
    stakeholderActionQueue: data.stakeholderActionQueue,
    teamNeeds: collaborativeLoop?.teamNeeds ?? [],
    decisions: data.decisions,
    blockedDependencies: data.overview.blockedDependencies,
    projectId,
  });
  const { members: capacityMembers, avgLoadPct } = buildPmTeamCapacityRows({
    tasks: projectTasks,
    members: orgMembers,
    sprintScope: sprintMetrics?.scope ?? null,
  });
  const governanceTabCounts = buildPmGovernanceTabCounts({
    raid: data.raid,
    openDecisions: data.overview.openDecisions,
    openChanges: projectChanges.length || governanceStats.openChanges,
    pendingReviews: projectPendingReviews,
  });
  const steadyStateSubtitle = buildPmSteadyStateSubtitle({
    projectName: data.primaryProject?.name,
    waitingOnYouCount: teamNeedsFeed.length,
    blockerCount: data.overview.blockedDependencies,
    openDecisions: data.overview.openDecisions,
  });
  const blockingYouSummary = buildPmBlockingYouSynthesis({
    projectName: data.primaryProject?.name,
    blockedCount: data.overview.blockedDependencies,
    overdueCount: countOverdueTasks(projectTasks),
    pendingApprovals: projectPendingReviews.length,
    criticalRaidCount: countCriticalRaidItems(data.raid),
    teamNeedsCount: teamNeedsFeed.length,
    fallbackSummary: data.aiSummary,
  });

  const nextUpItems = mergeImpactIntoMissionNextUp(
    buildMissionNextUpItems({
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
      pendingRoleInvites: inviteSummary?.unjoinedCount
        ? {
            count: inviteSummary.unjoinedCount,
            needsLinkCount: inviteSummary.needsLinkCount,
          }
        : undefined,
    }),
    impactEventsToNextUpItems(pmImpactEvents, "pm-mission", projectId),
  );

  const aiSummaryLine = (
    <DeliveryPmAiSummary
      summary={blockingYouSummary}
      projectId={projectId}
      compact
      title="What's blocking you today"
    />
  );

  const milestoneRaidRow = (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {serverPmMode === "day-one" ? (
        <PmDayOneMilestonesPanel
          milestones={data.milestones}
          usesFallback={data.dataSources.deliveryPlan === "fallback"}
        />
      ) : (
        <PmSteadyStateMilestonesPanel
          milestones={data.milestones}
          goLiveProbability={data.overview.goLiveProbability}
          usesFallback={data.dataSources.deliveryPlan === "fallback"}
        />
      )}
      <PmCompactRaidCard raid={data.raid} projectId={projectId} />
    </div>
  );

  const teamNeedsRow = <PmTeamNeedsFeed items={teamNeedsFeed} />;

  const dayOnePanels = (
    <PmControlRoomLayout
      aiSummary={aiSummaryLine}
      kpiStrip={
        <PmDayOneKpiStrip
          pendingReviewCount={projectPendingReviews.length}
          bootstrapSummary={bootstrapSummary}
          data={data}
          teamJoinedCount={teamJoinedCount}
          teamTotalCount={teamTotalCount}
          teamCapacityPct={avgLoadPct}
          tasks={projectTasks}
          projectId={projectId}
        />
      }
      milestoneRaidRow={milestoneRaidRow}
      teamNeedsFeed={teamNeedsRow}
      capacityGovernanceRow={
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PmTeamCapacityPanel members={capacityMembers} usesPlaceholder={avgLoadPct == null} />
          <PmReviewAiBuiltPanel
            groups={reviewGroups}
            projectId={projectId}
            pendingReviews={projectPendingReviews}
          />
        </div>
      }
    />
  );

  const steadyStatePanels = (
    <PmControlRoomLayout
      aiSummary={aiSummaryLine}
      kpiStrip={
        <PmControlRoomKpiStrip
          data={data}
          pendingApprovalCount={projectPendingReviews.length}
          teamCapacityPct={avgLoadPct}
          tasks={projectTasks}
          projectId={projectId}
        />
      }
      milestoneRaidRow={milestoneRaidRow}
      teamNeedsFeed={teamNeedsRow}
      capacityGovernanceRow={
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PmTeamCapacityPanel members={capacityMembers} usesPlaceholder={avgLoadPct == null} />
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
        </div>
      }
    />
  );

  const showFirstLoginStageBar =
    Boolean(projectId) && (onboardMode || serverPmMode === "day-one");
  const firstLoginStage = resolveWorkspaceFlowStageFromSnapshot(flowSnapshot, {
    requirementsExtracted: requirementStats?.extracted ?? 0,
    storiesReady: requirementStats?.storiesReady ?? 0,
  });

  const businessCaseFlowPanel =
    data.primaryProject && businessCaseStatus ? (
      <PmBusinessCaseFlowPanel
        projectId={data.primaryProject.id}
        projectName={data.primaryProject.name}
        initialStatus={businessCaseStatus}
        extractionCounts={flowSnapshot?.counts}
        requirementsExtracted={requirementStats?.extracted ?? 0}
        storiesReady={requirementStats?.storiesReady ?? 0}
        elevated={onboardMode}
        orgContext={{
          industry: orgProfile.industry,
          deliveryType: orgProfile.deliveryType,
        }}
        hideStageBar={showFirstLoginStageBar}
      />
    ) : null;

  return (
    <MissionDashboardChrome
      personaId="pm-mission"
      header={{
        userName: data.userName,
        primaryProject: data.primaryProject,
        subtitle: onboardMode
          ? "Upload brief → invite BA → review in AI Queue"
          : serverPmMode === "day-one"
            ? PM_DAY_ONE_SUBTITLE
            : steadyStateSubtitle,
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
        <div className={dxClass.workspaceContent}>
          {showFirstLoginStageBar && projectId ? (
            <PmFirstLoginStageBarSlot
              projectId={projectId}
              stage={firstLoginStage}
              onboardMode={onboardMode}
            />
          ) : null}
          {onboardMode && businessCaseFlowPanel ? (
            <div className="mb-4">{businessCaseFlowPanel}</div>
          ) : null}
          {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="PM" /> : null}
          {!onboardMode ? (
            <>
              <MissionBootstrapBanner
                personaId="pm-mission"
                projectId={data.primaryProject?.id}
                showFallback={data.dataSources.deliveryPlan === "fallback"}
              />
              <NextUpStrip
                items={nextUpItems}
                personaLabel={PERSONA_REVIEW_LABELS["pm-mission"]}
                personaId="pm-mission"
              />
            </>
          ) : null}
          {elevateInviteSection && inviteRoleRows && data.primaryProject ? (
            <div className="mb-4">
              <PmRoleInviteSection
                projectId={data.primaryProject.id}
                rows={inviteRoleRows}
                elevated
              />
            </div>
          ) : null}
          {projectId && meetingProposals.length > 0 ? (
            <div className="mb-4">
              <MeetingIntelReviewPanel projectId={projectId} proposals={meetingProposals} />
            </div>
          ) : null}
          {data.primaryProject ? (
            <PmProjectChip
              projects={data.projects.map((project) => ({ id: project.id, name: project.name }))}
              selectedProjectId={data.primaryProject.id}
            />
          ) : null}
          {data.primaryProject && businessCaseStatus && !onboardMode ? (
            <>
              <PmBaHandoffBanner
                projectId={data.primaryProject.id}
                status={businessCaseStatus}
              />
              {flowSnapshot ? (
                <PmBusinessCaseSummaryCard
                  projectId={data.primaryProject.id}
                  projectName={data.primaryProject.name}
                  status={businessCaseStatus}
                  counts={flowSnapshot.counts}
                  aiSummary={flowSnapshot.aiSummary}
                />
              ) : null}
              {businessCaseFlowPanel}
              {inviteRoleRows && !elevateInviteSection ? (
                <PmRoleInviteSection projectId={data.primaryProject.id} rows={inviteRoleRows} />
              ) : null}
            </>
          ) : null}
          {!onboardMode ? (
            <>
              <PmMissionPanelSwitch dayOne={dayOnePanels} steadyState={steadyStatePanels} />
              {data.guidedTasks.length > 0 ? (
                <DeliveryPmGuidedTasks tasks={data.guidedTasks} />
              ) : null}
              {serverPmMode === "day-one" ? (
                <PmTeamRosterPanel
                  members={orgMembers}
                  pendingInvites={pendingInvites}
                  bootstrapSummary={bootstrapSummary}
                />
              ) : null}
            </>
          ) : null}
          <MissionHelmCopilotSlot personaId="pm-mission" projectId={projectId} />
        </div>
      </PmMissionShell>
    </MissionDashboardChrome>
  );
}
