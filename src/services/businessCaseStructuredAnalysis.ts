/**
 * PM onboarding — structured business case analysis (requirements · objectives · risks · scope · timeline).
 */

import type { BusinessCaseReview } from "@/services/aiBusinessCaseReview";
import type { ProjectStructureDraft } from "@/services/aiProjectStructuring";
import { applyProjectStructure } from "@/services/applyProjectStructure";
import { bulkInsertRequirements } from "@/services/baRequirements";

export type StructuredCategoryId =
  | "requirements"
  | "objectives"
  | "risks"
  | "scope"
  | "timeline";

export type StructuredCategoryDecision = "pending" | "accepted" | "edited" | "rejected";

export type StructuredCategoryItem = {
  id: string;
  title: string;
  description: string;
};

export type StructuredCategory = {
  id: StructuredCategoryId;
  label: string;
  items: StructuredCategoryItem[];
  decision: StructuredCategoryDecision;
};

export type BusinessCaseStructuredAnalysis = {
  categories: StructuredCategory[];
  summary: string;
};

export type BusinessCaseWorkspaceApplyResult = {
  workstreams: number;
  tasks: number;
  raidItems: number;
  milestones: number;
  requirements: number;
  categoriesApplied: StructuredCategoryId[];
};

const CATEGORY_LABELS: Record<StructuredCategoryId, string> = {
  requirements: "Requirements",
  objectives: "Objectives",
  risks: "Risks",
  scope: "Scope",
  timeline: "Timeline",
};

