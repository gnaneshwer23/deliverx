/**
 * DeliverX Intelligence Engine
 *
 * Pure compute functions. No I/O, no Supabase, no React. Signals in,
 * scores/insights out. This is the swap-point that stays stable while
 * the upstream signal loader is replaced (mock → real).
 *
 * Keep functions deterministic so the same input always yields the same
 * output — required for caching, testing, and stable UI between requests.
 */

export type ProjectSignals = {
  overdueTasks: number;
  totalTasks: number;
  blockers: number;
  risks: number;
  standupsComplete: boolean;
  velocity: number; // 0..1
  milestoneDelay: boolean;
  dependencyDelay: boolean;
  blockedTaskTitles: string[];
  recurringBlockers: string[];
  averageCompletionDays: number;
  milestoneProgress: number; // 0..1
};

export type HealthTier = "healthy" | "watch" | "at-risk";
export type Trend = "up" | "flat" | "down";

export type Health = {
  score: number;
  tier: HealthTier;
  trend: Trend;
  factors: string[];
};

export type Confidence = {
  score: number;
  tier: HealthTier;
  explanation: string;
};

export type Recommendation = {
  id: string;
  text: string;
  confidence: number; // 0..1
  rationale: string;
};

export type DriftInsight = string;
export type BlockerInsight = string;

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export function computeProjectHealth(s: ProjectSignals): Health {
  let score = 100;
  score -= s.overdueTasks * 2;
  score -= s.blockers * 3;
  score -= s.risks * 2;
  if (!s.standupsComplete) score -= 10;
  score = clamp(score, 0, 100);

  const factors: string[] = [];
  if (s.overdueTasks > 5) factors.push("Overdue tasks rising");
  if (s.blockers > 3) factors.push("Blockers increasing");
  if (s.risks > 4) factors.push("Open risks above threshold");
  if (!s.standupsComplete) factors.push("Standups incomplete this cycle");
  if (s.velocity < 0.7) factors.push("Velocity below target");
  if (factors.length === 0) factors.push("All key signals within range");

  return {
    score,
    tier: tierFor(score),
    trend: trendFor(s),
    factors: factors.slice(0, 4),
  };
}

// ---------------------------------------------------------------------------
// Confidence
// ---------------------------------------------------------------------------

export function computeDeliveryConfidence(s: ProjectSignals): Confidence {
  let score = 100;
  if (s.velocity < 0.7) score -= 20;
  if (s.blockers > 5) score -= 15;
  if (s.milestoneDelay) score -= 25;
  if (s.dependencyDelay) score -= 10;
  score = clamp(score, 0, 100);

  const reasons: string[] = [];
  if (s.milestoneDelay) reasons.push("milestone slippage");
  if (s.velocity < 0.7) reasons.push("below-target velocity");
  if (s.dependencyDelay) reasons.push("dependency delays");
  if (s.blockers > 5) reasons.push("high blocker count");

  const explanation =
    reasons.length === 0
      ? "Delivery on track — no material headwinds detected"
      : `Confidence impacted by ${joinHumanList(reasons)}`;

  return { score, tier: tierFor(score), explanation };
}

// ---------------------------------------------------------------------------
// Risk detection (raw)
// ---------------------------------------------------------------------------

export function detectRisks(s: ProjectSignals): string[] {
  const risks: string[] = [];
  if (s.blockers > 3) risks.push("High blocker concentration");
  if (s.recurringBlockers.length > 0)
    risks.push("Recurring dependency blocker");
  if (s.overdueTasks / Math.max(s.totalTasks, 1) > 0.15)
    risks.push("Overdue ratio above 15%");
  return risks;
}

// ---------------------------------------------------------------------------
// Recommendations  (top 3 — alert-fatigue guard)
// ---------------------------------------------------------------------------

export function generateRecommendations(s: ProjectSignals): Recommendation[] {
  const candidates: Recommendation[] = [];

  if (s.milestoneDelay) {
    candidates.push({
      id: "split-milestone",
      text: "Split the next milestone into phases to reduce slip risk",
      confidence: 0.82,
      rationale: "Milestone is currently slipping",
    });
  }

  if (s.blockers > 3 || s.recurringBlockers.length > 0) {
    candidates.push({
      id: "escalate-blocker",
      text: "Escalate the unresolved infrastructure blocker to the steering group",
      confidence: 0.91,
      rationale: `${s.blockers} active blockers, ${s.recurringBlockers.length} recurring`,
    });
  }

  if (s.velocity < 0.7) {
    candidates.push({
      id: "rebalance-load",
      text: "Rebalance workstream load — velocity is below target",
      confidence: 0.74,
      rationale: `Velocity at ${Math.round(s.velocity * 100)}%`,
    });
  }

  if (s.overdueTasks > 5) {
    candidates.push({
      id: "triage-overdue",
      text: "Run a targeted triage on overdue tasks before the next sprint",
      confidence: 0.69,
      rationale: `${s.overdueTasks} overdue tasks`,
    });
  }

  if (!s.standupsComplete) {
    candidates.push({
      id: "reset-standups",
      text: "Reset the standup cadence — participation has slipped",
      confidence: 0.6,
      rationale: "Standup completion incomplete this cycle",
    });
  }

  if (candidates.length === 0) {
    candidates.push({
      id: "celebrate",
      text: "No interventions recommended — keep current cadence",
      confidence: 0.95,
      rationale: "All signals within healthy range",
    });
  }

  return candidates.slice(0, 3);
}

// ---------------------------------------------------------------------------
// Delivery drift  (top 2)
// ---------------------------------------------------------------------------

export function detectDrift(s: ProjectSignals): DriftInsight[] {
  const drift: DriftInsight[] = [];
  if (s.milestoneProgress < 0.5 && s.milestoneDelay)
    drift.push("Milestone < 50% complete past midpoint");
  if (s.velocity < 0.7)
    drift.push(
      `Velocity drift — running at ${Math.round(s.velocity * 100)}% of plan`,
    );
  if (s.averageCompletionDays > 6)
    drift.push(
      `Tasks averaging ${s.averageCompletionDays.toFixed(1)} days to close`,
    );
  if (drift.length === 0) drift.push("No drift signals above threshold");
  return drift.slice(0, 2);
}

// ---------------------------------------------------------------------------
// Blocker intelligence  (top 2)
// ---------------------------------------------------------------------------

export function topBlockers(s: ProjectSignals): BlockerInsight[] {
  const out: BlockerInsight[] = [];
  if (s.recurringBlockers.length > 0) {
    out.push(`Recurring: ${s.recurringBlockers[0]}`);
  }
  for (const title of s.blockedTaskTitles) {
    if (out.length >= 2) break;
    out.push(title);
  }
  if (out.length === 0) out.push("No active blockers");
  return out.slice(0, 2);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function tierFor(score: number): HealthTier {
  if (score >= 80) return "healthy";
  if (score >= 60) return "watch";
  return "at-risk";
}

function trendFor(s: ProjectSignals): Trend {
  const pressure =
    s.overdueTasks * 1.5 + s.blockers * 2 + s.risks - (s.standupsComplete ? 0 : 3);
  if (pressure > 18) return "down";
  if (pressure < 6) return "up";
  return "flat";
}

function joinHumanList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
