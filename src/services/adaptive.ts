/**
 * Adaptive façade — Phase 7.
 *
 * Stitches together the signal loader, dependency context, the pure
 * adaptive engine, and the review-audit persistence. Used by both the
 * project page (server component) and the four `/api/adaptive/*` routes.
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
  type AdaptiveSnapshot,
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
// Loop — pulls signals + dependency context, pipes through the engine,
// returns a complete adaptive snapshot for one project.
// ---------------------------------------------------------------------------

export async function runAdaptiveLoop(
  projectId: string,
): Promise<AdaptiveSnapshot> {
  const signals = await loadProjectSignals(projectId);

  // Cross-project dependency failures inform Phase 7 drift + pressure.
  // For now we count incoming dependencies on this project where the upstream
  // is failing — proxied by checking whether ANY incoming dependency exists.
  // When real upstream-health data lands, refine this in one place.
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
    // listDependencies fails gracefully when the Phase 6 tables aren't
    // applied yet — fall back to signal-only inference.
  }

  const data = toExecutionData(signals, { dependencyFailures });

  return {
    data,
    drift: detectDeliveryDrift(data),
    stability: computeStability(data),
    pressure: detectPressure(data),
    scenarios: generateScenarios(data),
    recommendations: generateAdaptiveRecommendations(data),
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
    // Tolerate missing migration during early dev — return empty.
    return [];
  }
  return (data ?? []) as AdaptiveReviewRow[];
}

/**
 * Returns the latest review action per recommendation_key (or null if never
 * reviewed). The UI uses this to mark recommendations as already-actioned.
 */
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