function slugId(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`;
}

function uniqueItems(items: StructuredCategoryItem[]): StructuredCategoryItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildRequirementsCategory(review: BusinessCaseReview): StructuredCategoryItem[] {
  const items: StructuredCategoryItem[] = [];

  if (review.suggestedGoal?.trim()) {
    items.push({
      id: slugId("req", 0),
      title: review.suggestedGoal.trim(),
      description: "Primary programme objective from business case.",
    });
  }

  review.gaps.slice(0, 6).forEach((gap, index) => {
    items.push({
      id: slugId("req", items.length),
      title: gap,
      description: "Gap identified during business case review — needs requirement definition.",
    });
  });

  review.clarificationQuestions.slice(0, 4).forEach((question) => {
    items.push({
      id: slugId("req", items.length),
      title: question,
      description: "Clarification needed before requirements can be finalised.",
    });
  });

  review.missingInformation.slice(0, 3).forEach((info) => {
    items.push({
      id: slugId("req", items.length),
      title: info,
      description: "Missing information flagged in business case analysis.",
    });
  });

  return uniqueItems(items);
}

function buildObjectivesCategory(review: BusinessCaseReview): StructuredCategoryItem[] {
  const items: StructuredCategoryItem[] = [];

  review.recommendationReasons.slice(0, 5).forEach((reason, index) => {
    items.push({
      id: slugId("obj", index),
      title: reason,
      description: "Investment rationale from business case review.",
    });
  });

  review.strengths.slice(0, 4).forEach((strength) => {
    items.push({
      id: slugId("obj", items.length),
      title: strength,
      description: "Strength supporting delivery objectives.",
    });
  });

  if (items.length === 0 && review.suggestedGoal?.trim()) {
    items.push({
      id: slugId("obj", 0),
      title: review.suggestedGoal.trim(),
      description: "Suggested programme goal.",
    });
  }

  return uniqueItems(items);
}

function buildRisksCategory(review: BusinessCaseReview): StructuredCategoryItem[] {
  const items: StructuredCategoryItem[] = [];

  review.initialRisks.slice(0, 6).forEach((risk, index) => {
    items.push({
      id: slugId("risk", index),
      title: risk,
      description: "Initial risk from business case.",
    });
  });

  review.raidSeed.slice(0, 6).forEach((seed) => {
    items.push({
      id: slugId("risk", items.length),
      title: seed.title,
      description: `${seed.type} · ${seed.severity} severity`,
    });
  });

  return uniqueItems(items);
}

function buildScopeCategory(review: BusinessCaseReview, briefExcerpt?: string): StructuredCategoryItem[] {
  const items: StructuredCategoryItem[] = [];

  if (review.executiveSummary?.trim()) {
    items.push({
      id: slugId("scope", 0),
      title: "Programme scope summary",
      description: review.executiveSummary.trim(),
    });
  }

  if (review.suggestedDeliveryType?.trim()) {
    items.push({
      id: slugId("scope", items.length),
      title: `Delivery type: ${review.suggestedDeliveryType.trim()}`,
      description: review.summary?.trim() || "Delivery approach from business case.",
    });
  }

  review.strengths.slice(0, 2).forEach((strength) => {
    items.push({
      id: slugId("scope", items.length),
      title: `In scope: ${strength}`,
      description: "Capability within programme boundary.",
    });
  });

  if (items.length === 0 && briefExcerpt?.trim()) {
    items.push({
      id: slugId("scope", 0),
      title: "Business case scope",
      description: briefExcerpt.trim().slice(0, 400),
    });
  }

  return uniqueItems(items);
}

function buildTimelineCategory(review: BusinessCaseReview): StructuredCategoryItem[] {
  const items: StructuredCategoryItem[] = [];
  const breakdown = review.deliveryConfidenceBreakdown;

  if (breakdown) {
    items.push({
      id: slugId("time", 0),
      title: "Delivery confidence",
      description: `Timeline ${breakdown.timelineConfidence}% · Budget ${breakdown.budgetConfidence}% · Success ${breakdown.successProbability}%`,
    });
  }

  review.scenarios.slice(0, 4).forEach((scenario, index) => {
    items.push({
      id: slugId("time", items.length),
      title: scenario.title,
      description: `Delay ${scenario.deliveryDelayWeeks}w · Cost ${scenario.costReductionPct}% · ${scenario.revenueImpact}`,
    });
  });

  const fin = review.financialIntelligence;
  if (fin?.breakEvenMonths) {
    items.push({
      id: slugId("time", items.length),
      title: `Break-even target: ${fin.breakEvenMonths} months`,
      description: `Dev cost ${fin.currency} ${fin.devCostMin.toLocaleString()}–${fin.devCostMax.toLocaleString()}`,
    });
  }

  if (items.length === 0) {
    items.push({
      id: slugId("time", 0),
      title: "Timeline to be confirmed",
      description: "No explicit milestones in business case — define after PM review.",
    });
  }

  return uniqueItems(items);
}

export function buildStructuredAnalysisFromReview(
  review: BusinessCaseReview,
  briefExcerpt?: string,
): BusinessCaseStructuredAnalysis {
  const categories: StructuredCategory[] = (
    [
      ["requirements", buildRequirementsCategory(review)],
      ["objectives", buildObjectivesCategory(review)],
      ["risks", buildRisksCategory(review)],
      ["scope", buildScopeCategory(review, briefExcerpt)],
      ["timeline", buildTimelineCategory(review)],
    ] as const
  ).map(([id, items]) => ({
    id,
    label: CATEGORY_LABELS[id],
    items,
    decision: "pending" as const,
  }));

  return {
    categories,
    summary:
      review.executiveSummary?.trim() ||
      review.summary?.trim() ||
      "Business case analysis ready for PM review.",
  };
}

export function structuredAnalysisToProjectDraft(
  analysis: BusinessCaseStructuredAnalysis,
  projectName: string,
): ProjectStructureDraft {
  const byId = new Map(analysis.categories.map((c) => [c.id, c]));
  const scope = byId.get("scope");
  const risks = byId.get("risks");
  const timeline = byId.get("timeline");
  const objectives = byId.get("objectives");

  const workstreamName = `${projectName} delivery`;
  const scopeDescription =
    scope?.items.map((i) => i.description || i.title).join(" · ") ||
    "Scope from approved business case.";

  const workstreams = [
    {
      name: workstreamName,
      description: scopeDescription.slice(0, 500),
      status: "planned" as const,
    },
  ];

  const tasks =
    objectives?.items.slice(0, 5).map((item) => ({
      title: item.title,
      description: item.description,
      workstreamName,
      status: "todo" as const,
      priority: "medium" as const,
    })) ?? [];

  const raidItems =
    risks?.items.slice(0, 8).map((item) => ({
      type: "risk" as const,
      title: item.title,
      description: item.description,
      severity: "medium" as const,
    })) ?? [];

  const milestones =
    timeline?.items.slice(0, 4).map((item, index) => ({
      title: item.title,
      description: item.description,
      targetDate: null,
      confidenceScore: Math.max(50, 90 - index * 10),
    })) ?? [];

  return {
    workstreams,
    tasks,
    raidItems,
    milestones,
    stakeholders: [],
    decisions: [],
    changeRequests: [],
    benefits: [],
    governanceModel: "PM-led delivery with approval-gated AI outputs",
  };
}

export function buildBusinessCaseReviewPayload(input: {
  review: BusinessCaseReview;
  briefExcerpt: string;
  projectName: string;
  extractionStatus: string;
}): Record<string, unknown> {
  const structuredAnalysis = buildStructuredAnalysisFromReview(
    input.review,
    input.briefExcerpt,
  );
  const draft = structuredAnalysisToProjectDraft(structuredAnalysis, input.projectName);

  return {
    extractionStatus: input.extractionStatus,
    recommendation: input.review.recommendation,
    score: input.review.score,
    briefExcerpt: input.briefExcerpt,
    projectName: input.projectName,
    structuredAnalysis,
    draft,
    review: input.review,
  };
}

export function allCategoriesResolved(analysis: BusinessCaseStructuredAnalysis): boolean {
  return analysis.categories.every(
    (c) => c.decision === "accepted" || c.decision === "edited" || c.decision === "rejected",
  );
}

export function categoriesReadyToApply(analysis: BusinessCaseStructuredAnalysis): boolean {
  return analysis.categories.some(
    (c) => c.decision === "accepted" || c.decision === "edited",
  );
}

export function acceptedCategoryIds(
  analysis: BusinessCaseStructuredAnalysis,
): StructuredCategoryId[] {
  return analysis.categories
    .filter((c) => c.decision === "accepted" || c.decision === "edited")
    .map((c) => c.id);
}

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
    categoriesApplied: [...accepted],
  };
}

export function structuredAnalysisCounts(
  analysis: BusinessCaseStructuredAnalysis | null | undefined,
): {
  requirements: number | null;
  objectives: number | null;
  risks: number | null;
  scope: number | null;
  timeline: number | null;
} {
  if (!analysis) {
    return {
      requirements: null,
      objectives: null,
      risks: null,
      scope: null,
      timeline: null,
    };
  }

  const count = (id: StructuredCategoryId) => {
    const cat = analysis.categories.find((c) => c.id === id);
    return cat?.items.length ?? null;
  };

  return {
    requirements: count("requirements"),
    objectives: count("objectives"),
    risks: count("risks"),
    scope: count("scope"),
    timeline: count("timeline"),
  };
}
