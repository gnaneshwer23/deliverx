import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers, Target } from "lucide-react";
import {
  getProgramme,
  listProjectsForOrg,
  listProjectsForProgramme,
  listDependencies,
  runProgrammeAnalysis,
} from "@/services/portfolio";
import { DependencyMap } from "@/components/portfolio/dependency-map";
import { AssignProjectForm } from "./assign-project-form";
import { DependencyForm } from "./dependency-form";
import { ProgrammeOrchestrationPanel } from "@/components/programmes/programme-orchestration-panel";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  planning: "bg-slate-100 text-slate-700",
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-indigo-100 text-indigo-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const TIER_COLOR = (n: number) =>
  n >= 80
    ? "text-emerald-600"
    : n >= 60
      ? "text-amber-600"
      : n === 0
        ? "text-slate-400"
        : "text-rose-600";

export default async function ProgrammeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const programme = await getProgramme(id);
  if (!programme) notFound();

  const [analysis, allOrgProjects, deps] = await Promise.all([
    runProgrammeAnalysis(id),
    listProjectsForOrg(),
    (async () => {
      const inProg = await listProjectsForProgramme(id);
      return listDependencies({ projectIds: inProg.map((p) => p.id) });
    })(),
  ]);

  const inProgrammeIds = new Set(analysis.projects.map((p) => p.id));
  const unassigned = allOrgProjects.filter(
    (p) => p.programme_id === null && !inProgrammeIds.has(p.id),
  );

  const nameById = new Map(allOrgProjects.map((p) => [p.id, p.name]));
  const dependencyViews = deps.map((d) => ({
    id: d.id,
    sourceName: nameById.get(d.source_project_id) ?? "Unknown",
    targetName: nameById.get(d.target_project_id) ?? "Unknown",
    type: d.dependency_type,
    severity: d.severity,
    description: d.description,
  }));

  const sourcesForDep = analysis.projects.map((p) => ({
    id: p.id,
    name: p.name,
  }));
  const targetsForDep = allOrgProjects
    .filter((p) => !inProgrammeIds.has(p.id))
    .map((p) => ({ id: p.id, name: p.name }));

  return (
    <main className="p-8">
      <div className="mb-2 text-xs text-slate-500">
        <Link href="/workspace/programmes" className="hover:underline">
          Programmes
        </Link>{" "}
        / {programme.name}
      </div>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Layers size={20} className="text-indigo-600" /> {programme.name}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                STATUS_STYLE[programme.status] ?? STATUS_STYLE.active
              }`}
            >
              {programme.status}
            </span>
            {programme.strategic_goal ? (
              <span className="flex items-center gap-1 text-slate-500">
                <Target size={12} /> {programme.strategic_goal}
              </span>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Programme health</p>
          <p
            className={`text-3xl font-bold ${TIER_COLOR(analysis.programmeHealth)}`}
          >
            {analysis.programmeHealth || "—"}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Projects</h2>
            <span className="text-xs text-slate-400">
              {analysis.projects.length}
            </span>
          </div>
          {analysis.projects.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
              No projects in this programme yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {analysis.projects.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <Link
                      href={`/project/${p.id}`}
                      className="font-medium hover:text-indigo-600 hover:underline"
                    >
                      {p.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {p.status} · velocity{" "}
                      {Math.round(p.velocity * 100)}% · {p.blockers} blockers
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-semibold ${TIER_COLOR(p.healthScore)}`}
                    >
                      {p.healthScore}
                    </span>
                    <p className="text-[10px] text-slate-400">health</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <AssignProjectForm
              programmeId={programme.id}
              unassigned={unassigned}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-semibold">Programme Risks</h2>
          {analysis.risks.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              No programme-level risks detected.
            </p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-700">
              {analysis.risks.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-rose-500">⚠</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}

          <h3 className="mt-6 mb-3 font-semibold">Bottlenecks</h3>
          {analysis.bottlenecks.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              No bottlenecks flagged.
            </p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-700">
              {analysis.bottlenecks.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-amber-500">🚧</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6">
        <ProgrammeOrchestrationPanel programmeId={programme.id} />
      </div>

      <div className="mt-6 space-y-3">
        <DependencyMap dependencies={dependencyViews} />
        <DependencyForm
          programmeId={programme.id}
          sources={sourcesForDep}
          targets={targetsForDep}
        />
      </div>
    </main>
  );
}
