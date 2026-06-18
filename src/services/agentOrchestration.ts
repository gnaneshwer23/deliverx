/**
 * Agent orchestration façade — project context, RAG, persistence, activity feed.
 */

import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";
import { loadProjectSignals } from "./projectSignals";
import { computeProjectHealth } from "./intelligenceEngine";
import { searchProjectMemory } from "./projectMemoryRag";
import {
  runAgentOrchestration,
  type AgentOrchestrationEvent,
  type AgentOrchestrationResult,
  type ProjectOrchestrationContext,
  type SpecialistAgentRole,
} from "./agentOrchestrationEngine";

export type AgentActivityEventRow = {
  id: string;
  projectId: string;
  projectName: string;
  workflowRunId: string | null;
  agentRole: string;
  eventType: string;
  message: string;
  detail: Record<string, unknown>;
  ragSourceCount: number;
  handoffTo: string | null;
  humanReviewRequired: boolean;
  createdAt: string;
};

export type AgentWorkflowRunRow = {
  id: string;
  projectId: string;
  projectName: string;
  status: string;
  intent: string | null;
  routedAgents: string[];
  synthesis: string | null;
  startedAt: string;
  completedAt: string | null;
};

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organisation_id) throw new Error("No organisation");
  return { supabase, orgId: profile.organisation_id as string };
}

async function buildProjectOrchestrationContext(
  projectId: string,
  query?: string,
): Promise<ProjectOrchestrationContext> {
  const { supabase } = await getOrgContext();

  const [{ data: project }, signals, ragHits] = await Promise.all([
    supabase.from("projects").select("name").eq("id", projectId).single(),
    loadProjectSignals(projectId),
    searchProjectMemory(projectId, query ?? "delivery status blockers risks", 4).catch(() => []),
  ]);

  const health = computeProjectHealth(signals);

  let openDefects = 0;
  let criticalDefects = 0;
  try {
    const { data: defects } = await supabase
      .from("defects")
      .select("severity, status")
      .eq("project_id", projectId)
      .neq("status", "closed");
    for (const row of defects ?? []) {
      openDefects += 1;
      if (row.severity === "critical") criticalDefects += 1;
    }
  } catch {
    openDefects = 0;
    criticalDefects = 0;
  }

  let openRequirements = 0;
  try {
    const { count } = await supabase
      .from("requirements")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId)
      .in("status", ["draft", "pending_clarification", "approved"]);
    openRequirements = count ?? 0;
  } catch {
    openRequirements = 0;
  }

  return {
    projectId,
    projectName: (project?.name as string) ?? "Project",
    query,
    signals,
    health,
    openDefects,
    criticalDefects,
    openRequirements,
    ragSnippets: ragHits.map((hit) => ({
      title: hit.title,
      sourceType: hit.sourceType,
    })),
  };
}

