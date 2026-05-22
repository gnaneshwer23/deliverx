/**
 * Portfolio façade — persistence + orchestration for Phase 6.
 *
 * Reads programmes/projects/dependencies from Supabase (RLS-scoped),
 * pipes per-project signals through the intelligence engine, then
 * passes aggregated results to the pure programme/portfolio/dependency
 * engines.
 */

import { createClient } from "@/lib/supabase/server";
import { loadProjectSignals } from "./projectSignals";
import {
  computeProjectHealth,
  computeDeliveryConfidence,
} from "./intelligenceEngine";
import {
  analyseProgramme,
  type ProgrammeProject,
  type ProgrammeAnalysis,
} from "./programmeEngine";
import {
  summarisePortfolio,
  type ProgrammeSummary,
  type PortfolioSnapshot,
} from "./portfolioEngine";
import {
  incomingDependencyCounts,
  traceDependencyImpact,
  blastRadius,
  type DependencyEdge,
} from "./dependencyEngine";
import { generateForecast, type Forecast } from "./forecastEngine";

// ---------------------------------------------------------------------------
// DB row types
// ---------------------------------------------------------------------------

export type PortfolioRow = {
  id: string;
  organisation_id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type ProgrammeRow = {
  id: string;
  organisation_id: string;
  portfolio_id: string;
  name: string;
  strategic_goal: string | null;
  status: "planning" | "active" | "paused" | "completed" | "cancelled";
  created_at: string;
};

export type ProjectRow = {
  id: string;
  name: string;
  status: string;
  delivery_type: string | null;
  programme_id: string | null;
};

export type DependencyRow = {
  id: string;
  organisation_id: string;
  source_project_id: string;
  target_project_id: string;
  dependency_type: "blocks" | "depends_on" | "shares_resource" | "data_handoff";
  severity: "low" | "medium" | "high" | "critical";
  description: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Auth helper (mirrors memory.ts)
// ---------------------------------------------------------------------------

async function getContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .single();
  if (!profile?.organisation_id) throw new Error("No organisation");
  return {
    supabase,
    userId: user.id,
    orgId: profile.organisation_id as string,
  };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function listPortfolios(): Promise<PortfolioRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PortfolioRow[];
}

export async function getDefaultPortfolio(): Promise<PortfolioRow | null> {
  const portfolios = await listPortfolios();
  return portfolios[0] ?? null;
}

export async function listProgrammes(
  portfolioId?: string,
): Promise<ProgrammeRow[]> {
  const supabase = await createClient();
  let q = supabase
    .from("programmes")
    .select("*")
    .order("created_at", { ascending: true });
  if (portfolioId) q = q.eq("portfolio_id", portfolioId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ProgrammeRow[];
}

export async function getProgramme(id: string): Promise<ProgrammeRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("programmes")
    .select("*")
    .eq("id", id)
    .single();
  return (data as ProgrammeRow) ?? null;
}

export async function listProjectsForOrg(): Promise<ProjectRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, status, delivery_type, programme_id")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectRow[];
}

export async function listProjectsForProgramme(
  programmeId: string,
): Promise<ProjectRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, status, delivery_type, programme_id")
    .eq("programme_id", programmeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectRow[];
}

