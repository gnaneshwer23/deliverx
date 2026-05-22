/**
 * Adaptive Engine — Phase 7
 *
 * Pure compute layer for the continuous adaptation loop. Inputs are an
 * `ExecutionData` snapshot derived from project signals; outputs are
 * structured drift, stability, pressure, scenarios, and adaptive
 * recommendations. No I/O, no Supabase, no React.
 *
 * Guardrails are enforced upstream — the engine NEVER returns auto-
 * actionable instructions, only PM-reviewable recommendations.
 */

import type { ProjectSignals } from "./intelligenceEngine";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type ExecutionData = {
  taskDelayRate: number; // 0..1
  taskCompletionRate: number; // 0..1
  standupParticipation: number; // 0..1
  blockers: number;
  dependencyFailures: number; // upstream deps failing/at-risk
  tasksPerUser: number;
  velocity: number; // 0..1
  velocityDeclining: boolean;
  dependencyRisk: boolean;
};

export type Severity = "low" | "medium" | "high";
export type StabilityTier = "stable" | "watch" | "unstable";
export type Volatility = "steady" | "rising" | "falling";

export type DriftSignal = {
  type: "timeline_drift" | "engagement_drift" | "execution_drift" | "dependency_drift";
  severity: Severity;
  message: string;
};

export type Stability = {
  score: number; // 0..100
  tier: StabilityTier;
  volatility: Volatility;
  drivers: string[];
};

export type PressureIndicator = {
  area: "workload" | "blockers" | "dependency" | "velocity";
  message: string;
  intensity: Severity;
};

export type Scenario = {
  scenario: string;
  outcome: string;
  probability: number; // 0..1
};

export type AdaptiveRecommendation = {
  key: string; // stable identifier for review-keying
  action: string;
  rationale: string;
  confidence: number; // 0..1
  category: "blocker" | "scope" | "dependency" | "cadence" | "capacity";
};

export type AdaptiveSnapshot = {
  data: ExecutionData;
  drift: DriftSignal[];
  stability: Stability;
  pressure: PressureIndicator[];
  scenarios: Scenario[];
  recommendations: AdaptiveRecommendation[];
};

// ---------------------------------------------------------------------------
// Signal → ExecutionData adapter
//
// Today the upstream is the deterministic mock loader. When real telemetry
// lands, replace `loadProjectSignals` and this adapter stays untouched.
// ---------------------------------------------------------------------------

export function toExecutionData(
  signals: ProjectSignals,
  ctx: { teamSize?: number; dependencyFailures?: number } = {},
): ExecutionData {
  const taskDelayRate =
    signals.totalTasks > 0
      ? Math.min(1, signals.overdueTasks / signals.totalTasks)
      : 0;
  const dependencyFailures =
    ctx.dependencyFailures ?? (signals.dependencyDelay ? 1 : 0);
  return {
    taskDelayRate,
    taskCompletionRate: 1 - taskDelayRate,
    standupParticipation: signals.standupsComplete ? 0.82 : 0.45,
    blockers: signals.blockers,
    dependencyFailures,
    tasksPerUser: signals.totalTasks / Math.max(ctx.teamSize ?? 6, 1),
    velocity: signals.velocity,
    velocityDeclining: signals.velocity < 0.7,
    dependencyRisk: signals.dependencyDelay || dependencyFailures > 0,
  };
}

// ---------------------------------------------------------------------------
// Drift
// ---------------------------------------------------------------------------

export function detectDeliveryDrift(data: ExecutionData): DriftSignal[] {
  const drift: DriftSignal[] = [];

  if (data.taskDelayRate > 0.3) {
    drift.push({
      type: "timeline_drift",
      severity: data.taskDelayRate > 0.5 ? "high" : "medium",
      message: `${Math.round(data.taskDelayRate * 100)}% of tasks slipping — timeline is drifting`,
    });
  }

  if (data.standupParticipation < 0.6) {
    drift.push({
      type: "engagement_drift",
      severity: data.standupParticipation < 0.4 ? "high" : "medium",
      message: "Team engagement declining — standup participation below threshold",
    });
  }

  if (data.velocityDeclining) {
    drift.push({
      type: "execution_drift",
      severity: data.velocity < 0.55 ? "high" : "medium",
      message: `Execution slowing — velocity at ${Math.round(data.velocity * 100)}% of plan`,
    });
  }

  if (data.dependencyFailures > 0) {
    drift.push({
      type: "dependency_drift",
      severity: data.dependencyFailures > 2 ? "high" : "medium",
      message: `${data.dependencyFailures} upstream ${data.dependencyFailures === 1 ? "dependency" : "dependencies"} failing — risk propagating downstream`,
    });
  }

  // Alert-fatigue guardrail: cap to top 3 by severity.
  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  return drift.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 3);
}

// ---------------------------------------------------------------------------
// Stability
// ---------------------------------------------------------------------------

export function computeStability(data: ExecutionData): Stability {
  let score = 100;
  score -= data.blockers * 3;
  score -= data.dependencyFailures * 4;
  score -= (1 - data.taskCompletionRate) * 40;
  score = clamp(Math.round(score), 0, 100);

  const tier: StabilityTier =
    score >= 80 ? "stable" : score >= 60 ? "watch" : "unstable";

  const redFlags =
    (data.blockers > 4 ? 1 : 0) +
    (data.dependencyFailures > 1 ? 1 : 0) +
    (data.taskDelayRate > 0.4 ? 1 : 0) +
    (data.velocityDeclining ? 1 : 0);
  const volatility: Volatility =
    redFlags >= 2 ? "rising" : redFlags === 0 ? "falling" : "steady";

  const drivers: string[] = [];
  if (data.blockers > 3) drivers.push(`${data.blockers} active blockers`);
  if (data.dependencyFailures > 0)
    drivers.push(`${data.dependencyFailures} dependency failure${data.dependencyFailures === 1 ? "" : "s"}`);
  if (data.taskDelayRate > 0.2)
    drivers.push(`${Math.round(data.taskDelayRate * 100)}% task delay rate`);
  if (drivers.length === 0) drivers.push("All structural inputs within range");

  return { score, tier, volatility, drivers: drivers.slice(0, 3) };
}

