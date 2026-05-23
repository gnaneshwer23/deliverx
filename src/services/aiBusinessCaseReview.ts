import { generateJSON } from "@/lib/ai/anthropic";
import {
  businessCaseReviewPrompt,
  businessCaseReviewSystem,
} from "@/lib/ai/prompts/business-case-review";

export type BusinessCaseReview = {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestedProjectName: string;
  suggestedGoal: string;
  suggestedDeliveryType: string;
  initialRisks: string[];
};

type RawReview = Partial<BusinessCaseReview>;

export async function reviewBusinessCase(content: string): Promise<BusinessCaseReview> {
  const raw = await generateJSON<RawReview>({
    system: businessCaseReviewSystem,
    prompt: businessCaseReviewPrompt(content),
    maxTokens: 2048,
  });

  return {
    score: Math.max(0, Math.min(100, Math.round(raw.score ?? 0))),
    summary: raw.summary?.trim() || "Review complete.",
    strengths: raw.strengths ?? [],
    gaps: raw.gaps ?? [],
    suggestedProjectName: raw.suggestedProjectName?.trim() || "New programme",
    suggestedGoal: raw.suggestedGoal?.trim() || "",
    suggestedDeliveryType: raw.suggestedDeliveryType?.trim() || "Other",
    initialRisks: raw.initialRisks ?? [],
  };
}
