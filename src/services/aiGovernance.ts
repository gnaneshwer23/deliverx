import { generateJSON, generateText } from "@/lib/ai/anthropic";
import {
  dashboardNarrativePrompt,
  dashboardNarrativeSystem,
} from "@/lib/ai/prompts/dashboard-narrative";
import {
  enrichRecommendationsPrompt,
  enrichRecommendationsSystem,
} from "@/lib/ai/prompts/enrich-recommendations";
import {
  meetingSummaryPrompt,
  meetingSummarySystem,
} from "@/lib/ai/prompts/meeting-summary";
import {
  raidSuggestPrompt,
  raidSuggestSystem,
} from "@/lib/ai/prompts/raid-suggest";
import {
  reportGeneratePrompt,
  reportGenerateSystem,
} from "@/lib/ai/prompts/report-generate";
import { listRaidItems, listDecisions, listMeetings } from "@/services/governance";
import { listTasks } from "@/services/delivery";
import { loadProjectSignals } from "@/services/projectSignals";
import { getProjectIntelligence } from "@/services/intelligence";

export type RaidSuggestion = {
  type: "risk" | "assumption" | "issue" | "dependency";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  mitigation: string;
};

export type MeetingSummaryResult = {
  summary: string;
  actions: string[];
  decisions: Array<{ title: string; context: string }>;
  risks: Array<{
    type: "risk" | "issue" | "dependency";
    title: string;
    description: string;
  }>;
};

export type ReportDraft = {
  title: string;
  content: string;
};

export async function suggestRaidItems(input: {
  projectId: string;
  projectName: string;
  context: string;
}): Promise<RaidSuggestion[]> {
  const existing = await listRaidItems(input.projectId);
  const raw = await generateJSON<{ items?: RaidSuggestion[] }>({
    system: raidSuggestSystem,
    prompt: raidSuggestPrompt({
      projectName: input.projectName,
      context: input.context,
      existingTitles: existing.map((r) => r.title),
    }),
    maxTokens: 2048,
  });
  return raw.items ?? [];
}

export async function summarizeMeetingNotes(input: {
  title: string;
  notes: string;
  projectName?: string;
}): Promise<MeetingSummaryResult> {
  const raw = await generateJSON<MeetingSummaryResult>({
    system: meetingSummarySystem,
    prompt: meetingSummaryPrompt(input),
    maxTokens: 2048,
  });

  return {
    summary: raw.summary ?? "",
    actions: raw.actions ?? [],
    decisions: raw.decisions ?? [],
    risks: raw.risks ?? [],
  };
}

async function buildProjectSnapshot(projectId: string, projectName: string) {
  const [tasks, raid, decisions, meetings, signals, intelligence] =
    await Promise.all([
      listTasks({ projectId, limit: 50 }),
      listRaidItems(projectId),
      listDecisions(projectId),
      listMeetings(projectId),
      loadProjectSignals(projectId),
      getProjectIntelligence(projectId),
    ]);

  const openTasks = tasks.filter((t) => t.status !== "done");
  const openRaid = raid.filter((r) => r.status === "open");

  return [
    `Name: ${projectName}`,
    `Health: ${intelligence.health.score}/100 (${intelligence.health.tier})`,
    `Confidence: ${intelligence.confidence.score}%`,
    `Tasks: ${tasks.length} total, ${openTasks.length} open, ${signals.overdueTasks} overdue`,
    `RAID: ${openRaid.length} open items`,
    `Decisions: ${decisions.filter((d) => d.status === "proposed").length} proposed`,
    `Meetings: ${meetings.length} recorded`,
    "",
    "Top recommendations:",
    ...intelligence.recommendations.map((r) => `- ${r.text}`),
    "",
    "Open tasks:",
    ...openTasks.slice(0, 12).map(
      (t) => `- [${t.status}] ${t.title} (${t.priority})`,
    ),
    "",
    "Open RAID:",
    ...openRaid.slice(0, 12).map(
      (r) => `- [${r.type}] ${r.title} (${r.severity})`,
    ),
  ].join("\n");
}

export async function generateReportDraft(input: {
  projectId: string;
  projectName: string;
  reportType?: string;
}): Promise<ReportDraft> {
  const snapshot = await buildProjectSnapshot(input.projectId, input.projectName);
  const reportType = input.reportType ?? "status";

  const raw = await generateJSON<ReportDraft>({
    system: reportGenerateSystem,
    prompt: reportGeneratePrompt({
      projectName: input.projectName,
      reportType,
      snapshot,
    }),
    maxTokens: 4096,
  });

  return {
    title: raw.title?.trim() || `${input.projectName} ${reportType} report`,
    content: raw.content?.trim() || "",
  };
}

export async function generateDashboardNarrative(input: {
  projectId: string;
  projectName: string;
}): Promise<string> {
  const [tasks, raid, intelligence] = await Promise.all([
    listTasks({ projectId: input.projectId, limit: 100 }),
    listRaidItems(input.projectId),
    getProjectIntelligence(input.projectId),
  ]);

  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const openRaid = raid.filter((r) => r.status === "open").length;
  const topRecommendation =
    intelligence.recommendations[0]?.text ?? "Continue monitoring delivery signals.";

  return generateText({
    system: dashboardNarrativeSystem,
    prompt: dashboardNarrativePrompt({
      projectName: input.projectName,
      healthTier: intelligence.health.tier,
      healthScore: intelligence.health.score,
      confidenceScore: intelligence.confidence.score,
      topRecommendation,
      openTasks,
      openRaid,
    }),
    maxTokens: 256,
  });
}

export async function enrichRecommendationRationales(input: {
  projectName: string;
  items: Array<{ id: string; text: string; rationale: string }>;
}): Promise<Record<string, string>> {
  if (input.items.length === 0) return {};

  const raw = await generateJSON<{ items?: Array<{ id: string; rationale: string }> }>({
    system: enrichRecommendationsSystem,
    prompt: enrichRecommendationsPrompt(input),
    maxTokens: 1024,
  });

  const out: Record<string, string> = {};
  for (const item of raw.items ?? []) {
    if (item.id && item.rationale?.trim()) {
      out[item.id] = item.rationale.trim();
    }
  }
  return out;
}
