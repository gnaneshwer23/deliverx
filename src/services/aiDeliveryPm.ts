/**
 * AI delivery PM analysis.
 */

import { generateJSON, generateText } from "@/lib/ai/anthropic";
import {
  PM_ASSISTANT_SYSTEM,
  PM_DELIVERY_SYSTEM,
  pmDeliveryAnalysisPrompt,
} from "@/lib/ai/prompts/delivery-pm";
import { getActiveCharter } from "./charter";
import { upsertPmDeliveryContext } from "./deliveryPmContext";

export type PmDeliveryAnalysis = {
  aiSummary: string;
  deliveryRisk: string;
  goLiveProbability: number;
  budget: {
    approved: number;
    spent: number;
    forecast: number;
    burnRateMonthly?: number;
    currency?: string;
  };
  healthInsights: Record<string, string>;
  guidedTasks: Array<{
    title: string;
    priority: string;
    impact: string;
    owner: string;
    stakeholders: string;
  }>;
  criticalRisks: Array<{ title: string; severity: string; owner: string; mitigation: string }>;
  dependencies: string[];
  governanceArtifacts: string[];
};

export async function analyseDeliveryForProject(input: {
  projectId: string;
  projectName: string;
  projectType?: string | null;
  extraContent?: string;
}): Promise<PmDeliveryAnalysis> {
  const charter = await getActiveCharter(input.projectId).catch(() => null);
  const parts = [
    charter?.content?.trim() ? `Charter / SOW:\n${charter.content}` : "",
    input.extraContent?.trim() ?? "",
  ].filter(Boolean);

  if (parts.length === 0) {
    throw new Error("Add a charter or project plan before running delivery analysis.");
  }

  const result = await generateJSON<PmDeliveryAnalysis>({
    system: PM_DELIVERY_SYSTEM,
    prompt: pmDeliveryAnalysisPrompt({
      projectName: input.projectName,
      projectType: input.projectType,
      content: parts.join("\n\n---\n\n"),
    }),
    maxTokens: 4096,
  });

  await upsertPmDeliveryContext({
    projectId: input.projectId,
    projectType: input.projectType ?? undefined,
    budget: result.budget,
    deliveryPlan: {
      criticalRisks: result.criticalRisks,
      dependencies: result.dependencies,
      governanceArtifacts: result.governanceArtifacts,
      healthInsights: result.healthInsights,
      guidedTasks: result.guidedTasks,
      deliveryRisk: result.deliveryRisk,
    },
    aiSummary: result.aiSummary,
    goLiveProbability: result.goLiveProbability,
    extractionStatus: "complete",
  });

  return result;
}

export async function askPmAssistant(input: {
  projectName: string;
  question: string;
  context?: string;
}): Promise<string> {
  return generateText({
    system: PM_ASSISTANT_SYSTEM,
    prompt: [
      `Project: ${input.projectName}`,
      input.context ? `Context:\n${input.context.slice(0, 4000)}` : "",
      "",
      `Question: ${input.question}`,
    ]
      .filter(Boolean)
      .join("\n"),
    maxTokens: 2048,
  });
}