export async function listDependencies(opts: {
  programmeId?: string;
  projectIds?: string[];
} = {}): Promise<DependencyRow[]> {
  const supabase = await createClient();
  let q = supabase
    .from("cross_project_dependencies")
    .select("*")
    .order("created_at", { ascending: false });

  if (opts.projectIds && opts.projectIds.length > 0) {
    q = q.or(
      `source_project_id.in.(${opts.projectIds.join(",")}),target_project_id.in.(${opts.projectIds.join(",")})`,
    );
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as DependencyRow[];
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createPortfolio(input: {
  name: string;
  description?: string | null;
}): Promise<PortfolioRow> {
  const { supabase, userId, orgId } = await getContext();
  const { data, error } = await supabase
    .from("portfolios")
    .insert({
      organisation_id: orgId,
      name: input.name,
      description: input.description ?? null,
      created_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as PortfolioRow;
}

export async function createProgramme(input: {
  portfolioId: string;
  name: string;
  strategicGoal?: string | null;
  status?: ProgrammeRow["status"];
}): Promise<ProgrammeRow> {
  const { supabase, userId, orgId } = await getContext();
  const { data, error } = await supabase
    .from("programmes")
    .insert({
      organisation_id: orgId,
      portfolio_id: input.portfolioId,
      name: input.name,
      strategic_goal: input.strategicGoal ?? null,
      status: input.status ?? "active",
      created_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as ProgrammeRow;
}

export async function assignProjectToProgramme(
  projectId: string,
  programmeId: string | null,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ programme_id: programmeId })
    .eq("id", projectId);
  if (error) throw error;
}

export async function createDependency(input: {
  sourceProjectId: string;
  targetProjectId: string;
  dependencyType: DependencyRow["dependency_type"];
  severity: DependencyRow["severity"];
  description?: string | null;
}): Promise<DependencyRow> {
  const { supabase, userId, orgId } = await getContext();
  if (input.sourceProjectId === input.targetProjectId) {
    throw new Error("Source and target cannot be the same project");
  }
  const { data, error } = await supabase
    .from("cross_project_dependencies")
    .insert({
      organisation_id: orgId,
      source_project_id: input.sourceProjectId,
      target_project_id: input.targetProjectId,
      dependency_type: input.dependencyType,
      severity: input.severity,
      description: input.description ?? null,
      created_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as DependencyRow;
}

export async function deleteDependency(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cross_project_dependencies")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Orchestration (pure-engine pipelines)
// ---------------------------------------------------------------------------

async function projectToProgrammeProject(
  row: ProjectRow,
): Promise<ProgrammeProject> {
  const signals = await loadProjectSignals(row.id);
  const health = computeProjectHealth(signals);
  const confidence = computeDeliveryConfidence(signals);
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    healthScore: health.score,
    confidenceScore: confidence.score,
    blockers: signals.blockers,
    velocity: signals.velocity,
    milestoneDelay: signals.milestoneDelay,
  };
}

export async function runProgrammeAnalysis(
  programmeId: string,
): Promise<ProgrammeAnalysis & { projects: ProgrammeProject[] }> {
  const projects = await listProjectsForProgramme(programmeId);
  const enriched = await Promise.all(projects.map(projectToProgrammeProject));

  const projectIds = enriched.map((p) => p.id);
  const deps = await listDependencies({ projectIds });
  const edges: DependencyEdge[] = deps.map((d) => ({
    id: d.id,
    sourceProjectId: d.source_project_id,
    targetProjectId: d.target_project_id,
    type: d.dependency_type,
    severity: d.severity,
  }));

  const incoming = incomingDependencyCounts(edges);
  const analysis = analyseProgramme(enriched, incoming);
  return { ...analysis, projects: enriched };
}

export async function getPortfolioSnapshot(
  portfolioId: string,
): Promise<{ snapshot: PortfolioSnapshot; programmes: ProgrammeSummary[] }> {
  const programmes = await listProgrammes(portfolioId);

  const programmeSummaries: ProgrammeSummary[] = [];
  let totalDeps = 0;

  for (const prog of programmes) {
    const projects = await listProjectsForProgramme(prog.id);
    const enriched = await Promise.all(projects.map(projectToProgrammeProject));
    const projectIds = enriched.map((p) => p.id);
    const deps = await listDependencies({ projectIds });
    totalDeps += deps.length;

    const edges: DependencyEdge[] = deps.map((d) => ({
      id: d.id,
      sourceProjectId: d.source_project_id,
      targetProjectId: d.target_project_id,
      type: d.dependency_type,
      severity: d.severity,
    }));
    const incoming = incomingDependencyCounts(edges);
    const analysis = analyseProgramme(enriched, incoming);

    programmeSummaries.push({
      id: prog.id,
      name: prog.name,
      status: prog.status,
      health: analysis.programmeHealth,
      projectCount: enriched.length,
      atRiskCount: analysis.atRiskProjectIds.length,
      risks: analysis.risks,
    });
  }

  const snapshot = summarisePortfolio(programmeSummaries, totalDeps);
  return { snapshot, programmes: programmeSummaries };
}

async function persistForecast(projectId: string, forecast: Forecast) {
  try {
    const { supabase, orgId } = await getContext();
    const { data: latest } = await supabase
      .from("delivery_forecasts")
      .select("prediction, generated_at")
      .eq("project_id", projectId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recent =
      latest?.generated_at &&
      new Date(latest.generated_at).getTime() > oneHourAgo;
    if (recent && latest.prediction === forecast.prediction) return;

    await supabase.from("delivery_forecasts").insert({
      organisation_id: orgId,
      project_id: projectId,
      prediction: forecast.prediction,
      confidence: forecast.confidence,
    });
  } catch {
    /* table may not exist yet */
  }
}

export async function forecastProject(projectId: string): Promise<Forecast> {
  const signals = await loadProjectSignals(projectId);
  const forecast = generateForecast(signals);
  await persistForecast(projectId, forecast);
  return forecast;
}

export async function listRecentForecasts(
  projectId: string,
  limit = 10,
): Promise<
  Array<{ prediction: string; confidence: number; generated_at: string }>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delivery_forecasts")
    .select("prediction, confidence, generated_at")
    .eq("project_id", projectId)
    .order("generated_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data ?? [];
}

// ---------------------------------------------------------------------------
// PMO synthesis — used by /workspace/pmo
// ---------------------------------------------------------------------------

export type PmoSnapshot = {
  portfolioHealth: number;
  topRisks: string[];
  bottlenecks: string[];
  blastRadius: ImpactedSummary[];
  forecasts: { projectId: string; projectName: string; forecast: Forecast }[];
  executiveSummary: string;
};

export type ImpactedSummary = {
  sourceProjectId: string;
  targetProjectId: string;
  sourceName: string;
  targetName: string;
  type: string;
  severity: string;
  hops: number;
};

export async function getPmoSnapshot(): Promise<PmoSnapshot> {
  const portfolios = await listPortfolios();
  if (portfolios.length === 0) {
    return {
      portfolioHealth: 0,
      topRisks: [],
      bottlenecks: [],
      blastRadius: [],
      forecasts: [],
      executiveSummary:
        "No portfolio configured yet — create one from /workspace/portfolio.",
    };
  }

  const allProjects = await listProjectsForOrg();
  const enriched = await Promise.all(allProjects.map(projectToProgrammeProject));
  const allDeps = await listDependencies();
  const edges: DependencyEdge[] = allDeps.map((d) => ({
    id: d.id,
    sourceProjectId: d.source_project_id,
    targetProjectId: d.target_project_id,
    type: d.dependency_type,
    severity: d.severity,
  }));
  const incoming = incomingDependencyCounts(edges);

  const atRiskIds = enriched
    .filter((p) => p.milestoneDelay || p.healthScore < 60)
    .map((p) => p.id);

  const impacts = blastRadius(edges, atRiskIds, 3);
  const nameById = new Map(allProjects.map((p) => [p.id, p.name]));

  const impactSummaries: ImpactedSummary[] = impacts
    .slice(0, 6)
    .map((i) => ({
      sourceProjectId: i.sourceProjectId,
      targetProjectId: i.targetProjectId,
      sourceName: nameById.get(i.sourceProjectId) ?? "Unknown",
      targetName: nameById.get(i.targetProjectId) ?? "Unknown",
      type: i.type,
      severity: i.severity,
      hops: i.hops,
    }));

  const forecasts = await Promise.all(
    enriched
      .filter((p) => p.healthScore < 75)
      .slice(0, 4)
      .map(async (p) => ({
        projectId: p.id,
        projectName: p.name,
        forecast: await forecastProject(p.id),
      })),
  );

  // Aggregate org-wide programme risks/bottlenecks.
  const analysis = analyseProgramme(enriched, incoming);

  const programmes = await listProgrammes();
  const programmeSummaries: ProgrammeSummary[] = programmes.map((prog) => {
    const projects = enriched.filter(
      (p) => allProjects.find((r) => r.id === p.id)?.programme_id === prog.id,
    );
    return {
      id: prog.id,
      name: prog.name,
      status: prog.status,
      health:
        projects.length === 0
          ? 0
          : Math.round(
              projects.reduce((s, p) => s + p.healthScore, 0) / projects.length,
            ),
      projectCount: projects.length,
      atRiskCount: projects.filter((p) => p.healthScore < 60).length,
      risks: [],
    };
  });
  const portfolioSnap = summarisePortfolio(programmeSummaries, allDeps.length);

  return {
    portfolioHealth: portfolioSnap.health,
    topRisks: analysis.risks,
    bottlenecks: analysis.bottlenecks,
    blastRadius: impactSummaries,
    forecasts,
    executiveSummary: portfolioSnap.executiveSummary,
  };
}

// Re-exports for callers that need engine types.
export { traceDependencyImpact };
