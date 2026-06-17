/**
 * AI founder analysis and assistant.
 */

import { generateJSON, generateText } from "@/lib/ai/anthropic";
import {
  FOUNDER_ANALYSIS_SYSTEM,
  FOUNDER_ASSISTANT_SYSTEM,
  founderAnalysisPrompt,
} from "@/lib/ai/prompts/founder";
import { upsertFounderContext } from "./founderContext";

export type FounderAnalysis = {
  aiSummary: string;
  companySummary: Record<string, unknown>;
  financials: {
    cashInBank: number;
    monthlyBurn: number;
    runwayMonths: number;
    mrr: number;
    arr: number;
    growthPct: number;
    currency?: string;
    nextRaise?: string;
    runwayEndPrediction?: string;
  };
  strategicObjectives: Array<{ title: string; progress: number; insight?: string }>;
  risks: Array<{ title: string; severity: string }>;
  investorUpdate: { headline?: string; bullets?: string[] };
  teamRecommendation?: string;
  decisionsSuggested: Array<{ title: string; impact: string; rationale?: string }>;
};

export async function analyseFounderContext(input: {
  orgName?: string;
  companyType?: string | null;
  businessGoals?: string[];
  extraContent?: string;
}): Promise<FounderAnalysis> {
  const parts = [input.extraContent?.trim() ?? ""].filter(Boolean);
  if (parts.length === 0) {
    throw new Error("Upload a pitch deck, business case, or financial model before analysis.");
  }

  const result = await generateJSON<FounderAnalysis>({
    system: FOUNDER_ANALYSIS_SYSTEM,
    prompt: founderAnalysisPrompt({
      orgName: input.orgName,
      companyType: input.companyType,
      businessGoals: input.businessGoals,
      content: parts.join("\n\n---\n\n"),
    }),
    maxTokens: 4096,
  });

  await upsertFounderContext({
    companyType: input.companyType ?? undefined,
    businessGoals: input.businessGoals,
    financials: result.financials,
    strategicObjectives: result.strategicObjectives,
    companySummary: result.companySummary,
    investorSnapshot: result.investorUpdate,
    aiSummary: result.aiSummary,
    extractionStatus: "complete",
  });

  return result;
}

export async function askFounderAssistant(input: {
  orgName?: string;
  question: string;
  context?: string;
}): Promise<string> {
  return generateText({
    system: FOUNDER_ASSISTANT_SYSTEM,
    prompt: [
      input.orgName ? `Company: ${input.orgName}` : "",
      input.context ? `Context:\n${input.context.slice(0, 4000)}` : "",
      "",
      `Question: ${input.question}`,
    ]
      .filter(Boolean)
      .join("\n"),
    maxTokens: 2048,
  });
}
