/**
 * Persist sponsor gateway business case reviews and GO decisions.
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { BusinessCaseReview } from "./aiBusinessCaseReview";
import { refreshProjectDashboards } from "@/lib/dashboard-refresh";
import { emitPlatformEvent } from "./platformWebhooks";

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

  if (input.projectId) {
    refreshProjectDashboards(input.projectId);
  } else {
    revalidatePath("/workspace/dashboard");
    revalidatePath("/workspace/proposals");
    revalidatePath("/workspace/founder");
    revalidatePath("/workspace/product");
    revalidatePath("/workspace/pm-mission");
    revalidatePath("/workspace/ba");
    revalidatePath("/workspace/engineer");
    revalidatePath("/workspace/qa");
    revalidatePath("/workspace/scrum-mission");
  }

  if (input.goDecision === "accepted") {
    void emitPlatformEvent(String(profile.organisation_id), "project.go_decision", {
      reviewId: data.id,
      projectId: input.projectId ?? null,
      recommendation: input.report.recommendation,
      confidence: input.report.recommendationConfidence,
      source: "sponsor_gateway",
    }).catch(() => undefined);
  }

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

  refreshProjectDashboards(projectId);
}

export type BusinessCaseReviewRow = {
  id: string;
  project_id: string | null;
  brief_excerpt: string | null;
  recommendation: string;
  recommendation_confidence: number | null;
  go_decision: string | null;
  decided_at: string | null;
  created_at: string;
  report: Record<string, unknown>;
};

export async function listBusinessCaseReviews(
  limit = 20,
): Promise<Array<BusinessCaseReviewRow & { project_name: string | null }>> {
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
    .select("*, projects(name)")
    .eq("organisation_id", profile.organisation_id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as BusinessCaseReviewRow & { projects: { name: string } | null };
    return {
      id: r.id,
      project_id: r.project_id,
      brief_excerpt: r.brief_excerpt,
      recommendation: r.recommendation,
      recommendation_confidence: r.recommendation_confidence,
      go_decision: r.go_decision,
      decided_at: r.decided_at,
      created_at: r.created_at,
      report: (r.report ?? {}) as Record<string, unknown>,
      project_name: r.projects?.name ?? null,
    };
  });
}
