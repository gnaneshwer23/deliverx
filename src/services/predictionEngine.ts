/**
 * Delivery prediction engine v2 — role effort, cost/delay risk, date ranges.
 */

import type { DeliveryForecast } from "./forecastEngine";
import type { EstimationPackRow } from "./estimationPacks";
import {
  ESTIMATION_ROLE_LABELS,
  type EstimationPackRole,
} from "./estimationEngine";
import type { ProjectSignals } from "./intelligenceEngine";

export type RiskTier = "low" | "medium" | "high";

export type RoleEffortRow = {
  role: EstimationPackRole;
  label: string;
  days: number;
  confidence: number;
  status: EstimationPackRow["status"];
  approved: boolean;
};

export type DeliveryPrediction = {
  expectedDate: string;
  bestDate: string;
  worstDate: string;
  delayRisk: { tier: RiskTier; label: string; slipDays: number };
  costRisk: {
    tier: RiskTier;
    label: string;
    approved?: number;
    forecast?: number;
    currency?: string;
  };
  roleEffort: RoleEffortRow[];
  totalEffortDays: number;
  effortConfidence: number | null;
  forecast: DeliveryForecast;
  insight: string;
  modelVersion: "v2";
};

const ROLE_ORDER: EstimationPackRole[] = ["pm", "ba", "engineering", "qa"];

export function buildRoleEffortBreakdown(
  packs: EstimationPackRow[],
): RoleEffortRow[] {
  const byRole = new Map<EstimationPackRole, EstimationPackRow>();
  for (const pack of packs) {
    const existing = byRole.get(pack.role);
    if (!existing || pack.status === "approved") {
      byRole.set(pack.role, pack);
    }
  }

  return ROLE_ORDER.filter((role) => byRole.has(role)).map((role) => {
    const pack = byRole.get(role)!;
    return {
      role,
      label: ESTIMATION_ROLE_LABELS[role],
      days: pack.total_days,
      confidence: pack.confidence,
      status: pack.status,
      approved: pack.status === "approved",
    };
  });
}

export function assessDelayRisk(forecast: DeliveryForecast): DeliveryPrediction["delayRisk"] {
  const slip = forecast.delayDays;
  if (slip >= 21 || forecast.trend === "declining") {
    return {
      tier: "high",
      label: "High delay risk — schedule intervention recommended",
      slipDays: slip,
    };
  }
  if (slip >= 7) {
    return {
      tier: "medium",
      label: "Moderate slip vs plan — monitor weekly",
      slipDays: slip,
    };
  }
  return {
    tier: "low",
    label: slip > 0 ? "Minor variance from baseline" : "On track vs plan",
    slipDays: slip,
  };
}

export function assessCostRisk(input: {
  approved?: number;
  forecast?: number;
  spent?: number;
  currency?: string;
}): DeliveryPrediction["costRisk"] {
  const approved = input.approved ?? 0;
  const forecast = input.forecast ?? input.spent ?? 0;
  const currency = input.currency ?? "GBP";

  if (approved <= 0) {
    return {
      tier: "medium",
      label: "Budget baseline not set — cost risk unknown",
      currency,
    };
  }

  const ratio = forecast / approved;
  if (ratio >= 1.15) {
    return {
      tier: "high",
      label: `Forecast ${Math.round(ratio * 100)}% of approved budget`,
      approved,
      forecast,
      currency,
    };
  }
  if (ratio >= 1.02) {
    return {
      tier: "medium",
      label: "Forecast approaching budget ceiling",
      approved,
      forecast,
      currency,
    };
  }
  return {
    tier: "low",
    label: "Spend within approved envelope",
    approved,
    forecast,
    currency,
  };
}

export function effortAdjustedDelayDays(
  forecast: DeliveryForecast,
  totalEffortDays: number,
  signals: ProjectSignals,
): number {
  if (totalEffortDays <= 0) return forecast.delayDays;

  const remainingRatio =
    signals.totalTasks > 0
      ? Math.max(0, 1 - signals.milestoneProgress)
      : 0.5;
  const impliedRemainingDays = totalEffortDays * remainingRatio;
  const velocityDaysPerWeek = Math.max(signals.velocity * 5, 0.5);
  const weeksToComplete = impliedRemainingDays / velocityDaysPerWeek;
  const effortSlip = Math.max(0, Math.round(weeksToComplete * 7 - 14));

  return Math.max(forecast.delayDays, effortSlip);
}

export function buildDeliveryPrediction(input: {
  forecast: DeliveryForecast;
  packs: EstimationPackRow[];
  budget?: {
    approved?: number;
    forecast?: number;
    spent?: number;
    currency?: string;
  };
  signals?: ProjectSignals;
}): DeliveryPrediction {
  const roleEffort = buildRoleEffortBreakdown(input.packs);
  const approvedPacks = roleEffort.filter((r) => r.approved);
  const totalEffortDays = roleEffort.reduce((sum, r) => sum + r.days, 0);
  const effortConfidence =
    approvedPacks.length > 0
      ? Math.round(
          approvedPacks.reduce((sum, r) => sum + r.confidence, 0) / approvedPacks.length,
        )
      : roleEffort.length > 0
        ? Math.round(
            roleEffort.reduce((sum, r) => sum + r.confidence, 0) / roleEffort.length,
          )
        : null;

  let forecast = input.forecast;
  if (input.signals && totalEffortDays > 0) {
    const adjustedDelay = effortAdjustedDelayDays(forecast, totalEffortDays, input.signals);
    if (adjustedDelay > forecast.delayDays) {
      forecast = {
        ...forecast,
        delayDays: adjustedDelay,
        prediction: `${forecast.prediction} Effort model suggests up to ${adjustedDelay}d slip.`,
      };
    }
  }

  const delayRisk = assessDelayRisk(forecast);
  const costRisk = assessCostRisk(input.budget ?? {});

  const insight = buildInsight(delayRisk, costRisk, totalEffortDays, effortConfidence);

  return {
    expectedDate: forecast.expectedDate,
    bestDate: forecast.p10,
    worstDate: forecast.p90,
    delayRisk,
    costRisk,
    roleEffort,
    totalEffortDays: Math.round(totalEffortDays * 10) / 10,
    effortConfidence,
    forecast,
    insight,
    modelVersion: "v2",
  };
}

function buildInsight(
  delay: DeliveryPrediction["delayRisk"],
  cost: DeliveryPrediction["costRisk"],
  effortDays: number,
  effortConfidence: number | null,
): string {
  const parts: string[] = [];
  parts.push(delay.label);
  if (cost.tier !== "low") parts.push(cost.label);
  if (effortDays > 0) {
    parts.push(
      `${effortDays} role-days estimated${effortConfidence != null ? ` (${effortConfidence}% confidence)` : ""}.`,
    );
  }
  return parts.join(" ");
}

export function formatPredictionDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function riskTierAccent(tier: RiskTier): "teal" | "amber" | "rose" {
  if (tier === "high") return "rose";
  if (tier === "medium") return "amber";
  return "teal";
}
