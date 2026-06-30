/**
 * Honest workspace-flow snapshots for PM / BA dashboards — real extraction data only.
 */

import { createClient } from "@/lib/supabase/server";
import type { BusinessCaseReview } from "@/services/aiBusinessCaseReview";
import { buildStructuredAnalysisFromReview } from "@/services/businessCaseStructuredAnalysis";
import { getRequirementStats } from "@/services/baRequirements";
import {
  getProjectBusinessCaseStatus,
  type ProjectBusinessCaseStatus,
} from "@/services/projectBusinessCaseFlow";
import { computeTraceabilityScore } from "@/services/baRequirementEngine";
import {
  buildExtractionCounts,
  type ExtractionSummaryCounts,
} from "@/lib/workspace-flow-extraction";

export type { ExtractionSummaryCounts } from "@/lib/workspace-flow-extraction";
export { buildExtractionCounts, formatExtractionCount } from "@/lib/workspace-flow-extraction";

export type WorkspaceFlowSnapshot = {
  businessCase: ProjectBusinessCaseStatus;
  counts: ExtractionSummaryCounts;
  nothingAppliedYet: boolean;
  charterTitle: string | null;
  aiSummary: string | null;
  pendingReviewId: string | null;
};

function parseBusinessCaseReport(raw: Record<string, unknown> | null | undefined): BusinessCaseReview | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as BusinessCaseReview;
}

async function getLatestBusinessCaseReview(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("business_case_reviews")
    .select("report, brief_excerpt, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    report: parseBusinessCaseReport(data.report as Record<string, unknown>),
    briefExcerpt: (data.brief_excerpt as string | null) ?? null,
  };
}

export async function getWorkspaceFlowSnapshot(
  projectId: string,
): Promise<WorkspaceFlowSnapshot> {
  const [businessCase, stats, review] = await Promise.all([
    getProjectBusinessCaseStatus(projectId),
    getRequirementStats(projectId).catch(() => null),
    getLatestBusinessCaseReview(projectId),
  ]);

  const traceabilityScore =
    stats && stats.extracted > 0
      ? computeTraceabilityScore({
          requirements: stats.extracted,
          approvedRequirements: stats.approved,
          stories: stats.stories.length,
          linkedTasks: stats.linkedTasks,
        })
      : null;

  const structuredAnalysis = review?.report
    ? buildStructuredAnalysisFromReview(review.report, review.briefExcerpt ?? undefined)
    : null;

  const counts = buildExtractionCounts({
    requirementsExtracted: stats?.extracted ?? 0,
    traceabilityScore,
    report: review?.report ?? null,
    structuredAnalysis,
  });

  const nothingAppliedYet = (stats?.extracted ?? 0) === 0 && (stats?.approved ?? 0) === 0;

  const aiSummary =
    review?.report?.executiveSummary?.trim() ||
    review?.report?.summary?.trim() ||
    businessCase.charterExcerpt ||
    null;

  return {
    businessCase,
    counts,
    nothingAppliedYet,
    charterTitle: businessCase.pendingReviewTitle,
    aiSummary,
    pendingReviewId: businessCase.pendingReviewId,
  };
}
