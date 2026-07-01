/**
 * PM onboarding — structured business case analysis (server-side workspace apply).
 */

import type { BusinessCaseReview } from "@/services/aiBusinessCaseReview";
import type { ProjectStructureDraft } from "@/services/aiProjectStructuring";
import { applyProjectStructure } from "@/services/applyProjectStructure";
import {
  bulkInsertClarificationGaps,
  bulkInsertRequirements,
} from "@/services/baRequirements";

export type {
  BusinessCaseStructuredAnalysis,
  BusinessCaseWorkspaceApplyResult,
  StructuredCategory,
  StructuredCategoryDecision,
  StructuredCategoryId,
  StructuredCategoryItem,
} from "@/lib/businessCaseStructuredAnalysis.shared";

export {
  acceptedCategoryIds,
  allCategoriesResolved,
  buildBusinessCaseReviewPayload,
  buildClarificationGapSeedRows,
  buildStructuredAnalysisFromReview,
  categoriesReadyToApply,
  structuredAnalysisCounts,
  structuredAnalysisToProjectDraft,
} from "@/lib/businessCaseStructuredAnalysis.shared";

import type {
  BusinessCaseStructuredAnalysis,
  BusinessCaseWorkspaceApplyResult,
  StructuredCategoryId,
} from "@/lib/businessCaseStructuredAnalysis.shared";
import {
  acceptedCategoryIds,
  buildClarificationGapSeedRows,
} from "@/lib/businessCaseStructuredAnalysis.shared";

export async function seedRequirementsFromStructuredAnalysis(
  projectId: string,
  structuredAnalysis: BusinessCaseStructuredAnalysis,
  options?: { businessCaseReviewId?: string; requireApproval?: boolean },
): Promise<{ count: number; ids: string[] }> {
  const reqCategory = structuredAnalysis.categories.find((c) => c.id === "requirements");
  if (!reqCategory?.items.length) return { count: 0, ids: [] };

  return bulkInsertRequirements(
    projectId,
    reqCategory.items.map((item) => ({
      type: "functional",
      title: item.title,
      description: item.description,
      quality: { source: "business_case_analysis", clarity: 70, completeness: 65, testability: 60, alignment: 75, riskLevel: "medium" },
      structuredItemId: item.id,
      businessCaseReviewId: options?.businessCaseReviewId,
    })),
    { requireApproval: options?.requireApproval ?? false },
  );
}

export async function seedClarificationGapsFromReview(
  projectId: string,
  review: BusinessCaseReview,
  options?: { businessCaseReviewId?: string },
): Promise<number> {
  const rows = buildClarificationGapSeedRows(review);
  return bulkInsertClarificationGaps(
    projectId,
    rows.map((row) => ({
      title: row.title,
      description: row.description,
      gapType: row.gapType,
      priority: row.priority,
      structuredItemId: row.structuredItemId,
      businessCaseReviewId: options?.businessCaseReviewId,
    })),
  );
}

export async function applyBusinessCaseWorkspace(
  projectId: string,
  input: {
    draft: ProjectStructureDraft;
    structuredAnalysis: BusinessCaseStructuredAnalysis;
    projectName: string;
    businessCaseReviewId?: string;
    review?: BusinessCaseReview;
  },
): Promise<BusinessCaseWorkspaceApplyResult> {
  const accepted = new Set(acceptedCategoryIds(input.structuredAnalysis));
  const filteredDraft: ProjectStructureDraft = {
    ...input.draft,
    workstreams: accepted.has("scope") ? input.draft.workstreams : [],
    tasks: accepted.has("objectives") ? input.draft.tasks : [],
    raidItems: accepted.has("risks") ? input.draft.raidItems : [],
    milestones: accepted.has("timeline") ? input.draft.milestones : [],
  };

  const structure = await applyProjectStructure(projectId, filteredDraft);

  let requirements = 0;
  if (accepted.has("requirements")) {
    const inserted = await seedRequirementsFromStructuredAnalysis(
      projectId,
      input.structuredAnalysis,
      { businessCaseReviewId: input.businessCaseReviewId },
    );
    requirements = inserted.count;
  }

  if (input.review) {
    await seedClarificationGapsFromReview(projectId, input.review, {
      businessCaseReviewId: input.businessCaseReviewId,
    }).catch(() => 0);
  }

  return {
    ...structure,
    requirements,
    categoriesApplied: [...accepted] as StructuredCategoryId[],
  };
}
