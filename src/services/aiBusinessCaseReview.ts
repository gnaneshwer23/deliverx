import { generateJSON } from "@/lib/ai/anthropic";
import {
  businessCaseReviewPrompt,
  businessCaseReviewSystem,
} from "@/lib/ai/prompts/business-case-review";
import type { OrganisationIndustryInput } from "@/lib/ai/prompts/business-case-industry";
import type { BusinessCaseRecommendation } from "@/lib/business-case/constants";

export type { BusinessCaseRecommendation } from "@/lib/business-case/constants";

export type BusinessCaseHealthDimensions = {
  problemClarity: number;
  marketNeed: number;
  feasibility: number;
  roi: number;
  risk: number;
  dependencies: number;
  innovation: number;
};

export type BusinessCaseInnovationAnalysis = {
  noveltyScore: number;
  competitorComparison: string;
  differentiationGaps: string[];
};

export type BusinessCaseFinancialIntelligence = {
  devCostMin: number;
  devCostMax: number;
  infraCostMonthly: number;
  breakEvenMonths: number;
  roi3YearPct: number;
  currency: string;
};

export type BusinessCaseRaidSeed = {
  type: "risk" | "assumption" | "issue" | "dependency";
  title: string;
  severity: "low" | "medium" | "high";
};

export type BusinessCaseScenario = {
  title: string;
  deliveryDelayWeeks: number;
  costReductionPct: number;
  revenueImpact: string;
};

export type BusinessCaseDeliveryConfidence = {
  successProbability: number;
  timelineConfidence: number;
  budgetConfidence: number;
  stakeholderAlignment: number;
};

export type BusinessCaseReview = {
  score: number;
  healthDimensions: BusinessCaseHealthDimensions;
  feasibilityScore: number;
  riskScore: number;
  innovationScore: number;
  financialConfidence: number;
  deliveryConfidence: number;
  recommendation: BusinessCaseRecommendation;
  recommendationConfidence: number;
  recommendationReasons: string[];
  executiveSummary: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  missingInformation: string[];
  clarificationQuestions: string[];
  suggestedProjectName: string;
  suggestedGoal: string;
  suggestedDeliveryType: string;
  initialRisks: string[];
  innovationAnalysis: BusinessCaseInnovationAnalysis;
  financialIntelligence: BusinessCaseFinancialIntelligence;
  raidSeed: BusinessCaseRaidSeed[];
  scenarios: BusinessCaseScenario[];
  deliveryConfidenceBreakdown: BusinessCaseDeliveryConfidence;
};

type RawReview = Partial<BusinessCaseReview> & {
  recommendation?: string;
  healthDimensions?: Partial<BusinessCaseHealthDimensions>;
};

function clampScore(value: unknown, fallback = 0): number {
  return Math.max(0, Math.min(100, Math.round(Number(value) || fallback)));
}

function normalizeRecommendation(value: unknown): BusinessCaseRecommendation {
  if (value === "go" || value === "conditional_go" || value === "no_go") {
    return value;
  }
  if (value === "conditional" || value === "conditional go" || value === "revise") {
    return "conditional_go";
  }
  if (value === "no go" || value === "no-go") return "no_go";
  return "conditional_go";
}

