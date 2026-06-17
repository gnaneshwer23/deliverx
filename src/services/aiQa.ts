/**
 * AI QA analysis and assistant.
 */

import { generateJSON, generateText } from "@/lib/ai/anthropic";
import {
  QA_ANALYSIS_SYSTEM,
  QA_ASSISTANT_SYSTEM,
  qaAnalysisPrompt,
} from "@/lib/ai/prompts/qa";
import { upsertQaContext } from "./qaContext";

export type QaAnalysis = {
  aiSummary: string;
  releaseReadiness: number;
  testCoverage: number;
  automationCoverage: number;
  productionRisk: string;
  releaseConfidence: number;
  productionDefectProbability: number;
  guidedTasks: Array<{
    title: string;
    priority: string;
    impact: string;
    dueLabel?: string;
    stakeholders?: string;
  }>;
  testCases: Array<{
    code: string;
    title: string;
    priority: string;
    linkedStory: string;
    automationCandidate: boolean;
    type: string;
  }>;
  defects: Array<{
    code: string;
    title: string;
    severity: string;
    owner: string;
    status: string;
  }>;
  traceability: Array<{
    objective: string;
    requirement: string;
    storyCode: string;
    testCode: string;
    defectCode: string;
    release: string;
  }>;
  automation: {
    manualTests: number;
    automatedTests: number;
    coveragePct: number;
    pipelineSuccessPct: number;
  };
  impactAnalysis: {
    affectedApis: number;
    affectedScreens: number;
    affectedTests: number;
    regressionScope: string;
    summary: string;
  };
  uat: Array<{ group: string; completionPct: number }>;
  releaseReadinessBreakdown: {
    coverage: number;
    defects: number;
    performance: number;
    security: number;
    uat: number;
    recommendation: string;
    reason: string;
  };
  performance: {
    responseTimeMs: number;
    concurrentUsers: number;
    errorRatePct: number;
    cpuUsagePct: number;
    warning: string;
  };
  security: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    alert: string;
  };
  defectInsight: string;
};

export async function analyseQaWorkspace(input: {
  projectId: string;
  projectName: string;
  specialisation?: string | null;
  testingTools?: string[];
  storiesSummary?: string;
  requirementsSummary?: string;
  raidSummary?: string;
  extraContent?: string;
}): Promise<QaAnalysis> {
  const result = await generateJSON<QaAnalysis>({
    system: QA_ANALYSIS_SYSTEM,
    prompt: qaAnalysisPrompt({
      projectName: input.projectName,
      specialisation: input.specialisation,
      testingTools: input.testingTools,
      storiesSummary: input.storiesSummary,
      requirementsSummary: input.requirementsSummary,
      raidSummary: input.raidSummary,
      content: input.extraContent,
    }),
    maxTokens: 4096,
  });

  await upsertQaContext({
    specialisation: input.specialisation ?? undefined,
    testingTools: input.testingTools,
    qualityPlan: {
      guidedTasks: result.guidedTasks,
      testCases: result.testCases,
      defects: result.defects,
      traceability: result.traceability,
      automation: result.automation,
      impactAnalysis: result.impactAnalysis,
      uat: result.uat,
      releaseReadinessBreakdown: result.releaseReadinessBreakdown,
      performance: result.performance,
      security: result.security,
      releaseReadiness: result.releaseReadiness,
      testCoverage: result.testCoverage,
      automationCoverage: result.automationCoverage,
      productionRisk: result.productionRisk,
      releaseConfidence: result.releaseConfidence,
      productionDefectProbability: result.productionDefectProbability,
      defectInsight: result.defectInsight,
    },
    aiSummary: result.aiSummary,
    extractionStatus: "complete",
  });

  return result;
}

export async function askQaAssistant(input: {
  projectName?: string;
  question: string;
  context?: string;
}): Promise<string> {
  return generateText({
    system: QA_ASSISTANT_SYSTEM,
    prompt: [
      input.projectName ? `Project: ${input.projectName}` : "",
      input.context ? `Context:\n${input.context.slice(0, 4000)}` : "",
      "",
      `Question: ${input.question}`,
    ]
      .filter(Boolean)
      .join("\n"),
    maxTokens: 2048,
  });
}
