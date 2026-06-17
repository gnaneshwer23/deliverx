/**
 * Delivery traceability engine — req → story → task → test graph and coverage.
 */

import type { TraceMatrixRow } from "./baRequirementEngine";

export type TraceCoverageStats = {
  requirements: number;
  withStory: number;
  withTask: number;
  withTest: number;
  storyCoveragePct: number;
  taskCoveragePct: number;
  testCoveragePct: number;
  overallPct: number;
};

export type TraceGap = {
  reqCode: string;
  requirement: string;
  missing: Array<"story" | "task" | "test">;
};

export type DeliveryTraceGraph = {
  rows: TraceMatrixRow[];
  coverage: TraceCoverageStats;
  gaps: TraceGap[];
};

export function computeTraceCoverage(rows: TraceMatrixRow[]): TraceCoverageStats {
  const requirements = rows.length;
  const withStory = rows.filter((r) => r.storyCode).length;
  const withTask = rows.filter((r) => r.task).length;
  const withTest = rows.filter((r) => r.test).length;

  const storyCoveragePct =
    requirements > 0 ? Math.round((withStory / requirements) * 100) : 0;
  const taskCoveragePct =
    requirements > 0 ? Math.round((withTask / requirements) * 100) : 0;
  const testCoveragePct =
    requirements > 0 ? Math.round((withTest / requirements) * 100) : 0;

  const overallPct = Math.round(
    storyCoveragePct * 0.35 + taskCoveragePct * 0.35 + testCoveragePct * 0.3,
  );

  return {
    requirements,
    withStory,
    withTask,
    withTest,
    storyCoveragePct,
    taskCoveragePct,
    testCoveragePct,
    overallPct,
  };
}

export function findTraceGaps(rows: TraceMatrixRow[]): TraceGap[] {
  return rows
    .map((row) => {
      const missing: TraceGap["missing"] = [];
      if (!row.storyCode) missing.push("story");
      if (!row.task) missing.push("task");
      if (!row.test) missing.push("test");
      return { reqCode: row.reqCode, requirement: row.requirement, missing };
    })
    .filter((g) => g.missing.length > 0);
}

export function buildDeliveryTraceGraph(rows: TraceMatrixRow[]): DeliveryTraceGraph {
  return {
    rows,
    coverage: computeTraceCoverage(rows),
    gaps: findTraceGaps(rows),
  };
}

export function traceRowStatus(row: TraceMatrixRow): string {
  if (!row.storyCode) return "Missing story";
  if (!row.task) return "Missing task";
  if (!row.test) return "Missing test";
  if (row.status === "Ready") return "Ready";
  return row.status;
}

export function matchTaskToStory(
  task: { title: string; description?: string | null },
  story: { story_code: string; title: string },
): boolean {
  const hay = `${task.title} ${task.description ?? ""}`.toLowerCase();
  const code = story.story_code.toLowerCase();
  const titleSnippet = story.title.toLowerCase().slice(0, 24).trim();
  if (hay.includes(code)) return true;
  if (titleSnippet.length >= 8 && hay.includes(titleSnippet)) return true;
  return false;
}
