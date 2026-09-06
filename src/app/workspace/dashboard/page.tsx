import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
} from "lucide-react";
import {
  EMPTY_WORKSPACE_DASHBOARD,
  getWorkspaceDashboard,
} from "@/services/dashboard";
import { getOrgAlertQueue } from "@/services/alerts";
import { getDeliveryCoachSuggestions } from "@/services/deliveryCoach";
import { listProjectForecasts } from "@/services/deliveryForecast";
import { getProjectSuccessScore } from "@/services/successScore";
import { getProjectIntelligence } from "@/services/intelligence";
import { getProjectAlignment } from "@/services/alignment";
import { AlignmentSummaryCard } from "@/components/alignment/alignment-summary-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { QuickActionsBar } from "@/components/dashboard/quick-actions-bar";
import { DeliveryVelocityChart } from "@/components/dashboard/delivery-velocity-chart";
import { ProjectHealthGrid } from "@/components/dashboard/project-health-grid";
import { GovernancePulse } from "@/components/dashboard/governance-pulse";
import { CommandCentreDashboardChrome } from "@/components/dashboard/command-centre-dashboard-chrome";
import { DashboardPanelShell } from "@/components/dx/dashboard-panel-shell";
import { StandupsFeed } from "@/components/dashboard/standups-feed";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AiInsights } from "./ai-insights";
import { AlertQueuePanel } from "@/components/dashboard/alert-queue-panel";
import { DeliveryCoachPanel } from "@/components/dashboard/delivery-coach-panel";
import { DeliveryForecastStrip } from "@/components/dashboard/delivery-forecast-strip";
import { ApprovalCentrePanel } from "@/components/approvals/approval-centre-panel";
import { CommandCentreImpactFeed } from "@/components/dashboard/command-centre-impact-feed";
import { MissionWorkspaceOverview } from "@/components/dashboard/mission-workspace-overview";
import { CommandCentreAgentFeed } from "@/components/dashboard/command-centre-agent-feed";
import { PmTeamNeedsFeed } from "@/components/delivery-pm/pm-team-needs-feed";
import { IntelligenceLoopPanel } from "@/components/intelligence/intelligence-loop-panel";
import { RunLoopButton } from "@/components/intelligence/run-loop-button";
import { listOrgImpactEvents } from "@/services/deliveryImpact";
import type { DeliveryImpactRole, ImpactFeedSeverity } from "@/services/deliveryImpactEngine";
import { listOrgProjects } from "@/services/delivery";
import { listAgentActivityFeed } from "@/services/agentOrchestration";
import { getCollaborativeLoopSnapshot } from "@/services/collaborativeLoop";
import { getIntelligenceLoopSnapshot } from "@/services/intelligenceLoop";
import { getPendingApprovalCounts } from "@/services/approvalCentre";
import { listPendingArtifactReviews, listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { PendingReviewsStrip } from "@/components/approvals/pending-reviews-strip";
import { roleToMissionPersona } from "@/lib/mission-nav";
import { PERSONA_REVIEW_LABELS } from "@/lib/approval/persona-reviews";
import { NextUpStrip } from "@/components/dx/next-up-strip";
import { buildCommandCentreNextUpItems } from "@/lib/command-centre-next-up";
import {
  buildCommandCentreAiSynthesisLine,
  buildCommandCentreKpis,
} from "@/lib/command-centre-kpis";
import { buildPmTeamNeedsFeed } from "@/lib/pm-team-needs-feed";
import { countImpactSignalsByPersona } from "@/lib/signal-deeplinks";
import { governanceTabHref } from "@/lib/governance-tabs";
import { getDbRoleDisplayLabel } from "@/config/mission-persona-meta";
import { listPendingProposals } from "@/services/proposedActions";
import { DxButtonLink } from "@/components/dx/dx-button";
import { DxBadge } from "@/components/dx/dx-badge";
import { runEnterpriseCoordinationLoop } from "@/services/coordination";
import { pickPmDeliveryPatternInsight } from "@/lib/delivery-patterns-insight";
import { DeliveryPatternsInsightCard } from "@/components/founder/founder-delivery-patterns-card";
import {
  DELIVERY_INSIGHTS_NAV_LABEL,
  DELIVERY_PATTERNS_HREF,
  DELIVERY_PATTERNS_NAV_LABEL,
} from "@/lib/intelligence-nav-labels";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    feedSeverity?: string;
    feedRole?: string;
    feedProject?: string;
  }>;
}) {
  const feedParams = await searchParams;
  const feedSeverity: ImpactFeedSeverity =
    feedParams.feedSeverity === "high" || feedParams.feedSeverity === "medium"
      ? feedParams.feedSeverity
      : "all";
  const feedRole = feedParams.feedRole as DeliveryImpactRole | undefined;
  const feedProject = feedParams.feedProject;

  const [data, alerts, coach] = await Promise.all([
    getWorkspaceDashboard().catch((err) => {
      console.error("[dashboard] getWorkspaceDashboard", err);
      return EMPTY_WORKSPACE_DASHBOARD;
    }),
    getOrgAlertQueue(6).catch(() => [] as Awaited<ReturnType<typeof getOrgAlertQueue>>),
    getDeliveryCoachSuggestions(4).catch(
      () => [] as Awaited<ReturnType<typeof getDeliveryCoachSuggestions>>,
    ),
  ]);
  const activeTaskRows = data.recentTasks.filter((t) => t.status !== "done");

  const topProject = data.projectHealth[0] ?? data.recentProjects[0] ?? null;
  const insightProjectName: string | null = topProject?.name ?? null;
  let healthTier: "healthy" | "watch" | "at-risk" = topProject?.healthTier ?? "healthy";
  let confidenceScore = topProject?.confidenceScore ?? 100;
  let successScoreValue: number | null = null;
  let recommendation =
    "Add tasks and governance items to projects to generate delivery signals.";
  let topAlignment: Awaited<ReturnType<typeof getProjectAlignment>> | null = null;

  if (topProject) {
    try {
      const [intel, alignment, successScore] = await Promise.all([
        getProjectIntelligence(topProject.id),
        getProjectAlignment(topProject.id),
        getProjectSuccessScore(topProject.id).catch(() => null),
      ]);
      topAlignment = alignment;
      recommendation = intel.recommendations[0]?.text ?? recommendation;
      healthTier = intel.health.tier;
      confidenceScore = intel.confidence.score;
      successScoreValue = successScore?.score ?? null;
    } catch (err) {
      console.error("[dashboard] project intelligence", err);
    }
  }

  const persona = roleToMissionPersona(data.userRole);

  const [pendingProposals, pendingArtifactReviews, personaPendingReviews, approvalCounts, impactEvents, overviewImpactEvents, agentEvents, intelligenceLoop, feedProjects, collaborativeLoop] =
    await Promise.all([
    listPendingProposals(3).catch(() => []),
    listPendingArtifactReviews(3).catch(() => []),
    persona ? listPendingArtifactReviewsForPersona(persona).catch(() => []) : Promise.resolve([]),
    getPendingApprovalCounts().catch(() => ({ proposals: 0, artifacts: 0, total: 0 })),
    listOrgImpactEvents({
      limit: 12,
      severity: feedSeverity,
      targetRole: feedRole,
      projectId: feedProject,
    }).catch(() => []),
    listOrgImpactEvents({ limit: 40, projectId: feedProject }).catch(() => []),
    listAgentActivityFeed(12).catch(() => []),
    getIntelligenceLoopSnapshot().catch(() => null),
    listOrgProjects().catch(() => []),
    getCollaborativeLoopSnapshot("pm", feedProject ?? topProject?.id).catch(() => null),
  ]);

  const velocityTrend =
    data.weeklyVelocity.length >= 2
      ? data.weeklyVelocity[data.weeklyVelocity.length - 1].completed -
        data.weeklyVelocity[data.weeklyVelocity.length - 2].completed
      : null;
  const alignmentDelta = topAlignment?.latest?.delta ?? null;

  const blockedTaskRow = activeTaskRows.find((task) => task.status === "blocked");
  const nextUpItems = buildCommandCentreNextUpItems({
    userRole: data.userRole,
    persona,
    primaryProject: topProject ? { id: topProject.id, name: topProject.name } : null,
    hasProjects: data.recentProjects.length > 0,
    pendingReviews: personaPendingReviews,
    approvalTotal: approvalCounts.total,
    overdueTasks: data.delivery.overdueTasks,
    blockedTasks: data.delivery.blockedTasks,
    blockedTaskTitle: blockedTaskRow?.title,
  });
  const nextUpPersonaLabel = persona
    ? PERSONA_REVIEW_LABELS[persona]
    : getDbRoleDisplayLabel(data.userRole);

  const kpis = buildCommandCentreKpis({
    userRole: data.userRole,
    activeProjectCount: data.activeProjectCount,
    portfolioHealth: data.portfolioHealth,
    successScoreValue,
    alignmentDelta,
    topProjectId: topProject?.id ?? null,
    delivery: data.delivery,
    approvalCounts,
    velocityTrend,
    governanceOpenRisks: data.governance.openRisks,
  });

  const aiSynthesisLine = buildCommandCentreAiSynthesisLine({
    userRole: data.userRole,
    hasProjects: data.recentProjects.length > 0,
    blockedTasks: data.delivery.blockedTasks,
    overdueTasks: data.delivery.overdueTasks,
    openRisks: data.governance.openRisks,
    pendingApprovals: approvalCounts.total,
    projectName: insightProjectName,
  });

  const atRiskProjects = data.governanceRollup.filter(
    (r) => r.open_risks > 0 || r.open_issues > 0 || r.pending_decisions > 0,
  );

  const forecastRollup = await listProjectForecasts(
    data.projectHealth.map((p) => ({
      id: p.id,
      name: p.name,
      healthTier: p.healthTier,
    })),
    3,
  ).catch(() => []);

  const teamNeedsFeed = collaborativeLoop
    ? buildPmTeamNeedsFeed({
        stakeholderActionQueue: [],
        teamNeeds: collaborativeLoop.teamNeeds,
        decisions: [],
        blockedDependencies: data.delivery.blockedTasks,
        projectId: feedProject ?? topProject?.id ?? undefined,
      })
    : [];

  const coordinationSnapshot = await runEnterpriseCoordinationLoop().catch(() => null);
  const deliveryPatternInsight = pickPmDeliveryPatternInsight(coordinationSnapshot);
  const missionSignalCounts = countImpactSignalsByPersona(overviewImpactEvents);

  return (
    <CommandCentreDashboardChrome
      header={{
        userRole: data.userRole,
        userName: data.userName,
        orgName: data.orgName,
        titleEm:
          data.governance.openRisks + data.delivery.blockedTasks > 0
            ? `${data.governance.openRisks + data.delivery.blockedTasks} signals need attention.`
            : undefined,
        action: (
          <div className="flex flex-wrap items-center gap-2">
            <DxBadge tone="green" dot>
              Operational
            </DxBadge>
            <DxButtonLink href="/project/new" variant="primarySm">
              New project
            </DxButtonLink>
          </div>
        ),
      }}
    >
      <div className="p-6 md:p-8">

      <div className="mb-6">
        <NextUpStrip items={nextUpItems} personaLabel={nextUpPersonaLabel} />
      </div>

      <div className="mb-6">
        <QuickActionsBar role={data.userRole} />
      </div>

      <DashboardPanelShell
        panelId="mission-workspaces"
        title="Role workspaces"
        subtitle="Jump to role views with live signal counts"
        className="mb-6"
        card
      >
        <MissionWorkspaceOverview
          signalCounts={missionSignalCounts}
          projectId={feedProject ?? topProject?.id}
        />
      </DashboardPanelShell>

      {persona && personaPendingReviews.length > 0 ? (
        <div className="mb-6">
          <PendingReviewsStrip
            reviews={personaPendingReviews}
            personaLabel={PERSONA_REVIEW_LABELS[persona]}
            persona={persona}
            inlineActions
          />
        </div>
      ) : null}

      <div className="mb-6">
        <KpiStrip items={kpis} />
      </div>

      <DashboardPanelShell
        panelId="project-health"
        title="Project health"
        href="/workspace/projects"
        className="mb-6"
        card
      >
        <ProjectHealthGrid projects={data.projectHealth} />
      </DashboardPanelShell>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <DashboardPanelShell panelId="active-tasks" title="Active tasks" subtitle="Open work across projects" count={activeTaskRows.length} href="/workspace/tasks" className="xl:col-span-2" card>
          {activeTaskRows.length === 0 ? (
            <p className="text-sm text-[#6b7280]">
              No open tasks.{" "}
              <Link href="/project/new" className="text-[#0a0e14] underline decoration-[#6ee7c7]/60 hover:decoration-[#6ee7c7]">
                Create a project
              </Link>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-slate-500">
                    <TableHead>Task</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeTaskRows.slice(0, 8).map((task) => (
                    <TableRow key={task.id} className="border-t border-slate-100">
                      <TableCell>
                        <Link
                          href={`/project/${task.project_id}/tasks/${task.id}`}
                          className="font-medium text-[#0a0e14] underline decoration-[#6ee7c7]/40 hover:decoration-[#6ee7c7]"
                        >
                          {task.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{task.project_name}</TableCell>
                      <TableCell>
                        <StatusBadge status={task.status} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={task.priority} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DashboardPanelShell>

        <DashboardPanelShell panelId="pending-decisions" title="Pending decisions" count={data.pendingDecisions.length} countTone={data.pendingDecisions.length > 0 ? "urgent" : "neutral"} href={governanceTabHref("decisions")} card>
          {data.pendingDecisions.length === 0 ? (
            <p className="text-sm text-slate-500">No decisions awaiting approval.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {data.pendingDecisions.map((d) => (
                <li key={d.id} className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
                  <Link
                    href={`/project/${d.project_id}/decisions`}
                    className="font-medium text-indigo-900 hover:underline"
                  >
                    {d.title}
                  </Link>
                  <span className="mt-0.5 block text-xs text-indigo-600/70">{d.project_name}</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanelShell>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashboardPanelShell panelId="alert-queue" title="AI alert queue" count={alerts.length} countTone={alerts.length > 0 ? "urgent" : "neutral"} href="/workspace/alerts" card>
          <AlertQueuePanel alerts={alerts} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="delivery-coach" title="Delivery coach" href="/workspace/alerts" card>
          <DeliveryCoachPanel suggestions={coach} />
        </DashboardPanelShell>
      </div>

      {approvalCounts.total > 0 ? (
        <div className="mb-6">
          <DashboardPanelShell panelId="ai-output-review" title="AI output review" href="/workspace/proposals" card>
            <ApprovalCentrePanel
              artifactReviews={pendingArtifactReviews}
              proposals={pendingProposals}
            />
          </DashboardPanelShell>
        </div>
      ) : null}

      <DashboardPanelShell panelId="recent-projects" title="Recent projects" className="mb-6" card>
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/workspace/projects"
            className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.1em] text-[#4b5563] hover:text-[#0a0e14]"
          >
            All projects <ArrowUpRight size={14} />
          </Link>
        </div>
        {data.recentProjects.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {data.recentProjects.map((p) => {
              const health = data.projectHealth.find((h) => h.id === p.id);
              return (
                <li key={p.id}>
                  <Link
                    href={`/project/${p.id}`}
                    className="flex items-center justify-between gap-4 py-3 transition hover:bg-slate-50"
                  >
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-slate-500">
                        {p.delivery_type ?? "—"} ·{" "}
                        {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {health ? (
                        <span
                          className={`text-sm font-semibold ${
                            health.healthScore >= 80
                              ? "text-emerald-600"
                              : health.healthScore >= 60
                                ? "text-amber-600"
                                : "text-rose-600"
                          }`}
                        >
                          {health.healthScore}
                        </span>
                      ) : null}
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-600">
                        {p.status}
                      </span>
                      <ArrowUpRight size={14} className="text-slate-400" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No projects yet.{" "}
            <Link href="/project/new" className="font-medium text-[#0a0e14] underline decoration-[#6ee7c7]/60">
              Create your first project
            </Link>
          </div>
        )}
      </DashboardPanelShell>

      {intelligenceLoop ? (
        <div className="mb-6">
          <DashboardPanelShell panelId="intelligence-loop" title={DELIVERY_INSIGHTS_NAV_LABEL} card>
            <IntelligenceLoopPanel snapshot={intelligenceLoop} embedded />
          </DashboardPanelShell>
        </div>
      ) : null}

      {collaborativeLoop ? (
        <div className="mb-6">
          <PmTeamNeedsFeed items={teamNeedsFeed} />
        </div>
      ) : null}

      <div className="mb-6">
        <DeliveryPatternsInsightCard insight={deliveryPatternInsight} />
      </div>

      <div className="mb-6">
        <DashboardPanelShell panelId="delivery-forecasts" title="Delivery forecasts" href="/workspace/pmo" card>
          <DeliveryForecastStrip entries={forecastRollup} />
        </DashboardPanelShell>
      </div>

      <div className="mb-6">
        <DashboardPanelShell
          panelId="command-centre-intelligence"
          title="Workspace intelligence"
          href="/workspace/proposals"
          card
        >
          <Suspense fallback={<p className="text-sm text-[#6B6B64]">Loading feed…</p>}>
            <CommandCentreImpactFeed
              events={impactEvents}
              severity={feedSeverity}
              role={feedRole}
              projectId={feedProject}
              projects={feedProjects}
            />
          </Suspense>
        </DashboardPanelShell>
      </div>

      <div className="mb-6">
        <DashboardPanelShell
          panelId="agent-orchestration"
          title={DELIVERY_PATTERNS_NAV_LABEL}
          href={DELIVERY_PATTERNS_HREF}
          card
        >
          <div className="mb-4">
            <RunLoopButton
              postUrl="/api/agents/sweep"
              label="Run agent sweep"
              successMessage="Agent sweep complete — refreshing…"
            />
          </div>
          <CommandCentreAgentFeed events={agentEvents} />
        </DashboardPanelShell>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <DashboardPanelShell panelId="delivery-velocity" title="Delivery velocity" className="xl:col-span-2" card>
          <DeliveryVelocityChart weeks={data.weeklyVelocity} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="governance-pulse" title="Governance pulse" href="/workspace/governance" card>
          <GovernancePulse stats={data.governance} />
        </DashboardPanelShell>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <DashboardPanelShell panelId="risk-register" title="Risk register" count={data.openRisks.length} countTone={data.openRisks.length > 0 ? "urgent" : "neutral"} href={governanceTabHref("risks")} card>
          {data.openRisks.length === 0 ? (
            <p className="text-sm text-slate-500">No open risks logged.</p>
          ) : (
            <div className="space-y-2">
              {data.openRisks.map((risk) => (
                <Link
                  key={risk.id}
                  href={`/project/${risk.project_id}/raid?type=risk`}
                  className={`block rounded-lg p-3 text-sm ${
                    risk.severity === "critical" || risk.severity === "high"
                      ? "bg-red-50 text-red-800"
                      : "bg-amber-50 text-amber-800"
                  }`}
                >
                  {risk.title}
                  <span className="mt-0.5 block text-xs opacity-75">{risk.project_name}</span>
                </Link>
              ))}
            </div>
          )}
        </DashboardPanelShell>

        <DashboardPanelShell panelId="recent-meetings" title="Recent meetings" href="/workspace/meetings" card>
          {data.recentMeetings.length === 0 ? (
            <p className="text-sm text-slate-500">
              No meetings yet. Log one from a project&apos;s Meetings page.
            </p>
          ) : (
            <ul className="space-y-3 text-sm">
              {data.recentMeetings.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/project/${m.project_id}/meetings`}
                    className="font-medium text-[#0F766E] hover:underline"
                  >
                    {m.title}
                  </Link>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                    <CalendarClock size={11} />
                    {m.project_name}
                    {m.scheduled_at
                      ? ` · ${new Date(m.scheduled_at).toLocaleDateString()}`
                      : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanelShell>

        <DashboardPanelShell panelId="standups" title="Standups this week" href="/workspace/meetings" card>
          <StandupsFeed standups={data.recentStandups} />
        </DashboardPanelShell>

        <DashboardPanelShell panelId="latest-reports" title="Latest reports" href="/workspace/reports" card>
          {data.recentReports.length === 0 ? (
            <p className="text-sm text-slate-500">No status reports generated yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {data.recentReports.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/project/${r.project_id}/reports/${r.id}`}
                    className="font-medium text-[#0F766E] hover:underline"
                  >
                    {r.title}
                  </Link>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    {r.project_name} · {new Date(r.generated_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanelShell>
      </div>

      {atRiskProjects.length > 0 ? (
        <DashboardPanelShell
          panelId="governance-by-project"
          title="Governance by project"
          href="/workspace/governance"
          className="mb-6"
          card
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-slate-500">
                  <TableHead>Project</TableHead>
                  <TableHead>Open risks</TableHead>
                  <TableHead>Open issues</TableHead>
                  <TableHead>Pending decisions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atRiskProjects.slice(0, 8).map((row) => (
                  <TableRow key={row.project_id} className="border-t border-slate-100">
                    <TableCell>
                      <Link
                        href={`/project/${row.project_id}`}
                        className="font-medium text-[#0F766E] hover:underline"
                      >
                        {row.project_name}
                      </Link>
                    </TableCell>
                    <TableCell>{row.open_risks}</TableCell>
                    <TableCell>{row.open_issues}</TableCell>
                    <TableCell>{row.pending_decisions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DashboardPanelShell>
      ) : null}

      {topProject && topAlignment ? (
        <div className="mb-6">
          <AlignmentSummaryCard
            projectId={topProject.id}
            projectName={topProject.name}
            score={topAlignment.score}
            tier={topAlignment.tier}
            trend={topAlignment.trend}
            delta={topAlignment.latest?.delta ?? null}
            hasCharter={Boolean(topAlignment.charter?.content?.trim())}
          />
        </div>
      ) : null}

      <AiInsights
        projectId={topProject?.id ?? null}
        projectName={insightProjectName}
        userRole={data.userRole}
        healthTier={healthTier}
        confidenceScore={confidenceScore}
        synthesisLine={aiSynthesisLine}
        ruleBasedSignal={recommendation}
      />
      </div>
    </CommandCentreDashboardChrome>
  );
}
