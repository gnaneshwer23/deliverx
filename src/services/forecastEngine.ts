/**
 * Forecast Engine — pure compute. Given a project's signals, emits a
 * short-horizon prediction and a confidence score.
 *
 * Today the inputs come from the deterministic mock signal loader, so
 * outputs are stable per project ID. When the tasks/blockers schema
 * lands, the same signal interface gets populated with real telemetry
 * and the forecast becomes meaningful without any engine changes.
 */

import type { ProjectSignals } from "./intelligenceEngine";

export type Forecast = {
  prediction: string;
  confidence: number; // 0..1
  horizonDays: number;
  trend: "stable" | "declining" | "improving";
};

export function generateForecast(signals: ProjectSignals): Forecast {
  // Sum of red flags drives both the prediction and the horizon.
  const redFlags =
    (signals.milestoneDelay ? 2 : 0) +
    (signals.velocity < 0.7 ? 2 : 0) +
    (signals.blockers > 5 ? 1 : 0) +
    (signals.dependencyDelay ? 1 : 0) +
    (signals.overdueTasks > 8 ? 1 : 0);

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
