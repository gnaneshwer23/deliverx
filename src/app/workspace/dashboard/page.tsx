import Link from "next/link";
import {
  BarChart3,
  Users,
  Layers,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrgDeliveryStats, listOrgTasks } from "@/services/delivery";
import { getOrgGovernanceStats, listOpenRaidOrg } from "@/services/governance";
import { getProjectIntelligence } from "@/services/intelligence";
import { getProjectAlignment } from "@/services/alignment";
import { AlignmentSummaryCard } from "@/components/alignment/alignment-summary-card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AiInsights } from "./ai-insights";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ count: activeProjects }, { data: recentProjects }, stats, govStats, recentTasks, openRisks] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .in("status", ["draft", "active"]),
      supabase
        .from("projects")
        .select("id, name, status, delivery_type, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      getOrgDeliveryStats(),
      getOrgGovernanceStats(),
      listOrgTasks({ limit: 8 }),
      listOpenRaidOrg(6),
    ]);

  const activeTaskRows = recentTasks.filter((t) => t.status !== "done");

  const topProject = recentProjects?.[0];
  let insightProjectName: string | null = null;
  let healthTier: "healthy" | "watch" | "at-risk" = "healthy";
  let confidenceScore = 100;
  let recommendation =
    "No interventions recommended — add tasks to projects to generate delivery signals.";
  let topAlignment: Awaited<ReturnType<typeof getProjectAlignment>> | null = null;

  if (topProject) {
    const [intel, alignment] = await Promise.all([
      getProjectIntelligence(topProject.id),
      getProjectAlignment(topProject.id),
    ]);
    topAlignment = alignment;
    insightProjectName = topProject.name;
    healthTier = intel.health.tier;
    confidenceScore = intel.confidence.score;
    recommendation = intel.recommendations[0]?.text ?? recommendation;
  }

  const kpis = [
    {
      title: "Active Projects",
      value: String(activeProjects ?? 0),
      icon: Layers,
      live: true,
    },
    {
      title: "Tasks In Progress",
      value: String(stats.tasksInProgress),
      icon: BarChart3,
      live: true,
    },
    {
      title: "Team Members",
      value: String(stats.teamMembers),
      icon: Users,
      live: true,
    },
    {
      title: "Open Risks",
      value: String(govStats.openRisks),
      icon: AlertTriangle,
      live: true,
    },
  ];

  return (
    <main className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Overview</h1>
          <p className="text-sm text-slate-500">Operational delivery dashboard</p>
        </div>
        <Link
          href="/project/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
        >
          New Project
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <p className="mt-1 text-2xl font-bold">{card.value}</p>
                </div>
                <div className="text-[#0F766E]">
                  <Icon size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardCard className="lg:col-span-2" title="Delivery Performance">
          <div className="flex h-40 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
            Chart Placeholder
          </div>
        </DashboardCard>

        <DashboardCard title="Recent Activity">
          {recentTasks.length === 0 ? (
            <p className="text-sm text-slate-500">No task activity yet.</p>
          ) : (
            <ul className="space-y-3 text-sm text-slate-600">
              {recentTasks.slice(0, 5).map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/project/${task.project_id}/tasks/${task.id}`}
                    className="hover:text-[#0F766E]"
                  >
                    Task updated: {task.title}
                  </Link>
                  <span className="block text-xs text-slate-400">
                    {task.project_name} ·{" "}
                    {new Date(task.updated_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard className="lg:col-span-2" title="Active Tasks">
          {activeTaskRows.length === 0 ? (
            <p className="text-sm text-slate-500">
              No open tasks.{" "}
              <Link href="/workspace/projects" className="text-[#0F766E] hover:underline">
                Create a project
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-slate-500">
                    <TableHead className="pb-2 font-medium">Task</TableHead>
                    <TableHead className="pb-2 font-medium">Project</TableHead>
                    <TableHead className="pb-2 font-medium">Workstream</TableHead>
                    <TableHead className="pb-2 font-medium">Status</TableHead>
                    <TableHead className="pb-2 font-medium">Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeTaskRows.slice(0, 6).map((task) => (
                    <TableRow key={task.id} className="border-t border-slate-100">
                      <TableCell className="py-3">
                        <Link
                          href={`/project/${task.project_id}/tasks/${task.id}`}
                          className="font-medium text-[#0F766E] hover:underline"
                        >
                          {task.title}
                        </Link>
                      </TableCell>
                      <TableCell>{task.project_name}</TableCell>
                      <TableCell>{task.workstream_name ?? "—"}</TableCell>
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
        </DashboardCard>

        <DashboardCard title="Risk Register">
          {openRisks.length === 0 ? (
            <p className="text-sm text-slate-500">
              No open risks in RAID. Log risks from a project RAID page.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              {openRisks.map((risk) => (
                <Link
                  key={risk.id}
                  href={`/project/${risk.project_id}/raid?type=risk`}
                  className={`block rounded-lg p-3 ${
                    risk.severity === "critical" || risk.severity === "high"
                      ? "bg-red-50 text-red-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {risk.title}
                  <span className="mt-1 block text-xs opacity-80">
                    {risk.project_name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>

      {topProject && topAlignment ? (
        <div className="mt-8">
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

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent projects</h2>
          <Link
            href="/project/new"
            className="inline-flex items-center gap-1 text-sm text-[#0F766E] hover:underline"
          >
            New project <ArrowUpRight size={14} />
          </Link>
        </div>
        {recentProjects && recentProjects.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {recentProjects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/project/${p.id}`}
                  className="flex items-center justify-between py-3 transition hover:bg-slate-50"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-slate-500">
                      {p.delivery_type ?? "—"} ·{" "}
                      {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-600">
                      {p.status}
                    </span>
                    <ArrowUpRight size={14} className="text-slate-400" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No projects yet.{" "}
            <Link
              href="/project/new"
              className="font-medium text-[#0F766E] hover:underline"
            >
              Create your first project
            </Link>
            .
          </div>
        )}
      </section>
    </main>
  );
}

function DashboardCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className ?? ""}`}
    >
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
