import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProjectIntelligence } from "@/services/intelligence";
import { loadProjectSignals } from "@/services/projectSignals";
import { listMemory } from "@/services/memory";
import { listTasks, listOrgMembers } from "@/services/delivery";
import { runAdaptiveLoop, latestReviewByKey } from "@/services/adaptive";
import { ProjectHealthCard } from "@/components/intelligence/project-health-card";
import { ConfidenceCard } from "@/components/intelligence/confidence-card";
import { RecommendationsPanel } from "@/components/intelligence/recommendations-panel";
import { DriftPanel } from "@/components/intelligence/drift-panel";
import { BlockerInsights } from "@/components/intelligence/blocker-insights";
import { BenchmarkPanel } from "@/components/intelligence/benchmark-panel";
import { LessonsPanel } from "@/components/intelligence/lessons-panel";
import { StabilityPanel } from "@/components/adaptive/stability-panel";
import { DriftSignalsPanel } from "@/components/adaptive/drift-signals-panel";
import { PressurePanel } from "@/components/adaptive/pressure-panel";
import { ScenarioPanel } from "@/components/adaptive/scenario-panel";
import {
  AdaptiveRecommendationsPanel,
  type RecommendationWithReview,
} from "@/components/adaptive/adaptive-recommendations-panel";
import { ExtractInsightsButton } from "./extract-insights-button";
import { ProjectStatusSelect } from "./project-status-select";
import { listAiReviews } from "@/services/recommendations";
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

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name, status, delivery_type, timeline, goal, applied_playbook_id, closure_processed_at")
    .eq("id", id)
    .single();

  const projectName = project?.name ?? "Project";
  const projectStatus = (project?.status ?? "draft") as
    | "draft"
    | "active"
    | "paused"
    | "completed"
    | "archived";

  const [intelligence, signals, memory, adaptive, reviews, aiReviews, tasks, members, alignment] =
    await Promise.all([
    getProjectIntelligence(id),
    loadProjectSignals(id),
    listMemory({ limit: 200 }),
    runAdaptiveLoop(id),
    latestReviewByKey(id),
    listAiReviews(id),
    listTasks({ projectId: id, limit: 6 }),
    listOrgMembers(),
    getProjectAlignment(id),
  ]);

  const aiReviewMap = Object.fromEntries(
    aiReviews.map((r) => [r.recommendation_id, r.action]),
  );

  const adaptiveRecs: RecommendationWithReview[] = adaptive.recommendations.map(
    (r) => ({ ...r, review: reviews.get(r.key) ?? null }),
  );

  // Lessons from this org's memory that share tags with the project's
  // delivery type — surfaces relevant history without overwhelming.
  const deliveryTag = (project?.delivery_type ?? "").toLowerCase();
  const lessons = memory
    .filter(
      (m) =>
        m.type === "lesson" &&
        (deliveryTag === "" || m.tags.some((t) => t.toLowerCase() === deliveryTag)),
    )
    .slice(0, 4)
    .map((m) => ({ lesson: m.insight, tags: m.tags }));

  const benchmarks = [
    { name: "Velocity", value: `${Math.round(signals.velocity * 100)}%` },
    { name: "Blockers", value: String(signals.blockers) },
    { name: "Overdue tasks", value: String(signals.overdueTasks) },
    {
      name: "Avg. close time",
      value: `${signals.averageCompletionDays.toFixed(1)}d`,
    },
  ];

  const subtitle = `Delivery confidence: ${intelligence.confidence.score}% • ${
    intelligence.health.tier === "healthy"
      ? "Low risk"
      : intelligence.health.tier === "watch"
        ? "Medium risk"
        : "High risk"
  }`;

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{projectName}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
          {project?.applied_playbook_id ? (
            <p className="mt-1 text-xs text-indigo-600">
              Applied playbook ·{" "}
              <Link
                href="/workspace/playbooks"
                className="underline hover:no-underline"
              >
                view library
              </Link>
            </p>
          ) : null}
          {project?.closure_processed_at ? (
            <p className="mt-1 text-xs text-emerald-600">
              Closure insights extracted{" "}
              {new Date(project.closure_processed_at).toLocaleDateString()}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ProjectStatusSelect projectId={id} current={projectStatus} />
          <ExtractInsightsButton projectId={id} />
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-[#0F172A] hover:bg-slate-50"
          >
            Export
          </button>
          <Link
            href={`/project/${id}/tasks`}
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
          >
            New Task
          </Link>
        </div>
      </div>

      {/* Phase 7 — Adaptive intelligence banner */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <StabilityPanel stability={adaptive.stability} />
        <DriftSignalsPanel drift={adaptive.drift} />
        <PressurePanel pressures={adaptive.pressure} />
        <ScenarioPanel scenarios={adaptive.scenarios} />
      </div>

      <div className="mb-6">
        <AdaptiveRecommendationsPanel
          projectId={id}
          items={adaptiveRecs}
          patterns={adaptive.patterns}
          interpretation={adaptive.interpretation}
        />
      </div>

      {/* Charter alignment — core DeliverX signal */}
      <div className="mb-6">
        <AlignmentSummaryCard
          projectId={id}
          projectName={projectName}
          score={alignment.score}
          tier={alignment.tier}
          trend={alignment.trend}
          delta={alignment.latest?.delta ?? null}
          hasCharter={Boolean(alignment.charter?.content?.trim())}
        />
      </div>

      {/* Intelligence row 1 */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <ProjectHealthCard health={intelligence.health} />
        <ConfidenceCard confidence={intelligence.confidence} />
        <BenchmarkPanel metrics={benchmarks} />
        <LessonsPanel
          lessons={lessons}
          emptyHref="/workspace/memory"
        />
      </div>

      {/* Intelligence row 2 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecommendationsPanel
          projectId={id}
          items={intelligence.recommendations}
          initialReviews={aiReviewMap}
        />
        <DriftPanel insights={intelligence.drift} />
        <BlockerInsights blockers={intelligence.blockers} />
      </div>

      {/* Phase 3 operational tiles */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Delivery Performance">
          <div className="flex h-48 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-100 to-blue-100 text-sm text-slate-500">
            Chart
          </div>
        </Card>

        <Card title="Team">
          {members.length === 0 ? (
            <p className="text-sm text-slate-500">No team members in org yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {members.slice(0, 6).map((m) => (
                <li key={m.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                      {(m.name ?? m.email ?? "?").charAt(0).toUpperCase()}
                    </span>
                    {m.name ?? m.email}
                  </span>
                  <span className="text-xs capitalize text-slate-400">
                    {m.role?.replace(/_/g, " ") ?? "member"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2" title="Tasks">
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-500">
              No tasks yet.{" "}
              <Link
                href={`/project/${id}/tasks`}
                className="font-medium text-[#0F766E] hover:underline"
              >
                Add tasks
              </Link>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-slate-400">
                    <TableHead className="pb-2 font-medium">Task</TableHead>
                    <TableHead className="pb-2 font-medium">Status</TableHead>
                    <TableHead className="pb-2 font-medium">Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id} className="border-t border-slate-100">
                      <TableCell className="py-3">
                        <Link
                          href={`/project/${id}/tasks/${task.id}`}
                          className="font-medium text-[#0F766E] hover:underline"
                        >
                          {task.title}
                        </Link>
                      </TableCell>
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
        </Card>

        <Card title="Activity">
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-500">No recent task updates.</p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-600">
              {tasks.slice(0, 4).map((task) => (
                <li key={task.id}>
                  {task.title} ·{" "}
                  <span className="capitalize text-slate-400">
                    {task.status.replace(/_/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </main>
  );
}

function Card({
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
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className ?? ""}`}
    >
      <h3 className="mb-4 font-semibold">{title}</h3>
      {children}
    </section>
  );
}
