/**
 * Phase 4 recommendation review persistence (accept / ignore).
 */

import { createClient } from "@/lib/supabase/server";

export type AiReviewAction = "accept" | "ignore";

export type AiReviewRow = {
  recommendation_id: string;
  action: AiReviewAction;
  reviewed_at: string;
};

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

export async function listAiReviews(projectId: string): Promise<AiReviewRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_recommendation_reviews")
    .select("recommendation_id, action, reviewed_at")
    .eq("project_id", projectId);
  if (error) return [];
  return (data ?? []) as AiReviewRow[];
}

export async function recordAiReview(input: {
  projectId: string;
  recommendationId: string;
  action: AiReviewAction;
}) {
  const { supabase, userId, orgId } = await getContext();

  const { data, error } = await supabase
    .from("ai_recommendation_reviews")
    .upsert(
      {
        organisation_id: orgId,
        project_id: input.projectId,
        recommendation_id: input.recommendationId,
        action: input.action,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      },
      { onConflict: "project_id,recommendation_id" },
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
