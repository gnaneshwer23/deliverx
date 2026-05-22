import { generateJSON } from "@/lib/ai/anthropic";
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
