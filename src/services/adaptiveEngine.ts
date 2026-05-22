/**
 * Adaptive Engine — Phase 7 (with reasoning pipeline)
 *
 * Pure compute. Implements the layered reasoning flow:
 *
 *   Signals → Patterns → Context → Interpretation
 *           → Candidates → Scored → Selected → Explained
 *
 * No I/O. The façade (src/services/adaptive.ts) is responsible for
 * loading signals, dependencies, memory, and review aggregates, then
 * passing them in as `RecommendationContext`.
 */

import type { ProjectSignals } from "./intelligenceEngine";

// ===========================================================================
// Shared types
// ===========================================================================

export type ExecutionData = {
  taskDelayRate: number; // 0..1
  taskCompletionRate: number; // 0..1
  standupParticipation: number; // 0..1
  blockers: number;
  dependencyFailures: number;
  tasksPerUser: number;
  velocity: number; // 0..1
  velocityDeclining: boolean;
  dependencyRisk: boolean;
};

export type Severity = "low" | "medium" | "high";
export type StabilityTier = "stable" | "watch" | "unstable";
export type Volatility = "steady" | "rising" | "falling";

export type DriftSignal = {
  type:
    | "timeline_drift"
    | "engagement_drift"
    | "execution_drift"
    | "dependency_drift";
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

// ---------------------------------------------------------------------------
// Phase 7 reasoning types
// ---------------------------------------------------------------------------

export type PatternId =
  | "dependency_cascade"
  | "scope_overload"
  | "engagement_decay"
  | "milestone_pressure"
  | "blocker_concentration"
  | "stable_run";

export type ExecutionPattern = {
  id: PatternId;
  name: string;
  description: string;
  severity: Severity;
};

export type RecommendationCategory =
  | "blocker"
  | "scope"
  | "dependency"
  | "cadence"
  | "capacity"
  | "governance";

/** Loaded by the façade and passed into the engine. */
export type RecommendationContext = {
  projectType?: string | null;
  orgGovernanceStyle?: string | null;
  /** Cumulative org-wide review outcomes per recommendation_key. */
  historicalSuccessByKey?: Map<
    string,
    { approved: number; rejected: number; sampleSize: number }
  >;
  /** Programme importance hint (default "medium"). */
  programmeImportance?: "low" | "medium" | "high";
  /** Lessons (memory tags) overlapping this project — biases candidate set. */
  relevantTags?: string[];
};

export type CandidateRecommendation = {
  key: string;
  category: RecommendationCategory;
  action: string;
  rationale: string;
  /** Intrinsic estimates from rule + situation — each 0..1. */
  impactScore: number;
  confidenceScore: number;
  speedScore: number;
  /** Pattern ids this candidate addresses. */
  patternIds: PatternId[];
  /** Plain-language expected outcome shown to the PM. */
  expectedImpact: string;
};

export type AdaptiveRecommendation = CandidateRecommendation & {
  /** Final composite score after weighting + historical adjustment. 0..1. */
  composite: number;
  /** Confidence after applying org-wide feedback bias (separate from raw). */
  confidence: number;
  /** Optional interpretation tag — what the AI thinks is going on. */
  interpretation: string;
};

export type AdaptiveSnapshot = {
  data: ExecutionData;
  patterns: ExecutionPattern[];
  interpretation: string;
  drift: DriftSignal[];
  stability: Stability;
  pressure: PressureIndicator[];
  scenarios: Scenario[];
  recommendations: AdaptiveRecommendation[];
};

// ===========================================================================
// Signal → ExecutionData adapter
// ===========================================================================

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

// ===========================================================================
// Step 1: Drift / Stability / Pressure (unchanged from prior)
// ===========================================================================

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
      message:
        "Team engagement declining — standup participation below threshold",
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

  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  return drift.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 3);
}

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
    drivers.push(
      `${data.dependencyFailures} dependency failure${data.dependencyFailures === 1 ? "" : "s"}`,
    );
  if (data.taskDelayRate > 0.2)
    drivers.push(`${Math.round(data.taskDelayRate * 100)}% task delay rate`);
  if (drivers.length === 0) drivers.push("All structural inputs within range");

  return { score, tier, volatility, drivers: drivers.slice(0, 3) };
}

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
      message:
        "Velocity declining while delay rate climbs — compounding pressure",
      intensity: "high",
    });
  }

  return out.slice(0, 3);
}

// ===========================================================================
// Step 2: Pattern detection (multi-signal clusters, not single events)
// ===========================================================================

