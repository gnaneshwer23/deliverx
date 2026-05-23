import { listTasks } from "./delivery";
import { listRaidItems, listDecisions, listMeetings } from "./governance";
import { loadProjectSignals } from "./projectSignals";
import { getProjectIntelligence } from "./intelligence";
import { createClient } from "@/lib/supabase/server";

export async function buildProjectDeliverySnapshot(projectId: string): Promise<string> {
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name, goal, timeline, status")
    .eq("id", projectId)
    .single();

  const projectName = project?.name ?? "Project";

  const [tasks, raid, decisions, meetings, signals, intelligence] = await Promise.all([
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
    project?.goal ? `Goal: ${project.goal}` : null,
    project?.timeline ? `Timeline: ${project.timeline}` : null,
    `Status: ${project?.status ?? "unknown"}`,
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
    ...openTasks.slice(0, 12).map((t) => `- [${t.status}] ${t.title} (${t.priority})`),
    "",
    "Open RAID:",
    ...openRaid.slice(0, 12).map((r) => `- [${r.type}] ${r.title} (${r.severity})`),
  ]
    .filter(Boolean)
    .join("\n");
}
