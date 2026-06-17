/**
 * PM delivery reports — weekly status generation with RAG.
 */

import { generateReportDraft } from "./aiGovernance";
import { createReport, listReports } from "./governance";
import { getProjectSuccessScore } from "./successScore";
import { toneFromScore, type HealthTone } from "./deliveryPmEngine";

export type WeeklyStatusReportSummary = {
  id: string;
  title: string;
  ragStatus: HealthTone;
  generatedAt: string;
  reviewStatus: string;
};

export async function listRecentStatusReports(
  projectId: string,
  limit = 5,
): Promise<WeeklyStatusReportSummary[]> {
  const reports = await listReports(projectId, { page: 0, pageSize: limit });
  return reports.map((r) => ({
    id: r.id,
    title: r.title,
    ragStatus: parseRagFromTitle(r.title),
    generatedAt: r.generated_at,
    reviewStatus: r.review_status ?? "draft",
  }));
}

export async function generateWeeklyStatusReport(input: {
  projectId: string;
  projectName: string;
}): Promise<{ reportId: string; title: string; ragStatus: HealthTone }> {
  const score = await getProjectSuccessScore(input.projectId).catch(() => null);
  const ragStatus = toneFromScore(score?.score ?? 70);
  const ragLabel = ragStatus === "green" ? "Green" : ragStatus === "amber" ? "Amber" : "Red";

  const weekLabel = formatWeekLabel(new Date());
  const draft = await generateReportDraft({
    projectId: input.projectId,
    projectName: input.projectName,
    reportType: "weekly_status",
  });

  const title = `${weekLabel} — ${ragLabel} — ${draft.title.replace(/^.*?—\s*/, "").slice(0, 80)}`;

  const content = [
    `**Overall status: ${ragLabel}**`,
    "",
    score ? `Health score: ${score.score}/100 (${score.tier})` : "",
    "",
    draft.content,
  ]
    .filter(Boolean)
    .join("\n");

  const report = await createReport({
    projectId: input.projectId,
    title,
    reportType: "weekly_status",
    content,
    aiGenerated: true,
  });

  return { reportId: report.id, title: report.title, ragStatus };
}

function formatWeekLabel(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay() + 1);
  return `Week of ${start.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function parseRagFromTitle(title: string): HealthTone {
  const lower = title.toLowerCase();
  if (lower.includes("red")) return "red";
  if (lower.includes("amber")) return "amber";
  return "green";
}
