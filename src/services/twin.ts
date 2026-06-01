/**
 * Twin façade — Phase 8.
 *
 * Composes outputs of the Phase 6 portfolio façade + Phase 7 adaptive
 * façade into a single DigitalTwinState. Provides simulate / optimise /
 * snapshot persistence. Snapshot history lives in `twin_snapshots`
 * (migration 0005).
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
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
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw profileError;
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

async function enrichProject(
  row: {
    id: string;
    name: string;
    programme_id: string | null;
  },
  supabase?: SupabaseClient,
): Promise<TwinProjectSnapshot> {
  const signals = await loadProjectSignals(row.id, supabase);
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

async function loadOrgWideInputsForOrg(
  orgId: string,
  supabase: SupabaseClient,
): Promise<{
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
  let programmes: { id: string; name: string; status: string }[] = [];
  try {
    const { data } = await supabase
      .from("programmes")
      .select("id, name, status")
      .eq("organisation_id", orgId)
      .order("created_at", { ascending: true });
    programmes = (data ?? []) as typeof programmes;
  } catch {
    programmes = [];
  }

  const { data: projectRows } = await supabase
    .from("projects")
    .select("id, name, programme_id")
    .eq("organisation_id", orgId)
    .order("created_at", { ascending: false });

  const projects = await Promise.all(
    ((projectRows ?? []) as Array<{ id: string; name: string; programme_id: string | null }>).map(
      (row) => enrichProject(row, supabase),
    ),
  );

  let dependencies: DependencyEdge[] = [];
  try {
    const { data: deps } = await supabase
      .from("cross_project_dependencies")
      .select("*")
      .eq("organisation_id", orgId)
      .order("created_at", { ascending: false });
    dependencies = ((deps ?? []) as Array<{
      id: string;
      source_project_id: string;
      target_project_id: string;
      dependency_type: DependencyEdge["type"];
      severity: DependencyEdge["severity"];
    }>).map((d) => ({
      id: d.id,
      sourceProjectId: d.source_project_id,
      targetProjectId: d.target_project_id,
      type: d.dependency_type,
      severity: d.severity,
    }));
  } catch {
    dependencies = [];
  }

  const reviewBehaviour = {
    totalReviews: 0,
    approvedCount: 0,
    rejectedCount: 0,
    ignoredCount: 0,
  };
  try {
    const { data } = await supabase
      .from("adaptive_recommendation_reviews")
      .select("action")
      .eq("organisation_id", orgId);
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

  let approxTeamCount = 8;
  try {
    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", orgId);
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

async function loadOrgWideInputs() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile?.organisation_id) throw new Error("No organisation");
  return loadOrgWideInputsForOrg(profile.organisation_id as string, supabase);
}

// ---------------------------------------------------------------------------
// Public façade
// ---------------------------------------------------------------------------

export async function getTwinState(): Promise<DigitalTwinState> {
  const inputs = await loadOrgWideInputs();
  return buildTwinState(inputs);
}

/** Org-scoped twin state (cron / admin jobs). */
export async function getTwinStateForOrg(
  orgId: string,
  supabase: SupabaseClient,
): Promise<DigitalTwinState> {
  const inputs = await loadOrgWideInputsForOrg(orgId, supabase);
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
  const inputs = await loadOrgWideInputsForOrg(orgId, supabase);
  const state = buildTwinState(inputs);

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

/** Cron entry point — snapshots every org using the service-role client. */
export async function captureAllTwinSnapshots(): Promise<{
  captured: number;
  orgs: number;
}> {
  const admin = createAdminClient();
  const { data: orgs, error } = await admin.from("organisations").select("id");
  if (error) throw error;

  let captured = 0;
  for (const org of orgs ?? []) {
    const inputs = await loadOrgWideInputsForOrg(org.id, admin);
    const state = buildTwinState(inputs);
    const { error: insertError } = await admin.from("twin_snapshots").insert({
      organisation_id: org.id,
      state,
      captured_by: null,
    });
    if (!insertError) captured += 1;
  }

  return { captured, orgs: orgs?.length ?? 0 };
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
