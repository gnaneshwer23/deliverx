import { generateJSON } from "@/lib/ai/anthropic";
import {
  businessCaseReviewPrompt,
  businessCaseReviewSystem,
} from "@/lib/ai/prompts/business-case-review";
import type { BusinessCaseRecommendation } from "@/lib/business-case/constants";

export type { BusinessCaseRecommendation } from "@/lib/business-case/constants";

export type BusinessCaseReview = {
  score: number;
  feasibilityScore: number;
  riskScore: number;
  innovationScore: number;
  financialConfidence: number;
  deliveryConfidence: number;
  recommendation: BusinessCaseRecommendation;
  executiveSummary: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  missingInformation: string[];
  suggestedProjectName: string;
  suggestedGoal: string;
  suggestedDeliveryType: string;
  initialRisks: string[];
};

type RawReview = Partial<BusinessCaseReview> & {
  recommendation?: string;
};

function clampScore(value: unknown, fallback = 0): number {
  return Math.max(0, Math.min(100, Math.round(Number(value) || fallback)));
}

function normalizeRecommendation(value: unknown): BusinessCaseRecommendation {
  if (value === "go" || value === "conditional_go" || value === "no_go") {
    return value;
  }
  if (value === "conditional" || value === "conditional go") return "conditional_go";
  if (value === "no go" || value === "no-go") return "no_go";
  return "conditional_go";
}

export async function reviewBusinessCase(content: string): Promise<BusinessCaseReview> {
  const raw = await generateJSON<RawReview>({
    system: businessCaseReviewSystem,
    prompt: businessCaseReviewPrompt(content),
    maxTokens: 2048,
  });

  const score = clampScore(raw.score);
  const feasibilityScore = clampScore(raw.feasibilityScore, score);
  const riskScore = clampScore(raw.riskScore, Math.max(0, 100 - score));
  const innovationScore = clampScore(raw.innovationScore, Math.round(score * 0.85));
  const financialConfidence = clampScore(raw.financialConfidence, Math.round(score * 0.9));
  const deliveryConfidence = clampScore(raw.deliveryConfidence, score);

  return {
    score,
    feasibilityScore,
    riskScore,
    innovationScore,
    financialConfidence,
    deliveryConfidence,
    recommendation: normalizeRecommendation(raw.recommendation),
    executiveSummary:
      raw.executiveSummary?.trim() || raw.summary?.trim() || "Review complete.",
    summary: raw.summary?.trim() || raw.executiveSummary?.trim() || "Review complete.",
    strengths: raw.strengths ?? [],
    gaps: raw.gaps ?? [],
    missingInformation: raw.missingInformation ?? [],
    suggestedProjectName: raw.suggestedProjectName?.trim() || "New programme",
    suggestedGoal: raw.suggestedGoal?.trim() || "",
    suggestedDeliveryType: raw.suggestedDeliveryType?.trim() || "Other",
    initialRisks: raw.initialRisks ?? [],
  };
}
