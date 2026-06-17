/**
 * Forecast Engine — pure compute. Given project signals and optional
 * milestone/timeline context, emits structured delivery dates with
 * explainable drivers.
 */

import type { ProjectSignals } from "./intelligenceEngine";

export type ForecastTrend = "stable" | "declining" | "improving";

export type Forecast = {
  prediction: string;
  confidence: number; // 0..1
  horizonDays: number;
  trend: ForecastTrend;
};

export type ForecastDriverImpact = "high" | "medium" | "low";
export type ForecastDriverDirection = "delay" | "neutral" | "accelerate";

export type ForecastDriver = {
  id: string;
  label: string;
  impact: ForecastDriverImpact;
  direction: ForecastDriverDirection;
};

export type ForecastContext = {
  /** Planned delivery anchor (ISO date) from milestone or parsed timeline */
  baselineDate: string | null;
  /** Human label for the anchor (milestone title or timeline text) */
  anchorLabel: string;
  openMilestoneCount: number;
  /** Sum of approved role estimation days (feeds baseline when no milestone) */
  approvedTotalDays?: number;
  approvedEstimationConfidence?: number | null;
};

export type DeliveryForecast = Forecast & {
  expectedDate: string;
  p10: string;
  p50: string;
  p90: string;
  drivers: ForecastDriver[];
  baselineDate: string | null;
  /** Median forecast minus baseline (positive = slip) */
  delayDays: number;
  anchorLabel: string;
};

const MS_PER_DAY = 86_400_000;

export function generateForecast(signals: ProjectSignals): Forecast {
  const redFlags = countRedFlags(signals);

  if (redFlags >= 4) {
    return {
      prediction:
        "Significant delay likely in the next 7–14 days unless blockers are escalated",
      confidence: 0.82,
      horizonDays: 14,
      trend: "declining",
    };
  }

  if (redFlags === 3) {
    return {
      prediction:
        "Confidence likely to drop below 60% within 14 days at current trajectory",
      confidence: 0.74,
      horizonDays: 14,
      trend: "declining",
    };
  }

  if (redFlags === 2) {
    return {
      prediction:
        "Watch list — momentum slowing; targeted intervention could keep delivery on track",
      confidence: 0.66,
      horizonDays: 21,
      trend: "declining",
    };
  }

  if (redFlags === 1) {
    return {
      prediction: "Broadly on track with one risk factor to monitor",
      confidence: 0.71,
      horizonDays: 21,
      trend: "stable",
    };
  }

  return {
    prediction: "On track to deliver as planned",
    confidence: 0.85,
    horizonDays: 30,
    trend: signals.velocity > 0.85 ? "improving" : "stable",
  };
}

export function computeDeliveryForecast(
  signals: ProjectSignals,
  context: ForecastContext,
): DeliveryForecast {
  const base = generateForecast(signals);
  const redFlags = countRedFlags(signals);
  const delayDays = estimateDelayDays(signals, redFlags);
  const spread = uncertaintySpread(base.confidence, redFlags);

  const baseline = resolveBaselineDate(context);
  const p50 = addDays(baseline, delayDays);
  const p10 = addDays(baseline, Math.max(0, delayDays - spread));
  const p90 = addDays(baseline, delayDays + spread);

  const baselineMs = baseline.getTime();
  const delayVsBaseline = Math.round(
    (p50.getTime() - baselineMs) / MS_PER_DAY,
  );

  const drivers = extractDrivers(signals, context);
  const prediction = buildPrediction(base, delayVsBaseline, context.anchorLabel);

  return {
    ...base,
    prediction,
    expectedDate: toIsoDate(p50),
    p10: toIsoDate(p10),
    p50: toIsoDate(p50),
    p90: toIsoDate(p90),
    drivers,
    baselineDate: context.baselineDate,
    delayDays: delayVsBaseline,
    anchorLabel: context.anchorLabel,
  };
}

function countRedFlags(signals: ProjectSignals): number {
  return (
    (signals.milestoneDelay ? 2 : 0) +
    (signals.velocity < 0.7 ? 2 : 0) +
    (signals.blockers > 5 ? 1 : 0) +
    (signals.dependencyDelay ? 1 : 0) +
    (signals.overdueTasks > 8 ? 1 : 0)
  );
}

function estimateDelayDays(signals: ProjectSignals, redFlags: number): number {
  let delay = redFlags * 4;

  if (signals.milestoneDelay) delay += 10;
  if (signals.velocity < 0.7) {
    delay += Math.round((0.7 - signals.velocity) * 28);
  }
  if (signals.blockers > 5) delay += 6;
  if (signals.dependencyDelay) delay += 8;
  if (signals.overdueTasks > 8) delay += 4;

  const openRatio =
    signals.totalTasks > 0
      ? (signals.totalTasks - signals.milestoneProgress * signals.totalTasks) /
        signals.totalTasks
      : 0;
  if (openRatio > 0.5 && signals.velocity < 0.8) {
    delay += Math.round(openRatio * 14);
  }

  if (signals.velocity > 0.9 && redFlags === 0) {
    delay = Math.max(0, delay - 5);
  }

  return Math.max(0, delay);
}

