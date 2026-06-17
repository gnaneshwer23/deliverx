/**
 * Persist sponsor gateway business case reviews and GO decisions.
 */

import { createClient } from "@/lib/supabase/server";
import type { BusinessCaseReview } from "./aiBusinessCaseReview";

export async function saveBusinessCaseReview(input: {
  briefExcerpt: string;
  report: BusinessCaseReview;
  projectId?: string;
  goDecision?: "accepted" | "rejected" | "deferred";
}): Promise<string> {
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

  const { data, error } = await supabase
    .from("business_case_reviews")
    .insert({
      organisation_id: profile.organisation_id,
      user_id: user.id,
      project_id: input.projectId ?? null,
      brief_excerpt: input.briefExcerpt.slice(0, 2000),
      report: input.report,
      recommendation: input.report.recommendation,
      recommendation_confidence: input.report.recommendationConfidence,
      go_decision: input.goDecision ?? null,
      decided_at: input.goDecision ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function linkBusinessCaseReviewToProject(
  reviewId: string,
  projectId: string,
  goDecision: "accepted" | "rejected" | "deferred",
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("business_case_reviews")
    .update({
      project_id: projectId,
      go_decision: goDecision,
      decided_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

  if (error) throw error;
}
