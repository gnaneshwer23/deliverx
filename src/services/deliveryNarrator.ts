/**
 * Delivery Narrator — aggregates project intelligence into briefing scripts.
 */

import { generateText } from "@/lib/ai/anthropic";
import {
  deliveryBriefingPrompt,
  deliveryBriefingSystem,
  deliveryNarratorPrompt,
  deliveryNarratorSystem,
} from "@/lib/ai/prompts/delivery-narrator";
import { getProjectAlignment } from "./alignment";
import { getDeliveryForecast } from "./deliveryForecast";
import { listTasks } from "./delivery";
import { listRaidItems } from "./governance";
import { getProjectIntelligence } from "./intelligence";
import { countPendingProposals, listProjectProposals } from "./proposedActions";
import { getProjectSuccessScore } from "./successScore";
import { createClient } from "@/lib/supabase/server";

export type NarratorBriefing = {
  projectId: string;
  projectName: string;
  script: string;
  wordCount: number;
  estimatedMinutes: number;
  generatedAt: string;
};

export async function buildNarratorContextBlock(projectId: string): Promise<{
  projectName: string;
  contextBlock: string;
}> {
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name, status, timeline, goal")
    .eq("id", projectId)
    .single();

  const projectName = project?.name ?? "Project";

  const [
    intelligence,
    alignment,
    forecast,
    successScore,
    tasks,
    raid,
    pendingProposals,
    pendingCount,
  ] = await Promise.all([
    getProjectIntelligence(projectId),
    getProjectAlignment(projectId),
    getDeliveryForecast(projectId).catch(() => null),
    getProjectSuccessScore(projectId).catch(() => null),
    listTasks({ projectId, limit: 40 }),
    listRaidItems(projectId),
    listProjectProposals(projectId, 5).catch(() => []),
    countPendingProposals().catch(() => 0),
  ]);

  const openTasks = tasks.filter((t) => t.status !== "done");
  const openRaid = raid.filter((r) => r.status === "open");
  const blockers = intelligence.blockers.slice(0, 3);

  const lines = [
    `Status: ${project?.status ?? "unknown"}`,
    project?.goal ? `Goal: ${project.goal}` : null,
    project?.timeline ? `Timeline: ${project.timeline}` : null,
    `Health: ${intelligence.health.score}/100 (${intelligence.health.tier})`,
    `Delivery confidence: ${intelligence.confidence.score}%`,
    `Charter alignment: ${alignment.score}%`,
    successScore ? `Delivery success score: ${successScore.score}/100` : null,
    forecast
      ? `Forecast delivery: ${forecast.expectedDate} (${Math.round(forecast.confidence * 100)}% confidence, ${forecast.delayDays}d vs plan)`
      : null,
    forecast && forecast.drivers.length
      ? `Top drivers: ${forecast.drivers.map((d) => d.label).join("; ")}`
      : null,
    `Open tasks: ${openTasks.length}, overdue signal: ${intelligence.health.factors[0] ?? "none"}`,
    `Open RAID: ${openRaid.length}`,
    blockers.length ? `Blockers: ${blockers.join("; ")}` : null,
    intelligence.recommendations[0]
      ? `Top recommendation: ${intelligence.recommendations[0].text}`
      : null,
    pendingProposals.length
      ? `Pending proposals: ${pendingProposals.map((p) => p.title).join("; ")}`
      : pendingCount > 0
        ? `${pendingCount} org-wide proposals awaiting approval`
        : null,
  ].filter(Boolean);

  return {
    projectName,
    contextBlock: lines.join("\n"),
  };
}

export async function generateDeliveryNarratorScript(
  projectId: string,
): Promise<NarratorBriefing> {
  const { projectName, contextBlock } = await buildNarratorContextBlock(projectId);

  const script = await generateText({
    system: deliveryNarratorSystem,
    prompt: deliveryNarratorPrompt({ projectName, contextBlock }),
    maxTokens: 800,
  });

  const wordCount = script.trim().split(/\s+/).length;
  const estimatedMinutes = Math.round((wordCount / 150) * 10) / 10;

  return {
    projectId,
    projectName,
    script: script.trim(),
    wordCount,
    estimatedMinutes,
    generatedAt: new Date().toISOString(),
  };
}

export async function answerDeliveryBriefingQuestion(
  projectId: string,
  question: string,
): Promise<{ answer: string; projectName: string }> {
  const trimmed = question.trim();
  if (!trimmed) throw new Error("Question is required");

  const { projectName, contextBlock } = await buildNarratorContextBlock(projectId);

  const answer = await generateText({
    system: deliveryBriefingSystem,
    prompt: deliveryBriefingPrompt({
      projectName,
      question: trimmed,
      contextBlock,
    }),
    maxTokens: 400,
  });

  return { answer: answer.trim(), projectName };
}
