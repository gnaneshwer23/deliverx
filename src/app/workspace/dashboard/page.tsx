import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Ban,
  CalendarClock,
  CheckSquare,
  Clock,
  Layers,
  Scale,
  ShieldAlert,
  Users,
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
import { DashboardSection } from "@/components/dashboard/dashboard-section";
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
import { getPendingApprovalCounts } from "@/services/approvalCentre";
import { listPendingArtifactReviews } from "@/services/artifactReviews";
import { listPendingProposals } from "@/services/proposedActions";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { DxButtonLink } from "@/components/dx/dx-button";
import { DxBadge } from "@/components/dx/dx-badge";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

function roleHeading(role: string, name: string | null) {
  const greeting = name ? `, ${name}` : "";
  if (role === "executive") return `Founder overview${greeting}`;
  if (role === "engineer") return `Engineering workspace${greeting}`;
  if (role === "scrum_master") return `Scrum workspace${greeting}`;
  if (role === "qa") return `QA workspace${greeting}`;
  if (role === "team_member") return `My workspace${greeting}`;
  if (role === "ba") return `BA workspace${greeting}`;
  if (role === "product_manager") return `Product workspace${greeting}`;
  if (role === "pm") return `PM workspace${greeting}`;
  return `Delivery command centre${greeting}`;
}

function roleSubtitle(role: string, orgName: string | null) {
  const org = orgName ? `${orgName} · ` : "";
  if (role === "executive") {
    return `${org}Runway, portfolio health, decisions, and investor readiness — open Founder Mission Control.`;
  }
  if (role === "engineer") {
    return `${org}Stories, traceability, and guided build tasks — open Engineer Mission Control.`;
  }
  if (role === "scrum_master") {
    return `${org}Sprint health, impediments, and ceremonies — open Scrum Mission Control.`;
  }
  if (role === "qa") {
    return `${org}Test coverage, defects, and release readiness — open QA Mission Control.`;
  }
  if (role === "team_member") {
    return `${org}Your tasks, standups, and project updates in one place.`;
  }
  if (role === "ba") {
    return `${org}Requirements, clarifications, and traceability — open BA Mission Control for guided tasks.`;
  }
  if (role === "product_manager") {
    return `${org}Roadmap, customer discovery, and RICE prioritisation — open Product Mission Control.`;
  }
  if (role === "pm") {
    return `${org}Governance, RAID, milestones, and guided delivery — open PM Mission Control.`;
  }
  return `${org}Tasks, RAID, meetings, decisions, standups, and intelligence — unified.`;
}

