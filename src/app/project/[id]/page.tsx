import { createClient } from "@/lib/supabase/server";
import { getProjectIntelligence } from "@/services/intelligence";
import { ProjectHealthCard } from "@/components/intelligence/project-health-card";
import { ConfidenceCard } from "@/components/intelligence/confidence-card";
import { RecommendationsPanel } from "@/components/intelligence/recommendations-panel";
import { DriftPanel } from "@/components/intelligence/drift-panel";
import { BlockerInsights } from "@/components/intelligence/blocker-insights";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name, status, delivery_type, timeline, goal")
    .eq("id", id)
    .single();

  const projectName = project?.name ?? "Project";

  const intelligence = await getProjectIntelligence(id);

  const subtitle = `Delivery confidence: ${intelligence.confidence.score}% • ${
    intelligence.health.tier === "healthy"
      ? "Low risk"
      : intelligence.health.tier === "watch"
        ? "Medium risk"
        : "High risk"
  }`;

  const kpis = [
    { title: "Tasks", value: "124", live: false },
    { title: "Completed", value: "86", live: false },
    { title: "Team", value: "24", live: false },
    { title: "Risks", value: "7", live: false },
  ];

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{projectName}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        <div className="flex gap-2">
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

      {/* Intelligence Layer — Phase 4 */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <ProjectHealthCard health={intelligence.health} />
        <ConfidenceCard confidence={intelligence.confidence} />
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-xs text-slate-500 sm:col-span-2 lg:col-span-2">
          <p className="font-semibold text-slate-600">Why scores are mocked</p>
          <p className="mt-1">
            Signals are deterministically seeded from the project ID until the
            tasks / blockers / standups schema lands. The intelligence engine,
            API, and UI surfaces are production-ready — only the loader needs
            swapping.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecommendationsPanel
          projectId={id}
          items={intelligence.recommendations}
        />
        <DriftPanel insights={intelligence.drift} />
        <BlockerInsights blockers={intelligence.blockers} />
      </div>

      {/* Phase 3 surfaces — operational tiles */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {kpis.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500">{card.title}</p>
              {card.live ? null : (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                  Demo
                </span>
              )}
            </div>
            <p className="mt-1 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

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
