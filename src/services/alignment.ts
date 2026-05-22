/**
 * Charter alignment orchestration — signals → engine → optional AI → persist.
 */

import {
  blendAlignmentScores,
  alignmentTrendFromHistory,
  computeCharterAlignment,
  tierForScore,
  type AlignmentResult,
  type AlignmentTrend,
} from "./alignmentEngine";
import {
  getActiveCharter,
  getLatestAlignmentScore,
  listAlignmentScores,
  saveAlignmentScore,
  type AlignmentScoreRow,
  type CharterRow,
} from "./charter";
import { scoreCharterWithAi } from "./aiCharterAlignment";
import { listTasks } from "./delivery";
import { listRaidItems, listDecisions, listMeetings } from "./governance";
import { getProjectIntelligence } from "./intelligence";
import { createClient } from "@/lib/supabase/server";

export type ProjectAlignment = {
  projectId: string;
  charter: CharterRow | null;
  latest: AlignmentScoreRow | null;
  score: number;
  tier: AlignmentResult["tier"];
  trend: AlignmentTrend;
  factors: string[];
  delta: number | null;
  history: AlignmentScoreRow[];
};

function countGoalReferences(goals: string[], taskTitles: string[]): number {
  if (goals.length === 0) return 0;
  const haystack = taskTitles.join(" ").toLowerCase();
  return goals.filter((g) => {
    const words = g.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    if (words.length === 0) return false;
    const hits = words.filter((w) => haystack.includes(w)).length;
    return hits >= Math.ceil(words.length * 0.4);
  }).length;
}

async function buildDeliverySnapshot(projectId: string, projectName: string) {
  const [tasks, raid, decisions, meetings, intelligence] = await Promise.all([
    listTasks({ projectId, limit: 80 }),
    listRaidItems(projectId),
    listDecisions(projectId),
    listMeetings(projectId),
    getProjectIntelligence(projectId),
  ]);

  const openTasks = tasks.filter((t) => t.status !== "done");
  const openRaid = raid.filter((r) => r.status === "open");
  const recentMeeting = meetings.find((m) => m.summary || m.notes);

  return {
    intelligence,
    openTasks,
    openRaid,
    decisions,
    recentMeeting,
    snapshot: [
      `Project: ${projectName}`,
      `Health: ${intelligence.health.score}/100`,
      "",
      "Open tasks:",
      ...openTasks.slice(0, 15).map((t) => `- [${t.status}] ${t.title}`),
      "",
      "Open RAID:",
      ...openRaid.slice(0, 12).map((r) => `- [${r.type}] ${r.title} (${r.severity})`),
      "",
      "Decisions:",
      ...decisions.slice(0, 10).map((d) => `- [${d.status}] ${d.title}`),
    ].join("\n"),
  };
}

export async function computeProjectAlignment(
  projectId: string,
  opts: {
    meetingId?: string;
    meetingContext?: string;
    source?: "manual" | "meeting" | "ai";
    persist?: boolean;
  } = {},
): Promise<ProjectAlignment> {
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  const projectName = project?.name ?? "Project";
  const charter = await getActiveCharter(projectId);
  const previous = await getLatestAlignmentScore(projectId);
  const history = await listAlignmentScores(projectId, 12);

  if (!charter || !charter.content.trim()) {
    return {
      projectId,
      charter,
      latest: previous,
      score: 0,
      tier: "misaligned",
      trend: "flat",
      factors: ["Add a project charter to measure alignment"],
      delta: null,
      history,
    };
  }

  const delivery = await buildDeliverySnapshot(projectId, projectName);
  const goals = charter.extracted_goals ?? [];
  const allTasks = await listTasks({ projectId, limit: 200 });
  const openTasks = allTasks.filter((t) => t.status !== "done");
  const taskTitles = openTasks.map((t) => t.title);
  const tasksDoneRatio =
    allTasks.length > 0
      ? allTasks.filter((t) => t.status === "done").length / allTasks.length
      : 0;

  const heuristic = computeCharterAlignment({
    goalCount: goals.length,
    goalsReferencedInTasks: countGoalReferences(goals, taskTitles),
    charterWordCount: charter.content.split(/\s+/).filter(Boolean).length,
    openCriticalRisks: delivery.openRaid.filter((r) => r.severity === "critical").length,
    openHighRisks: delivery.openRaid.filter((r) => r.severity === "high").length,
    approvedDecisions: delivery.decisions.filter((d) => d.status === "approved").length,
    proposedDecisions: delivery.decisions.filter((d) => d.status === "proposed").length,
    tasksDoneRatio,
    healthScore: delivery.intelligence.health.score,
    hasRecentMeetingSummary: Boolean(delivery.recentMeeting?.summary),
  });

  const ai = await scoreCharterWithAi({
    projectName,
    charterContent: charter.content,
    goals,
    successCriteria: charter.success_criteria ?? [],
    deliverySnapshot: delivery.snapshot,
    meetingContext: opts.meetingContext,
  });

  const finalScore = blendAlignmentScores(heuristic.score, ai?.score ?? null);
  const factors = ai?.factors?.length ? ai.factors : heuristic.factors;
  const trend = alignmentTrendFromHistory(finalScore, previous?.score ?? null);
  const tier = tierForScore(finalScore);
  const delta = previous?.score != null ? finalScore - previous.score : null;

  if (opts.persist === false) {
    return {
      projectId,
      charter,
      latest: previous,
      score: finalScore,
      tier,
      trend,
      factors,
      delta,
      history,
    };
  }

  const saved = await saveAlignmentScore({
    projectId,
    charterId: charter.id,
    score: finalScore,
    previousScore: previous?.score ?? null,
    meetingId: opts.meetingId,
    source: opts.source ?? "ai",
    factors,
  });

  return {
    projectId,
    charter,
    latest: saved,
    score: finalScore,
    tier,
    trend,
    factors,
    delta: saved.delta,
    history: [saved, ...history.filter((h) => h.id !== saved.id)].slice(0, 12),
  };
}

export async function getProjectAlignment(projectId: string): Promise<ProjectAlignment> {
  const charter = await getActiveCharter(projectId);
  const latest = await getLatestAlignmentScore(projectId);
  const history = await listAlignmentScores(projectId, 12);

  if (!latest) {
    return {
      projectId,
      charter,
      latest: null,
      score: 0,
      tier: charter ? "drifting" : "misaligned",
      trend: "flat",
      factors: charter
        ? ["Run alignment scoring to establish baseline"]
        : ["Add a project charter to measure alignment"],
      delta: null,
      history,
    };
  }

  const prev = history[1]?.score ?? null;
  return {
    projectId,
    charter,
    latest,
    score: latest.score,
    tier: tierForScore(latest.score),
    trend: alignmentTrendFromHistory(latest.score, prev),
    factors: latest.factors,
    delta: latest.delta,
    history,
  };
}
