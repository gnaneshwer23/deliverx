/**
 * AI engineering analysis and assistant.
 */

import { generateJSON, generateText } from "@/lib/ai/anthropic";
import {
  ENGINEER_ANALYSIS_SYSTEM,
  ENGINEER_ASSISTANT_SYSTEM,
  engineerAnalysisPrompt,
} from "@/lib/ai/prompts/engineer";
import { upsertEngineerContext } from "./engineerContext";

export type EngineerAnalysis = {
  aiSummary: string;
  guidedTasks: Array<{
    title: string;
    priority: string;
    impact: string;
    dependsOn?: string;
    dueLabel?: string;
    storyCode?: string;
  }>;
  dependencies: Array<{ name: string; owner: string; status: string }>;
  architectureNotes: Array<{ layer: string; owner: string; status: string }>;
  apiContracts: Array<{
    endpoint: string;
    method: string;
    permissions: string[];
    description?: string;
  }>;
  technicalDebt: {
    openItems: number;
    outdatedLibraries: number;
    refactorCandidates: number;
    securityRisks: number;
    recommendation: string;
  };
  cicd: {
    buildStatus: string;
    deployment: string;
    testCoverage: number;
    failedTests: number;
  };
  impactInsight?: string;
};

export async function analyseEngineerWorkspace(input: {
  projectId: string;
  projectName: string;
  specialisation?: string | null;
  techStack?: Record<string, string[]>;
  storiesSummary?: string;
  tasksSummary?: string;
  extraContent?: string;
}): Promise<EngineerAnalysis> {
  const result = await generateJSON<EngineerAnalysis>({
    system: ENGINEER_ANALYSIS_SYSTEM,
    prompt: engineerAnalysisPrompt({
      projectName: input.projectName,
      specialisation: input.specialisation,
      techStack: input.techStack,
      storiesSummary: input.storiesSummary,
      tasksSummary: input.tasksSummary,
      content: input.extraContent,
    }),
    maxTokens: 4096,
  });

  await upsertEngineerContext({
    specialisation: input.specialisation ?? undefined,
    techStack: input.techStack,
    engineeringPlan: {
      guidedTasks: result.guidedTasks,
      dependencies: result.dependencies,
      architectureNotes: result.architectureNotes,
      apiContracts: result.apiContracts,
      technicalDebt: result.technicalDebt,
      cicd: result.cicd,
      impactInsight: result.impactInsight,
    },
    aiSummary: result.aiSummary,
    extractionStatus: "complete",
  });

  return result;
}

export async function askEngineerAssistant(input: {
  projectName?: string;
  question: string;
  context?: string;
  stack?: Record<string, string[]>;
}): Promise<string> {
  return generateText({
    system: ENGINEER_ASSISTANT_SYSTEM,
    prompt: [
      input.projectName ? `Project: ${input.projectName}` : "",
      input.stack ? `Stack: ${JSON.stringify(input.stack)}` : "",
      input.context ? `Context:\n${input.context.slice(0, 4000)}` : "",
      "",
      `Question: ${input.question}`,
    ]
      .filter(Boolean)
      .join("\n"),
    maxTokens: 4096,
  });
}
