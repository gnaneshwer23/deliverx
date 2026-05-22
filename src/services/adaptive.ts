/**
 * Adaptive façade — Phase 7 with reasoning context.
 *
 * Loads signals + memory + dependency context + cumulative PM review
 * outcomes, then pipes everything through the pure engine. This is the
 * surface the rest of the app (RSCs + API routes + cron) consumes.
 */

import { createClient } from "@/lib/supabase/server";
import { loadProjectSignals } from "./projectSignals";
import {
  toExecutionData,
  detectDeliveryDrift,
  computeStability,
  detectPressure,
  generateAdaptiveRecommendations,
  generateScenarios,
  detectPatterns,
  interpretExecution,
  type AdaptiveSnapshot,
  type RecommendationContext,
} from "./adaptiveEngine";
import { listDependencies } from "./portfolio";

// ---------------------------------------------------------------------------
// Review row + types
// ---------------------------------------------------------------------------

export type AdaptiveReviewAction =
  | "approved"
  | "approved_with_edit"
  | "rejected"
  | "ignored";

export type AdaptiveReviewRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  recommendation_key: string;
  action: AdaptiveReviewAction;
  original_action_text: string | null;
  edited_action_text: string | null;
  rationale: string | null;
  reviewed_by: string | null;
  reviewed_at: string;
};

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
// Step 8/9 — feedback aggregation (org-wide, per recommendation_key)
//
// Counts approve/reject decisions per recommendation key so the engine can
// bias future confidence with real PM behaviour. "Ignored" carries no
// signal — counted in sampleSize but not approve/reject.
// ---------------------------------------------------------------------------

export type ReviewStats = {
  approved: number;
  rejected: number;
  sampleSize: number;
};

export async function aggregateReviewsByKey(): Promise<
  Map<string, ReviewStats>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("adaptive_recommendation_reviews")
    .select("recommendation_key, action");

  if (error) return new Map();

  const map = new Map<string, ReviewStats>();
  for (const row of (data ?? []) as Array<{
    recommendation_key: string;
    action: AdaptiveReviewAction;
  }>) {
    const stats =
      map.get(row.recommendation_key) ?? { approved: 0, rejected: 0, sampleSize: 0 };
    stats.sampleSize += 1;
    if (row.action === "approved" || row.action === "approved_with_edit") {
      stats.approved += 1;
    } else if (row.action === "rejected") {
      stats.rejected += 1;
    }
    map.set(row.recommendation_key, stats);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Context builder — turns project + org metadata into a RecommendationContext
// ---------------------------------------------------------------------------

async function buildRecommendationContext(
  projectId: string,
): Promise<RecommendationContext> {
  const supabase = await createClient();

  // 1. Project metadata
  const { data: project } = await supabase
    .from("projects")
    .select("delivery_type, organisations(industry, delivery_type)")
    .eq("id", projectId)
    .single();

  const projectType =
    project?.delivery_type ??
    (project?.organisations as { delivery_type?: string } | null)?.delivery_type ??
    null;
  const industry =
    (project?.organisations as { industry?: string } | null)?.industry ?? null;

  // 2. Relevant tags from organisational memory (Phase 5)
  let relevantTags: string[] = [];
  try {
    const { data: memory } = await supabase
      .from("organisational_memory")
      .select("tags")
      .limit(50);
    const counts = new Map<string, number>();
    for (const row of (memory ?? []) as Array<{ tags: string[] }>) {
      for (const tag of row.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    relevantTags = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([tag]) => tag);
  } catch {
    /* memory table may not be applied yet */
  }

  // 3. Org-wide review aggregates (feedback loop)
  const historicalSuccessByKey = await aggregateReviewsByKey();

  // 4. Programme importance hint — derived from associated programme status
  let programmeImportance: RecommendationContext["programmeImportance"] = "medium";
  try {
    const { data: row } = await supabase
      .from("projects")
      .select("programmes(status)")
      .eq("id", projectId)
      .single();
    const status = (row?.programmes as { status?: string } | null)?.status;
    if (status === "active") programmeImportance = "high";
    else if (status === "paused" || status === "cancelled")
      programmeImportance = "low";
  } catch {
    /* programmes table may not be applied yet */
  }

  return {
    projectType,
    orgGovernanceStyle: industry,
    relevantTags,
    historicalSuccessByKey,
    programmeImportance,
  };
}

// ---------------------------------------------------------------------------
// Loop — full reasoning pipeline for one project
// ---------------------------------------------------------------------------

export async function runAdaptiveLoop(
  projectId: string,
): Promise<AdaptiveSnapshot> {
  const signals = await loadProjectSignals(projectId);

  // Cross-project dependency context.
  let dependencyFailures = signals.dependencyDelay ? 1 : 0;
  try {
    const deps = await listDependencies({ projectIds: [projectId] });
    const incoming = deps.filter((d) => d.target_project_id === projectId);
    dependencyFailures = Math.max(
      dependencyFailures,
      incoming.filter((d) => d.severity === "high" || d.severity === "critical")
        .length,
    );
  } catch {
    /* Phase 6 tables not applied yet — fall back to signal-only inference */
  }

  const data = toExecutionData(signals, { dependencyFailures });
  const context = await buildRecommendationContext(projectId);

  const patterns = detectPatterns(data);
  const interpretation = interpretExecution(data, patterns, context);

  return {
    data,
    patterns,
    interpretation,
    drift: detectDeliveryDrift(data),
    stability: computeStability(data),
    pressure: detectPressure(data),
    scenarios: generateScenarios(data),
    recommendations: generateAdaptiveRecommendations(data, context),
  };
}

// ---------------------------------------------------------------------------
// Review persistence (guardrail: every action is human-mediated)
// ---------------------------------------------------------------------------

export async function recordReview(input: {
  projectId: string;
  recommendationKey: string;
  action: AdaptiveReviewAction;
  originalActionText: string;
  editedActionText?: string | null;
  rationale?: string | null;
}): Promise<AdaptiveReviewRow> {
  const { supabase, userId, orgId } = await getContext();

  const { data, error } = await supabase
    .from("adaptive_recommendation_reviews")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      recommendation_key: input.recommendationKey,
      action: input.action,
      original_action_text: input.originalActionText,
      edited_action_text: input.editedActionText ?? null,
      rationale: input.rationale ?? null,
      reviewed_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as AdaptiveReviewRow;
}

export async function listReviewsForProject(
  projectId: string,
): Promise<AdaptiveReviewRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("adaptive_recommendation_reviews")
    .select("*")
    .eq("project_id", projectId)
    .order("reviewed_at", { ascending: false });
  if (error) {
    return [];
  }
  return (data ?? []) as AdaptiveReviewRow[];
}

/** Latest review per recommendation_key for one project. */
export async function latestReviewByKey(
  projectId: string,
): Promise<Map<string, AdaptiveReviewRow>> {
  const reviews = await listReviewsForProject(projectId);
  const map = new Map<string, AdaptiveReviewRow>();
  for (const r of reviews) {
    if (!map.has(r.recommendation_key)) map.set(r.recommendation_key, r);
  }
  return map;
}
