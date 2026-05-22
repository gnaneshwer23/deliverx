/**
 * Twin façade — Phase 8.
 *
 * Composes outputs of the Phase 6 portfolio façade + Phase 7 adaptive
 * façade into a single DigitalTwinState. Provides simulate / optimise /
 * snapshot persistence. Snapshot history lives in `twin_snapshots`
 * (migration 0005).
 */

import { createClient } from "@/lib/supabase/server";
import {
  buildTwinState,
  detectCascadingFailures,
  optimizeExecution,
  simulateScenario,
  buildEnterpriseGraph,
  type DigitalTwinState,
  type SimulationInput,
  type SimulationResult,
  type TwinProjectSnapshot,
  type OptimizationAction,
  type CascadingFailure,
  type EnterpriseGraph,
} from "./twinEngine";
import {
  listDependencies,
  listProgrammes,
  listProjectsForOrg,
} from "./portfolio";
import { loadProjectSignals } from "./projectSignals";
import {
  computeProjectHealth,
  computeDeliveryConfidence,
} from "./intelligenceEngine";
import {
  toExecutionData,
  computeStability,
} from "./adaptiveEngine";
import type { DependencyEdge } from "./dependencyEngine";

// ---------------------------------------------------------------------------
// Auth helper
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
// Hydrate per-project snapshot
// ---------------------------------------------------------------------------

async function enrichProject(row: {
  id: string;
  name: string;
  programme_id: string | null;
}): Promise<TwinProjectSnapshot> {
  const signals = await loadProjectSignals(row.id);
  const health = computeProjectHealth(signals);
  const confidence = computeDeliveryConfidence(signals);
  const data = toExecutionData(signals, {
    dependencyFailures: signals.dependencyDelay ? 1 : 0,
  });
  const stability = computeStability(data);

  const taskDelayRate =
    signals.totalTasks > 0
      ? Math.min(1, signals.overdueTasks / signals.totalTasks)
      : 0;

  return {
    id: row.id,
    name: row.name,
    programmeId: row.programme_id,
    health: health.score,
    confidence: confidence.score,
    stability: stability.score,
    blockers: signals.blockers,
    velocity: signals.velocity,
    taskDelayRate,
    milestoneDelay: signals.milestoneDelay,
    dependencyRisk: data.dependencyRisk,
  };
}

// ---------------------------------------------------------------------------
// Org-wide telemetry loader (the State Builder)
// ---------------------------------------------------------------------------

async function loadOrgWideInputs(): Promise<{
  programmes: { id: string; name: string; status: string }[];
  projects: TwinProjectSnapshot[];
  dependencies: DependencyEdge[];
  reviewBehaviour: {
    totalReviews: number;
    approvedCount: number;
    rejectedCount: number;
    ignoredCount: number;
  };
  approxTeamCount: number;
}> {
  const supabase = await createClient();

  // Programmes (tolerate missing migration 0003).
  let programmes: { id: string; name: string; status: string }[] = [];
  try {
    const rows = await listProgrammes();
    programmes = rows.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
    }));
  } catch {
    programmes = [];
  }

  // Projects.
  const projectRows = await listProjectsForOrg();
  const projects = await Promise.all(projectRows.map(enrichProject));

  // Dependencies.
  let dependencies: DependencyEdge[] = [];
  try {
    const deps = await listDependencies();
    dependencies = deps.map((d) => ({
      id: d.id,
      sourceProjectId: d.source_project_id,
      targetProjectId: d.target_project_id,
      type: d.dependency_type,
      severity: d.severity,
    }));
  } catch {
    dependencies = [];
  }

  // Review behaviour (Phase 7 audit table).
  let reviewBehaviour = {
    totalReviews: 0,
    approvedCount: 0,
    rejectedCount: 0,
    ignoredCount: 0,
  };
  try {
    const { data } = await supabase
      .from("adaptive_recommendation_reviews")
      .select("action");
    for (const row of (data ?? []) as Array<{ action: string }>) {
      reviewBehaviour.totalReviews += 1;
      if (row.action === "approved" || row.action === "approved_with_edit") {
        reviewBehaviour.approvedCount += 1;
      } else if (row.action === "rejected") {
        reviewBehaviour.rejectedCount += 1;
      } else if (row.action === "ignored") {
        reviewBehaviour.ignoredCount += 1;
      }
    }
  } catch {
    /* table not applied yet */
  }

  // Approx team count — from public.users in this org.
  let approxTeamCount = 8;
  try {
    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true });
    if (count && count > 0) approxTeamCount = count;
  } catch {
    /* ignore */
  }

  return {
    programmes,
    projects,
    dependencies,
    reviewBehaviour,
    approxTeamCount,
  };
}

// ---------------------------------------------------------------------------
// Public façade
// ---------------------------------------------------------------------------

export async function getTwinState(): Promise<DigitalTwinState> {
  const inputs = await loadOrgWideInputs();
  return buildTwinState(inputs);
}

export type EnterpriseSnapshot = {
  state: DigitalTwinState;
  cascading: CascadingFailure[];
  optimization: OptimizationAction[];
  graph: EnterpriseGraph;
};

/** Runs the full Phase 8 enterprise loop: state → cascades → optimisation → graph. */
export async function runEnterpriseLoop(): Promise<EnterpriseSnapshot> {
  const inputs = await loadOrgWideInputs();
  const state = buildTwinState(inputs);
  const cascading = detectCascadingFailures(state, inputs.dependencies);
  const optimization = optimizeExecution(state);
  const graph = buildEnterpriseGraph(state, inputs.dependencies);
  return { state, cascading, optimization, graph };
}

export async function simulate(
  input: SimulationInput,
): Promise<SimulationResult> {
  const state = await getTwinState();
  return simulateScenario(state, input);
}

// ---------------------------------------------------------------------------
// Snapshot persistence (cron / event-trigger entry point)
// ---------------------------------------------------------------------------

export async function saveTwinSnapshot(): Promise<{ id: string } | null> {
  const { supabase, userId, orgId } = await getContext();
  const state = await getTwinState();

  const { data, error } = await supabase
    .from("twin_snapshots")
    .insert({
      organisation_id: orgId,
      state,
      captured_by: userId,
    })
    .select("id")
    .single();

  if (error) return null;
  return data as { id: string };
}

export async function listTwinSnapshots(
  limit = 20,
): Promise<Array<{ id: string; captured_at: string; state: DigitalTwinState }>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("twin_snapshots")
    .select("id, captured_at, state")
    .order("captured_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as Array<{
    id: string;
    captured_at: string;
    state: DigitalTwinState;
  }>;
}