function uncertaintySpread(confidence: number, redFlags: number): number {
  const base = 5 + redFlags * 4;
  return Math.round(base + (1 - confidence) * 18);
}

function resolveBaselineDate(context: ForecastContext): Date {
  if (context.baselineDate) {
    return startOfDay(new Date(context.baselineDate));
  }
  if (context.approvedTotalDays && context.approvedTotalDays > 0) {
    const d = new Date();
    d.setDate(d.getDate() + Math.round(context.approvedTotalDays));
    return startOfDay(d);
  }
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 90);
  return startOfDay(fallback);
}

function extractDrivers(
  signals: ProjectSignals,
  context: ForecastContext,
): ForecastDriver[] {
  const drivers: ForecastDriver[] = [];

  if (signals.milestoneDelay) {
    drivers.push({
      id: "milestone-delay",
      label: "Milestone slippage from overdue work",
      impact: "high",
      direction: "delay",
    });
  }
  if (signals.velocity < 0.7) {
    drivers.push({
      id: "velocity",
      label: `Velocity at ${Math.round(signals.velocity * 100)}% of target`,
      impact: signals.velocity < 0.5 ? "high" : "medium",
      direction: "delay",
    });
  }
  if (signals.blockers > 3) {
    drivers.push({
      id: "blockers",
      label: `${signals.blockers} active blockers`,
      impact: signals.blockers > 5 ? "high" : "medium",
      direction: "delay",
    });
  }
  if (signals.dependencyDelay) {
    drivers.push({
      id: "dependencies",
      label: "Cross-team or dependency delays",
      impact: "medium",
      direction: "delay",
    });
  }
  if (signals.overdueTasks > 0) {
    drivers.push({
      id: "overdue",
      label: `${signals.overdueTasks} overdue tasks`,
      impact: signals.overdueTasks > 8 ? "high" : "medium",
      direction: "delay",
    });
  }
  if (!signals.standupsComplete) {
    drivers.push({
      id: "standups",
      label: "Standup cadence incomplete this cycle",
      impact: "low",
      direction: "delay",
    });
  }
  if (signals.risks > 4) {
    drivers.push({
      id: "risks",
      label: `${signals.risks} open high-severity risks`,
      impact: "medium",
      direction: "delay",
    });
  }
  if (
    context.approvedEstimationConfidence != null &&
    context.approvedEstimationConfidence < 60
  ) {
    drivers.push({
      id: "estimation-confidence",
      label: "Low confidence on approved role estimates",
      impact: "medium",
      direction: "delay",
    });
  }
  if (signals.velocity > 0.85 && drivers.length === 0) {
    drivers.push({
      id: "momentum",
      label: "Strong completion momentum",
      impact: "low",
      direction: "accelerate",
    });
  }
  if (drivers.length === 0) {
    drivers.push({
      id: "stable",
      label: "Signals within normal range",
      impact: "low",
      direction: "neutral",
    });
  }

  return drivers.slice(0, 5);
}

function buildPrediction(
  base: Forecast,
  delayDays: number,
  anchorLabel: string,
): string {
  if (delayDays <= 0) {
    return base.prediction;
  }
  if (delayDays <= 7) {
    return `Minor slip (~${delayDays}d) vs ${anchorLabel} at current pace`;
  }
  if (delayDays <= 21) {
    return `Forecast slip of ~${delayDays} days vs ${anchorLabel}`;
  }
  return `Material delay (~${delayDays}d) projected vs ${anchorLabel}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Parse free-text project timeline into an approximate end date. */
export function parseTimelineToDate(timeline: string | null | undefined): string | null {
  if (!timeline?.trim()) return null;
  const text = timeline.trim();

  const iso = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];

  const quarter = text.match(/\bQ([1-4])\s*(20\d{2})\b/i);
  if (quarter) {
    const q = Number(quarter[1]);
    const year = Number(quarter[2]);
    const month = q * 3;
    return toIsoDate(new Date(year, month, 0));
  }

  const monthYear = text.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(20\d{2})\b/i,
  );
  if (monthYear) {
    const monthIndex = monthNameToIndex(monthYear[1]);
    if (monthIndex >= 0) {
      return toIsoDate(new Date(Number(monthYear[2]), monthIndex + 1, 0));
    }
  }

  const weeks = text.match(/\b(\d+)\s*weeks?\b/i);
  if (weeks) {
    const d = new Date();
    d.setDate(d.getDate() + Number(weeks[1]) * 7);
    return toIsoDate(d);
  }

  return null;
}

function monthNameToIndex(name: string): number {
  const n = name.slice(0, 3).toLowerCase();
  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  return months.indexOf(n);
}