// ---------------------------------------------------------------------------
// Pressure
// ---------------------------------------------------------------------------

export function detectPressure(data: ExecutionData): PressureIndicator[] {
  const out: PressureIndicator[] = [];

  if (data.tasksPerUser > 10) {
    out.push({
      area: "workload",
      message: `Workload overload — ${data.tasksPerUser.toFixed(1)} tasks per teammate`,
      intensity: data.tasksPerUser > 14 ? "high" : "medium",
    });
  }

  if (data.blockers > 5) {
    out.push({
      area: "blockers",
      message: `Excessive blockers — ${data.blockers} active`,
      intensity: data.blockers > 8 ? "high" : "medium",
    });
  }

  if (data.dependencyFailures > 1) {
    out.push({
      area: "dependency",
      message: `${data.dependencyFailures} upstream failures — coordination cost rising`,
      intensity: "high",
    });
  }

  if (data.velocityDeclining && data.taskDelayRate > 0.25) {
    out.push({
      area: "velocity",
      message: "Velocity declining while delay rate climbs — compounding pressure",
      intensity: "high",
    });
  }

  return out.slice(0, 3);
}

// ---------------------------------------------------------------------------
// Adaptive recommendations
//
// Note: every recommendation carries a stable `key` so PM reviews persist
// across reload + recompute cycles.
// ---------------------------------------------------------------------------

export function generateAdaptiveRecommendations(
  data: ExecutionData,
): AdaptiveRecommendation[] {
  const recs: AdaptiveRecommendation[] = [];

  if (data.dependencyRisk) {
    recs.push({
      key: "resolve-dependencies",
      action: "Prioritise dependency resolution this sprint",
      rationale:
        "High failure probability downstream — unblock the source teams first",
      confidence: 0.88,
      category: "dependency",
    });
  }

  if (data.velocityDeclining) {
    recs.push({
      key: "split-or-trim-scope",
      action: "Reduce scope or split the next milestone",
      rationale: `Execution slowdown detected — velocity at ${Math.round(data.velocity * 100)}%`,
      confidence: 0.81,
      category: "scope",
    });
  }

  if (data.blockers > 4) {
    recs.push({
      key: "blocker-triage",
      action: "Run a 30-minute blocker triage with the steering group",
      rationale: `${data.blockers} blockers active — surface the recurring root causes`,
      confidence: 0.84,
      category: "blocker",
    });
  }

  if (data.tasksPerUser > 12) {
    recs.push({
      key: "redistribute-load",
      action: "Redistribute workload across the team",
      rationale: `${data.tasksPerUser.toFixed(1)} tasks per teammate — burnout risk rising`,
      confidence: 0.76,
      category: "capacity",
    });
  }

  if (data.standupParticipation < 0.55) {
    recs.push({
      key: "reset-cadence",
      action: "Reset standup cadence — change time, format, or facilitator",
      rationale: "Engagement dropping — fresh structure will surface hidden blockers",
      confidence: 0.68,
      category: "cadence",
    });
  }

  if (recs.length === 0) {
    recs.push({
      key: "hold-course",
      action: "Hold course — no intervention recommended",
      rationale: "All adaptive signals within healthy range",
      confidence: 0.92,
      category: "cadence",
    });
  }

  return recs.slice(0, 4);
}

// ---------------------------------------------------------------------------
// Forecast scenarios
//
// Deterministic short-list of plausible futures keyed off current signals.
// ---------------------------------------------------------------------------

export function generateScenarios(data: ExecutionData): Scenario[] {
  const scenarios: Scenario[] = [];

  if (data.dependencyRisk) {
    const dropTo = Math.max(
      35,
      Math.round(80 - data.dependencyFailures * 18 - data.blockers * 2),
    );
    scenarios.push({
      scenario: "Dependency delay persists for two more weeks",
      outcome: `Milestone confidence drops to ${dropTo}%`,
      probability: clamp(0.55 + data.dependencyFailures * 0.08, 0.55, 0.9),
    });
  }

  if (data.velocityDeclining) {
    const days = Math.max(3, Math.round((0.85 - data.velocity) * 30));
    scenarios.push({
      scenario: "Current velocity continues",
      outcome: `Milestone slipping by approximately ${days} days`,
      probability: clamp(0.5 + (0.85 - data.velocity), 0.5, 0.9),
    });
  }

  if (data.blockers > 2) {
    const recoverTo = Math.min(92, 60 + Math.max(0, 10 - data.blockers) * 4);
    scenarios.push({
      scenario: "Targeted blocker resolution this sprint",
      outcome: `Stability recovers to ${recoverTo}+ within 10 days`,
      probability: clamp(0.4 + (data.standupParticipation - 0.5), 0.4, 0.78),
    });
  }

  if (scenarios.length === 0) {
    scenarios.push({
      scenario: "Current cadence held",
      outcome: "Delivery completes within the original window",
      probability: 0.78,
    });
  }

  return scenarios.slice(0, 3);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