export function detectPatterns(data: ExecutionData): ExecutionPattern[] {
  const out: ExecutionPattern[] = [];

  if (data.dependencyFailures >= 1 && data.blockers > 3) {
    out.push({
      id: "dependency_cascade",
      name: "Dependency cascade",
      description:
        "Blockers are concentrating in the dependency chain — risk is propagating downstream",
      severity: data.dependencyFailures > 2 ? "high" : "medium",
    });
  }

  if (data.tasksPerUser > 10 && data.taskCompletionRate < 0.7) {
    out.push({
      id: "scope_overload",
      name: "Scope overload",
      description:
        "Workload exceeds throughput — completion is consistently lagging assignment",
      severity: data.tasksPerUser > 14 ? "high" : "medium",
    });
  }

  if (data.standupParticipation < 0.6 && data.velocityDeclining) {
    out.push({
      id: "engagement_decay",
      name: "Engagement decay",
      description:
        "Coordination signals weakening and execution is following them down",
      severity: data.standupParticipation < 0.4 ? "high" : "medium",
    });
  }

  if (data.taskDelayRate > 0.3 && data.velocityDeclining) {
    out.push({
      id: "milestone_pressure",
      name: "Milestone pressure",
      description:
        "Slipping tasks compounding with declining velocity — milestone likely to slip",
      severity: data.taskDelayRate > 0.5 ? "high" : "medium",
    });
  }

  if (
    data.blockers > 5 &&
    out.find((p) => p.id === "dependency_cascade") === undefined
  ) {
    out.push({
      id: "blocker_concentration",
      name: "Blocker concentration",
      description: "Blocker count above threshold without a single dominant cause",
      severity: data.blockers > 8 ? "high" : "medium",
    });
  }

  if (out.length === 0) {
    out.push({
      id: "stable_run",
      name: "Stable run",
      description: "All adaptive signals within healthy range",
      severity: "low",
    });
  }

  return out.slice(0, 3);
}

// ===========================================================================
// Step 3: Interpretation
// ===========================================================================

export function interpretExecution(
  data: ExecutionData,
  patterns: ExecutionPattern[],
  context: RecommendationContext = {},
): string {
  if (patterns.length === 0 || patterns[0].id === "stable_run") {
    return "Execution is broadly stable — current cadence is working.";
  }

  const lead = patterns[0];
  const tags = (context.relevantTags ?? []).slice(0, 2).join(", ");
  const contextBit = tags ? ` History on similar work (${tags}) suggests early intervention pays off.` : "";

  switch (lead.id) {
    case "dependency_cascade":
      return `Execution instability driven by dependency mis-sequencing — unblock upstream sources before adjusting downstream scope.${contextBit}`;
    case "scope_overload":
      return `Throughput cannot match committed scope at current capacity — relieve load before quality erodes.${contextBit}`;
    case "engagement_decay":
      return `Coordination signals decay before execution decay — restoring cadence usually recovers velocity.${contextBit}`;
    case "milestone_pressure":
      return `Schedule pressure is compounding — split or sequence the next milestone to absorb slip.${contextBit}`;
    case "blocker_concentration":
      return `Blocker count high without one dominant cause — a focused triage usually reveals shared roots.${contextBit}`;
    default:
      return `Multiple adaptive signals firing — see recommendations.${contextBit}`;
  }
}

// ===========================================================================
// Step 4–7: Candidate generation, scoring, selection
// ===========================================================================

const W_IMPACT = 0.4;
const W_CONFIDENCE = 0.4;
const W_SPEED = 0.2;

/** Minimum review sample size before we bias confidence with feedback. */
const MIN_FEEDBACK_SAMPLE = 3;
/** Weight given to org feedback vs intrinsic confidence (0 = ignore, 1 = trust feedback fully). */
const FEEDBACK_WEIGHT = 0.4;

