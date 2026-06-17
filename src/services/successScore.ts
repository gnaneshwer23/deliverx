/**
 * Delivery success score façade — aggregates signals and persists snapshots.
 */

import { createClient } from "@/lib/supabase/server";
import { getProjectIntelligence } from "./intelligence";
import { getProjectAlignment } from "./alignment";
import { getDeliveryForecast } from "./deliveryForecast";
import {
  approvedEstimationSummary,
  listEstimationPacks,
} from "./estimationPacks";
import {
  computeDeliverySuccessScore,
  type DeliverySuccessScore,
} from "./successScoreEngine";

export type { DeliverySuccessScore } from "./successScoreEngine";

export async function getProjectSuccessScore(
  projectId: string,
): Promise<DeliverySuccessScore> {
  const [intelligence, alignment, forecast, packs] = await Promise.all([
    getProjectIntelligence(projectId),
    getProjectAlignment(projectId),
    getDeliveryForecast(projectId).catch(() => null),
    listEstimationPacks(projectId).catch(() => []),
  ]);

  const { avgConfidence } = approvedEstimationSummary(packs);

  return computeDeliverySuccessScore({
    healthScore: intelligence.health.score,
    deliveryConfidence: intelligence.confidence.score,
    alignmentScore: alignment.score,
    forecastConfidence: forecast?.confidence ?? intelligence.confidence.score / 100,
    delayDays: forecast?.delayDays ?? 0,
    approvedEstimationConfidence: avgConfidence,
  });
}

export async function persistSuccessScoreSnapshot(
  projectId: string,
  score: DeliverySuccessScore,
): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("users")
      .select("organisation_id")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.organisation_id) return;

    await supabase.from("delivery_success_scores").insert({
      organisation_id: profile.organisation_id,
      project_id: projectId,
      score: score.score,
      tier: score.tier,
      components: score.components,
      factors: score.factors,
    });
  } catch {
    /* table may not exist yet */
  }
}

export async function listOrgSuccessScores(limit = 6): Promise<
  Array<{
    projectId: string;
    projectName: string;
    score: DeliverySuccessScore;
  }>
> {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (!projects?.length) return [];

  const results = await Promise.all(
    projects.map(async (p) => {
      try {
        const score = await getProjectSuccessScore(p.id);
        return { projectId: p.id, projectName: p.name, score };
      } catch {
        return null;
      }
    }),
  );

  return results.filter((r): r is NonNullable<typeof r> => r !== null);
}