async function persistOrchestrationRun(
  orgId: string,
  ctx: ProjectOrchestrationContext,
  result: AgentOrchestrationResult,
  triggerSource: string,
): Promise<{ workflowRunId: string }> {
  const { supabase } = await getOrgContext();

  const { data: run, error: runErr } = await supabase
    .from("agent_workflow_runs")
    .insert({
      organisation_id: orgId,
      project_id: ctx.projectId,
      status: "completed",
      trigger_source: triggerSource,
      intent: result.intent,
      routed_agents: result.routedAgents,
      synthesis: result.synthesis,
      human_review_required: true,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (runErr) {
    throwIfMissingTable(runErr, "agent_workflow_runs");
    throw runErr;
  }

  const workflowRunId = String(run.id);
  const ragCount = ctx.ragSnippets.length;

  const eventRows = result.events.map((event) => ({
    organisation_id: orgId,
    project_id: ctx.projectId,
    workflow_run_id: workflowRunId,
    agent_role: event.agentRole,
    event_type: event.eventType,
    message: event.message,
    detail: {
      ...(event.detail ?? {}),
      confidence: event.confidence ?? null,
      ragSnippets: ctx.ragSnippets,
    },
    rag_source_count: ragCount,
    handoff_to: event.handoffTo ?? null,
    human_review_required: true,
  }));

  const { error: eventErr } = await supabase.from("agent_activity_events").insert(eventRows);
  if (eventErr) {
    throwIfMissingTable(eventErr, "agent_activity_events");
    throw eventErr;
  }

  return { workflowRunId };
}

export async function orchestrateProjectAgents(input: {
  projectId: string;
  query?: string;
  triggerSource?: string;
}): Promise<AgentOrchestrationResult & { workflowRunId: string }> {
  const { orgId } = await getOrgContext();
  const ctx = await buildProjectOrchestrationContext(input.projectId, input.query);
  const result = runAgentOrchestration(ctx);
  const { workflowRunId } = await persistOrchestrationRun(
    orgId,
    ctx,
    result,
    input.triggerSource ?? "manual",
  );
  return { ...result, workflowRunId };
}

export async function sweepOrgAgentOrchestration(limit = 3): Promise<{
  runs: number;
  projectIds: string[];
}> {
  const { supabase } = await getOrgContext();

  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(limit);

  const projectIds: string[] = [];
  let runs = 0;

  for (const project of projects ?? []) {
    try {
      await orchestrateProjectAgents({
        projectId: project.id as string,
        triggerSource: "sweep",
      });
      projectIds.push(project.id as string);
      runs += 1;
    } catch {
      /* skip project on partial failure */
    }
  }

  return { runs, projectIds };
}

export async function listAgentActivityFeed(limit = 20): Promise<AgentActivityEventRow[]> {
  const { supabase } = await getOrgContext();

  const { data, error } = await supabase
    .from("agent_activity_events")
    .select(
      "id, project_id, workflow_run_id, agent_role, event_type, message, detail, rag_source_count, handoff_to, human_review_required, created_at, projects!inner(name)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    throwIfMissingTable(error, "agent_activity_events");
    throw error;
  }

  return (data ?? []).map((row) => {
    const projects = row.projects as { name?: string } | { name?: string }[] | null;
    const projectName = Array.isArray(projects)
      ? (projects[0]?.name ?? "Project")
      : (projects?.name ?? "Project");
    return {
      id: String(row.id),
      projectId: String(row.project_id),
      projectName,
      workflowRunId: row.workflow_run_id ? String(row.workflow_run_id) : null,
      agentRole: String(row.agent_role),
      eventType: String(row.event_type),
      message: String(row.message),
      detail: (row.detail as Record<string, unknown>) ?? {},
      ragSourceCount: Number(row.rag_source_count ?? 0),
      handoffTo: row.handoff_to ? String(row.handoff_to) : null,
      humanReviewRequired: Boolean(row.human_review_required),
      createdAt: String(row.created_at),
    };
  });
}

export async function listRecentAgentWorkflowRuns(limit = 5): Promise<AgentWorkflowRunRow[]> {
  const { supabase } = await getOrgContext();

  const { data, error } = await supabase
    .from("agent_workflow_runs")
    .select(
      "id, project_id, status, intent, routed_agents, synthesis, started_at, completed_at, projects!inner(name)",
    )
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    throwIfMissingTable(error, "agent_workflow_runs");
    throw error;
  }

  return (data ?? []).map((row) => {
    const projects = row.projects as { name?: string } | { name?: string }[] | null;
    const projectName = Array.isArray(projects)
      ? (projects[0]?.name ?? "Project")
      : (projects?.name ?? "Project");
    return {
      id: String(row.id),
      projectId: String(row.project_id),
      projectName,
      status: String(row.status),
      intent: row.intent ? String(row.intent) : null,
      routedAgents: (row.routed_agents as string[]) ?? [],
      synthesis: row.synthesis ? String(row.synthesis) : null,
      startedAt: String(row.started_at),
      completedAt: row.completed_at ? String(row.completed_at) : null,
    };
  });
}

export type { AgentOrchestrationEvent, AgentOrchestrationResult, SpecialistAgentRole };
