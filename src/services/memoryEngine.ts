/**
 * Memory Engine — pure extraction logic.
 *
 * Turns a project's runtime signals + metadata into durable insights.
 * No I/O. Mirrors intelligenceEngine.ts in style: signals in, candidates
 * out, persistence happens elsewhere.
 */

import type { ProjectSignals } from "./intelligenceEngine";

export type InsightType = "risk_pattern" | "lesson" | "success_pattern" | "governance";

export type InsightCandidate = {
  type: InsightType;
  insight: string;
  confidence: number;
  tags: string[];
};

export type ProjectContext = {
  industry?: string | null;
  deliveryType?: string | null;
  name?: string | null;
};

export function extractProjectInsights(
  signals: ProjectSignals,
  ctx: ProjectContext = {},
): InsightCandidate[] {
  const out: InsightCandidate[] = [];
  const ctxTags = [ctx.industry, ctx.deliveryType]
    .filter((s): s is string => Boolean(s))
    .map((s) => s.toLowerCase());

  if (signals.blockers > 5) {
    out.push({
      type: "risk_pattern",
      insight: "High blocker frequency impacts delivery timelines",
      confidence: 0.85,
      tags: dedupe(["blockers", "delay", ...ctxTags]),
    });
  }

  if (signals.recurringBlockers.length > 0) {
    out.push({
      type: "lesson",
      insight: `Recurring dependency on "${signals.recurringBlockers[0]}" repeatedly stalls delivery — capture earlier in planning`,
      confidence: 0.78,
      tags: dedupe(["dependencies", "planning", ...ctxTags]),
    });
  }

  if (signals.milestoneDelay) {
    out.push({
      type: "lesson",
      insight: "Milestones longer than the team's velocity-window are prone to slip — break them into phased increments",
      confidence: 0.81,
      tags: dedupe(["milestones", "planning", ...ctxTags]),
    });
  }

  if (signals.velocity < 0.65) {
    out.push({
      type: "risk_pattern",
      insight: `Velocity ran at ${Math.round(signals.velocity * 100)}% of plan — workstream load was likely mis-sized`,
      confidence: 0.7,
      tags: dedupe(["velocity", "capacity", ...ctxTags]),
    });
  }

  if (!signals.standupsComplete) {
    out.push({
      type: "governance",
      insight: "Projects with low standup participation showed higher escalation rates",
      confidence: 0.78,
      tags: dedupe(["governance", "cadence", ...ctxTags]),
    });
  }

  if (signals.averageCompletionDays > 6) {
    out.push({
      type: "lesson",
      insight: `Tasks averaged ${signals.averageCompletionDays.toFixed(1)} days to close — split work into smaller deliverables`,
      confidence: 0.72,
      tags: dedupe(["task-sizing", "throughput", ...ctxTags]),
    });
  }

  if (
    signals.blockers <= 2 &&
    !signals.milestoneDelay &&
    signals.velocity >= 0.85
  ) {
    out.push({
      type: "success_pattern",
      insight: "Tight blocker resolution + healthy velocity correlated with on-time delivery",
      confidence: 0.83,
      tags: dedupe(["success", "execution", ...ctxTags]),
    });
  }

  return out;
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