function normalizeReview(raw: RawReview): BusinessCaseReview {
  const score = clampScore(raw.score);
  const dims: Partial<BusinessCaseHealthDimensions> = raw.healthDimensions ?? {};

  return {
    score,
    healthDimensions: {
      problemClarity: clampScore(dims.problemClarity, score),
      marketNeed: clampScore(dims.marketNeed, score),
      feasibility: clampScore(dims.feasibility, raw.feasibilityScore ?? score),
      roi: clampScore(dims.roi, Math.round(score * 0.88)),
      risk: clampScore(dims.risk, raw.riskScore ?? Math.max(0, 100 - score)),
      dependencies: clampScore(dims.dependencies, Math.round(score * 0.82)),
      innovation: clampScore(dims.innovation, raw.innovationScore ?? Math.round(score * 0.85)),
    },
    feasibilityScore: clampScore(raw.feasibilityScore, score),
    riskScore: clampScore(raw.riskScore, Math.max(0, 100 - score)),
    innovationScore: clampScore(raw.innovationScore, Math.round(score * 0.85)),
    financialConfidence: clampScore(raw.financialConfidence, Math.round(score * 0.9)),
    deliveryConfidence: clampScore(raw.deliveryConfidence, score),
    recommendation: normalizeRecommendation(raw.recommendation),
    recommendationConfidence: clampScore(raw.recommendationConfidence, score),
    recommendationReasons: (raw.recommendationReasons ?? []).slice(0, 5),
    executiveSummary:
      raw.executiveSummary?.trim() || raw.summary?.trim() || "Review complete.",
    summary: raw.summary?.trim() || raw.executiveSummary?.trim() || "Review complete.",
    strengths: raw.strengths ?? [],
    gaps: raw.gaps ?? [],
    missingInformation: raw.missingInformation ?? [],
    clarificationQuestions: raw.clarificationQuestions ?? raw.missingInformation ?? [],
    suggestedProjectName: raw.suggestedProjectName?.trim() || "New programme",
    suggestedGoal: raw.suggestedGoal?.trim() || "",
    suggestedDeliveryType: raw.suggestedDeliveryType?.trim() || "Other",
    initialRisks: raw.initialRisks ?? [],
    innovationAnalysis: {
      noveltyScore: clampScore(raw.innovationAnalysis?.noveltyScore, score),
      competitorComparison:
        raw.innovationAnalysis?.competitorComparison?.trim() ||
        "Competitive landscape requires further validation.",
      differentiationGaps: raw.innovationAnalysis?.differentiationGaps ?? [],
    },
    financialIntelligence: {
      devCostMin: Number(raw.financialIntelligence?.devCostMin) || 50_000,
      devCostMax: Number(raw.financialIntelligence?.devCostMax) || 150_000,
      infraCostMonthly: Number(raw.financialIntelligence?.infraCostMonthly) || 2_500,
      breakEvenMonths: Number(raw.financialIntelligence?.breakEvenMonths) || 18,
      roi3YearPct: Number(raw.financialIntelligence?.roi3YearPct) || 120,
      currency: raw.financialIntelligence?.currency ?? "GBP",
    },
    raidSeed: (raw.raidSeed ?? []).slice(0, 8).map((r) => ({
      type: r.type ?? "risk",
      title: r.title ?? "Unspecified risk",
      severity: r.severity ?? "medium",
    })),
    scenarios: (raw.scenarios ?? []).slice(0, 4).map((s) => ({
      title: s.title ?? "Scenario",
      deliveryDelayWeeks: Number(s.deliveryDelayWeeks) || 0,
      costReductionPct: Number(s.costReductionPct) || 0,
      revenueImpact: s.revenueImpact ?? "Neutral",
    })),
    deliveryConfidenceBreakdown: {
      successProbability: clampScore(
        raw.deliveryConfidenceBreakdown?.successProbability,
        score,
      ),
      timelineConfidence: clampScore(
        raw.deliveryConfidenceBreakdown?.timelineConfidence,
        score,
      ),
      budgetConfidence: clampScore(
        raw.deliveryConfidenceBreakdown?.budgetConfidence,
        Math.round(score * 0.9),
      ),
      stakeholderAlignment: clampScore(
        raw.deliveryConfidenceBreakdown?.stakeholderAlignment,
        Math.round(score * 0.88),
      ),
    },
  };
}

export async function reviewBusinessCase(
  content: string,
  orgContext?: OrganisationIndustryInput,
): Promise<BusinessCaseReview> {
  const raw = await generateJSON<RawReview>({
    system: businessCaseReviewSystem,
    prompt: businessCaseReviewPrompt(content, orgContext),
    maxTokens: 4096,
  });

  return normalizeReview(raw);
}

export function parseBusinessCaseReviewJson(raw: string): BusinessCaseReview {
  return normalizeReview(JSON.parse(raw) as RawReview);
}
