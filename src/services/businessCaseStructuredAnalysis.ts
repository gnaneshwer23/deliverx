/**
 * PM onboarding — structured business case analysis (server-side workspace apply).
 */

import "server-only";

import type { ProjectStructureDraft } from "@/services/aiProjectStructuring";
import { applyProjectStructure } from "@/services/applyProjectStructure";
import { bulkInsertRequirements } from "@/services/baRequirements";

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
import { acceptedCategoryIds } from "@/lib/businessCaseStructuredAnalysis.shared";

export async function applyBusinessCaseWorkspace(
  projectId: string,
  input: {
    draft: ProjectStructureDraft;
    structuredAnalysis: BusinessCaseStructuredAnalysis;
    projectName: string;
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
    const reqCategory = input.structuredAnalysis.categories.find((c) => c.id === "requirements");
    if (reqCategory?.items.length) {
      const inserted = await bulkInsertRequirements(
        projectId,
        reqCategory.items.map((item) => ({
          type: "functional",
          title: item.title,
          description: item.description,
          quality: { source: "business_case_analysis" },
        })),
        { requireApproval: false },
      );
      requirements = inserted.count;
    }
  }

  return {
    ...structure,
    requirements,
    categoriesApplied: [...accepted] as StructuredCategoryId[],
  };
}