function generateCandidates(
  data: ExecutionData,
  patterns: ExecutionPattern[],
): CandidateRecommendation[] {
  const ids = new Set(patterns.map((p) => p.id));
  const out: CandidateRecommendation[] = [];

  // Pattern: dependency_cascade
  if (ids.has("dependency_cascade") || data.dependencyRisk) {
    out.push({
      key: "escalate-dependency",
      category: "dependency",
      action: "Escalate the upstream dependency to the steering group within 48h",
      rationale: `${data.dependencyFailures} upstream ${data.dependencyFailures === 1 ? "failure" : "failures"} propagating to downstream tasks`,
      impactScore: 0.85,
      confidenceScore: 0.86,
      speedScore: 0.7,
      patternIds: ["dependency_cascade"],
      expectedImpact: "Stabilises the milestone timeline within 5–7 days",
    });
    out.push({
      key: "resequence-dependent-tasks",
      category: "dependency",
      action: "Re-sequence dependent tasks to decouple from the blocked chain",
      rationale: "Parallelises non-blocked work while upstream is unblocked",
      impactScore: 0.6,
      confidenceScore: 0.74,
      speedScore: 0.6,
      patternIds: ["dependency_cascade"],
      expectedImpact: "Recovers ~15% of lost velocity within the sprint",
    });
  }

  // Pattern: milestone_pressure / scope_overload
  if (ids.has("milestone_pressure") || data.velocityDeclining) {
    out.push({
      key: "split-or-trim-scope",
      category: "scope",
      action: "Split the next milestone into two phases",
      rationale: `Velocity at ${Math.round(data.velocity * 100)}% of plan with rising delay rate`,
      impactScore: 0.7,
      confidenceScore: 0.78,
      speedScore: 0.55,
      patternIds: ["milestone_pressure", "scope_overload"],
      expectedImpact: "Reduces milestone delay risk by ~25%",
    });
  }

  if (ids.has("scope_overload") || data.tasksPerUser > 10) {
    out.push({
      key: "redistribute-load",
      category: "capacity",
      action: "Redistribute workload across the team this week",
      rationale: `${data.tasksPerUser.toFixed(1)} tasks per teammate — burnout risk rising`,
      impactScore: 0.55,
      confidenceScore: 0.72,
      speedScore: 0.8,
      patternIds: ["scope_overload"],
      expectedImpact: "Lifts completion rate by ~10–15% within two weeks",
    });
  }

  // Pattern: blocker_concentration
  if (ids.has("blocker_concentration") || data.blockers > 4) {
    out.push({
      key: "blocker-triage",
      category: "blocker",
      action: "Run a 30-minute blocker triage with the steering group",
      rationale: `${data.blockers} blockers active — surface the recurring root causes`,
      impactScore: 0.65,
      confidenceScore: 0.81,
      speedScore: 0.85,
      patternIds: ["blocker_concentration"],
      expectedImpact: "Resolves ~40% of active blockers in one cycle",
    });
    out.push({
      key: "owner-per-blocker",
      category: "governance",
      action: "Assign a single named owner to every active blocker",
      rationale: "Diffuse ownership extends blocker lifespan",
      impactScore: 0.5,
      confidenceScore: 0.7,
      speedScore: 0.9,
      patternIds: ["blocker_concentration"],
      expectedImpact: "Cuts mean blocker age by ~30%",
    });
  }

  // Pattern: engagement_decay
  if (ids.has("engagement_decay") || data.standupParticipation < 0.55) {
    out.push({
      key: "reset-cadence",
      category: "cadence",
      action: "Reset the standup cadence — change time, format, or facilitator",
      rationale:
        "Engagement is dropping — fresh structure typically surfaces hidden blockers",
      impactScore: 0.45,
      confidenceScore: 0.66,
      speedScore: 0.95,
      patternIds: ["engagement_decay"],
      expectedImpact: "Restores standup participation above 70% within a week",
    });
  }

  // Stable-run fallback
  if (out.length === 0) {
    out.push({
      key: "hold-course",
      category: "cadence",
      action: "Hold course — no intervention recommended",
      rationale: "All adaptive signals within healthy range",
      impactScore: 0.1,
      confidenceScore: 0.9,
      speedScore: 1,
      patternIds: ["stable_run"],
      expectedImpact: "Maintains the current healthy trajectory",
    });
  }

  return out;
}

/** Step 6 — applies feedback bias + computes composite score. */
function scoreCandidates(
  candidates: CandidateRecommendation[],
  context: RecommendationContext,
  interpretation: string,
): AdaptiveRecommendation[] {
  return candidates.map((c) => {
    const stats = context.historicalSuccessByKey?.get(c.key);
    let confidence = c.confidenceScore;
    if (stats && stats.sampleSize >= MIN_FEEDBACK_SAMPLE) {
      const decided = stats.approved + stats.rejected;
      const successRate =
        decided > 0 ? stats.approved / decided : c.confidenceScore;
      confidence =
        c.confidenceScore * (1 - FEEDBACK_WEIGHT) + successRate * FEEDBACK_WEIGHT;
    }

    // Programme importance lifts impact slightly for high-priority programmes.
    const importance = context.programmeImportance ?? "medium";
    const impactMultiplier =
      importance === "high" ? 1.05 : importance === "low" ? 0.95 : 1;

    const impact = clamp(c.impactScore * impactMultiplier, 0, 1);
    const composite = clamp(
      impact * W_IMPACT + confidence * W_CONFIDENCE + c.speedScore * W_SPEED,
      0,
      1,
    );

    return {
      ...c,
      impactScore: impact,
      confidence,
      composite,
      interpretation,
    };
  });
}

/** Public entry — runs the full 9-step pipeline. */
export function generateAdaptiveRecommendations(
  data: ExecutionData,
  context: RecommendationContext = {},
  options: { limit?: number } = {},
): AdaptiveRecommendation[] {
  const patterns = detectPatterns(data);
  const interpretation = interpretExecution(data, patterns, context);
  const candidates = generateCandidates(data, patterns);
  const scored = scoreCandidates(candidates, context, interpretation);
  const top = scored
    .sort((a, b) => b.composite - a.composite)
    .slice(0, options.limit ?? 3);
  return top;
}

// ===========================================================================
// Forecast scenarios (unchanged)
// ===========================================================================

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

// ===========================================================================
// Helpers
// ===========================================================================

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
