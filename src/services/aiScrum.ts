/**
 * AI Scrum Master analysis and assistant.
 */

import { generateJSON, generateText } from "@/lib/ai/anthropic";
import {
  SCRUM_ANALYSIS_SYSTEM,
  SCRUM_ASSISTANT_SYSTEM,
  scrumAnalysisPrompt,
} from "@/lib/ai/prompts/scrum";
import { upsertScrumContext } from "./scrumContext";

export type ScrumAnalysis = {
  aiSummary: string;
  sprintSuccessProbability: number;
  guidedTasks: Array<{
    title: string;
    priority: string;
    impact: string;
    ageLabel?: string;
    stakeholders?: string;
  }>;
  impediments: Array<{ title: string; owner: string; ageDays: number; severity: string }>;
  teamHealth: {
    happinessScore: number;
    meetingLoad: string;
    collaboration: string;
    burnoutRisk: string;
    workloadBalance: string;
    insight?: string;
  };
  burnout: { risk: string; affectedTeam?: string; recommendation: string };
  velocityHistory: Array<{ sprint: string; points: number }>;
  capacity: {
    availableHours: number;
    allocatedHours: number;
    leaveImpactPct: number;
    bufferHours: number;
    recommendation: string;
  };
  crossTeamDeps: Array<{ team: string; dependency: string; status: string }>;
  retroThemes: string[];
  agileMaturity: {
    collaboration: number;
    delivery: number;
    quality: number;
    planning: number;
    improvement: number;
  };
  standupSummary?: { yesterday: string[]; today: string[]; blockers: string[] };
};

export async function analyseScrumWorkspace(input: {
  projectId: string;
  projectName: string;
  agileFramework?: string | null;
  teamConfig?: string | null;
  sprintSummary?: string;
  blockersSummary?: string;
  extraContent?: string;
}): Promise<ScrumAnalysis> {
  const result = await generateJSON<ScrumAnalysis>({
    system: SCRUM_ANALYSIS_SYSTEM,
    prompt: scrumAnalysisPrompt({
      projectName: input.projectName,
      agileFramework: input.agileFramework,
      teamConfig: input.teamConfig,
      sprintSummary: input.sprintSummary,
      blockersSummary: input.blockersSummary,
      content: input.extraContent,
    }),
    maxTokens: 4096,
  });

  await upsertScrumContext({
    agileFramework: input.agileFramework ?? undefined,
    teamConfig: input.teamConfig ?? undefined,
    sprintPlan: {
      guidedTasks: result.guidedTasks,
      impediments: result.impediments,
      teamHealth: result.teamHealth,
      burnout: result.burnout,
      velocityHistory: result.velocityHistory,
      capacity: result.capacity,
      crossTeamDeps: result.crossTeamDeps,
      retroThemes: result.retroThemes,
      agileMaturity: result.agileMaturity,
      standupSummary: result.standupSummary,
      sprintSuccessProbability: result.sprintSuccessProbability,
    },
    aiSummary: result.aiSummary,
    extractionStatus: "complete",
  });

  return result;
}

export async function askScrumAssistant(input: {
  projectName?: string;
  question: string;
  context?: string;
}): Promise<string> {
  return generateText({
    system: SCRUM_ASSISTANT_SYSTEM,
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
