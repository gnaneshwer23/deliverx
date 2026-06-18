/**
 * Programme orchestration façade — multi-project agent sweep for a programme.
 */

import { createClient } from "@/lib/supabase/server";
import { getProgramme, listProjectsForProgramme, runProgrammeAnalysis } from "./portfolio";
import { orchestrateProjectAgents } from "./agentOrchestration";
import {
  aggregateProgrammeOrchestration,
  pickTopInsight,
  type ProgrammeOrchestrationSnapshot,
} from "./programmeOrchestrationEngine";

export type { ProgrammeOrchestrationSnapshot };

export async function orchestrateProgrammePortfolio(
  programmeId: string,
  query?: string,
): Promise<ProgrammeOrchestrationSnapshot> {
  const programme = await getProgramme(programmeId);
  if (!programme) throw new Error("Programme not found");

  const [analysis, projects] = await Promise.all([
    runProgrammeAnalysis(programmeId),
    listProjectsForProgramme(programmeId),
  ]);

  const active = projects.filter((p) => p.status === "active").slice(0, 6);
  const targets = active.length > 0 ? active : projects.slice(0, 6);

  const projectResults = await Promise.all(
    targets.map(async (project) => {
      const result = await orchestrateProjectAgents({
        projectId: project.id,
        query,
        triggerSource: "programme",
      });
      return {
        projectId: project.id,
        projectName: project.name,
        intent: result.intent,
        synthesis: result.synthesis,
        topInsight: pickTopInsight(result),
        routedAgents: result.routedAgents,
      };
    }),
  );

  return aggregateProgrammeOrchestration({
    programmeId,
    programmeName: programme.name,
    programmeHealth: analysis.programmeHealth,
    results: projectResults,
  });
}

export async function listProgrammeOrchestrationHistory(programmeId: string, limit = 5) {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("programme_id", programmeId);

  const projectIds = (projects ?? []).map((p) => p.id as string);
  if (projectIds.length === 0) return [];

  const { data, error } = await supabase
    .from("agent_workflow_runs")
    .select("id, project_id, intent, synthesis, started_at, projects!inner(name)")
    .in("project_id", projectIds)
    .eq("trigger_source", "programme")
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data ?? []).map((row) => {
    const projectsJoin = row.projects as { name?: string } | { name?: string }[] | null;
    const projectName = Array.isArray(projectsJoin)
      ? (projectsJoin[0]?.name ?? "Project")
      : (projectsJoin?.name ?? "Project");
    return {
      id: String(row.id),
      projectId: String(row.project_id),
      projectName,
      intent: row.intent ? String(row.intent) : null,
      synthesis: row.synthesis ? String(row.synthesis) : null,
      startedAt: String(row.started_at),
    };
  });
}
