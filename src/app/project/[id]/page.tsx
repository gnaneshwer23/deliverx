import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProjectIntelligence } from "@/services/intelligence";
import { loadProjectSignals } from "@/services/projectSignals";
import { listMemory } from "@/services/memory";
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

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name, status, delivery_type, timeline, goal, applied_playbook_id")
    .eq("id", id)
    .single();

  const projectName = project?.name ?? "Project";

  const [intelligence, signals, memory, adaptive, reviews] = await Promise.all([
    getProjectIntelligence(id),
    loadProjectSignals(id),
    listMemory({ limit: 200 }),
    runAdaptiveLoop(id),
    latestReviewByKey(id),
  ]);

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
        </div>

        <div className="flex gap-2">
          <ExtractInsightsButton projectId={id} />
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-[#0F172A] hover:bg-slate-50"
          >
            Export
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#4F46E5] px-4 text-sm font-medium text-white hover:bg-[#4338CA]"
          >
            New Task
          </button>
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
        <AdaptiveRecommendationsPanel projectId={id} items={adaptiveRecs} />
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
          <ul className="space-y-3 text-sm">
            {[
              ["Sarah", "Online"],
              ["Tom", "Online"],
              ["Alex", "Away"],
            ].map(([name, status]) => (
              <li key={name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                    {name.charAt(0)}
                  </span>
                  {name}
                </span>
                <span className="text-xs text-slate-400">{status}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2" title="Tasks">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="pb-2 font-medium">Task</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Owner</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="py-3">System Integration</td>
                    <td className="text-blue-500">In Progress</td>
                    <td>Sarah</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Activity">
          <ul className="space-y-2 text-sm text-slate-600">
            <li>Task updated</li>
            <li>Risk added</li>
            <li>Milestone hit</li>
          </ul>
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