export default async function DashboardPage() {
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

  const [pendingProposals, pendingArtifactReviews, approvalCounts] = await Promise.all([
    listPendingProposals(3).catch(() => []),
    listPendingArtifactReviews(3).catch(() => []),
    getPendingApprovalCounts().catch(() => ({ proposals: 0, artifacts: 0, total: 0 })),
  ]);

  const kpis = [
    {
      label: "Active projects",
      value: data.activeProjectCount,
      href: "/workspace/projects",
      icon: Layers,
      accent: "teal" as const,
    },
    ...(data.portfolioHealth != null
      ? [
          {
            label: "Portfolio health",
            value: data.portfolioHealth,
            hint: "/ 100",
            href: "/workspace/portfolio",
            icon: Scale,
            accent:
              data.portfolioHealth >= 80
                ? ("teal" as const)
                : data.portfolioHealth >= 60
                  ? ("amber" as const)
                  : ("rose" as const),
          },
        ]
      : []),
    ...(successScoreValue != null
      ? [
          {
            label: "Success score",
            value: successScoreValue,
            hint: "/ 100",
            href: topProject ? `/project/${topProject.id}` : "/workspace/projects",
            icon: CalendarClock,
            accent:
              successScoreValue >= 75
                ? ("teal" as const)
                : successScoreValue >= 55
                  ? ("amber" as const)
                  : ("rose" as const),
          },
        ]
      : []),
    {
      label: "Tasks in progress",
      value: data.delivery.tasksInProgress,
      href: "/workspace/tasks",
      icon: CheckSquare,
      accent: "teal" as const,
    },
    {
      label: "Overdue",
      value: data.delivery.overdueTasks,
      href: "/workspace/tasks",
      icon: Clock,
      accent: data.delivery.overdueTasks > 0 ? ("amber" as const) : ("slate" as const),
    },
    {
      label: "Blocked",
      value: data.delivery.blockedTasks,
      href: "/workspace/tasks",
      icon: Ban,
      accent: data.delivery.blockedTasks > 0 ? ("rose" as const) : ("slate" as const),
    },
    {
      label: "Open risks",
      value: data.governance.openRisks,
      href: "/workspace/raid",
      icon: AlertTriangle,
      accent: data.governance.openRisks > 0 ? ("rose" as const) : ("slate" as const),
    },
    {
      label: "Pending decisions",
      value: data.governance.pendingDecisions,
      href: "/workspace/decisions",
      icon: ShieldAlert,
      accent: data.governance.pendingDecisions > 0 ? ("amber" as const) : ("slate" as const),
    },
    {
      label: "Pending approvals",
      value: approvalCounts.total,
      hint:
        approvalCounts.total > 0
          ? `${approvalCounts.artifacts} artifacts · ${approvalCounts.proposals} proposals`
          : undefined,
      href: "/workspace/proposals",
      icon: CalendarClock,
      accent: approvalCounts.total > 0 ? ("amber" as const) : ("slate" as const),
    },
    {
      label: "Standups (7d)",
      value: data.delivery.standupsThisWeek,
      href: "/workspace/meetings",
      icon: Users,
      accent: "teal" as const,
    },
  ];

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

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX OS · Command Centre"
        title={roleHeading(data.userRole, data.userName)}
        titleEm={
          data.governance.openRisks + data.delivery.blockedTasks > 0
            ? `${data.governance.openRisks + data.delivery.blockedTasks} signals need attention.`
            : undefined
        }
        action={
          <div className="flex items-center gap-2">
            <DxBadge tone="green" dot>
              Operational
            </DxBadge>
            <DxButtonLink href="/project/new" variant="primarySm">
              New project
            </DxButtonLink>
          </div>
        }
      />
      <div className="p-6 md:p-8">

      <div className="mb-6">
        <QuickActionsBar role={data.userRole} />
      </div>

      <div className="mb-8">
        <KpiStrip items={kpis} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashboardSection title="AI alert queue" href="/workspace/alerts">
          <AlertQueuePanel alerts={alerts} />
        </DashboardSection>
        <DashboardSection title="Delivery coach" href="/workspace/alerts">
          <DeliveryCoachPanel suggestions={coach} />
        </DashboardSection>
      </div>

      <div className="mb-8">
        <DashboardSection title="Delivery forecasts" href="/workspace/pmo">
          <DeliveryForecastStrip entries={forecastRollup} />
        </DashboardSection>
      </div>

      {approvalCounts.total > 0 ? (
        <div className="mb-8">
          <DashboardSection title="Approval centre" href="/workspace/proposals">
            <ApprovalCentrePanel
              artifactReviews={pendingArtifactReviews}
              proposals={pendingProposals}
            />
          </DashboardSection>
        </div>
      ) : null}

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <DashboardSection title="Delivery velocity" className="xl:col-span-2">
          <DeliveryVelocityChart weeks={data.weeklyVelocity} />
        </DashboardSection>
        <DashboardSection title="Governance pulse" href="/workspace/governance">
          <GovernancePulse stats={data.governance} />
        </DashboardSection>
      </div>

      <DashboardSection title="Project health" href="/workspace/projects" className="mb-8">
        <ProjectHealthGrid projects={data.projectHealth} />
      </DashboardSection>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <DashboardSection title="Active tasks" href="/workspace/tasks" className="xl:col-span-2">
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
        </DashboardSection>

        <DashboardSection title="Risk register" href="/workspace/raid">
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
        </DashboardSection>

        <DashboardSection title="Recent meetings" href="/workspace/meetings">
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
        </DashboardSection>

        <DashboardSection title="Pending decisions" href="/workspace/decisions">
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
        </DashboardSection>

        <DashboardSection title="Standups this week" href="/workspace/meetings">
          <StandupsFeed standups={data.recentStandups} />
        </DashboardSection>

        <DashboardSection title="Latest reports" href="/workspace/reports">
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
        </DashboardSection>
      </div>

      {atRiskProjects.length > 0 ? (
        <DashboardSection title="Governance by project" href="/workspace/governance" className="mb-8">
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
        </DashboardSection>
      ) : null}

      {topProject && topAlignment ? (
        <div className="mb-8">
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
        healthTier={healthTier}
        confidenceScore={confidenceScore}
        recommendation={recommendation}
      />

      <section className={`${dxClass.cardPad} mt-8`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className={`${dxClass.display} text-xl`}>Recent projects</h2>
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
      </section>
      </div>
    </>
  );
}
