/**
 * Learning evidence level state machine.
 * consumed → understood → reflected_upon → applied → repeatedly_applied → outcome_supported
 *
 * Hard gates:
 * - Cannot skip forward more than one step without qualifying signals
 * - reflected_upon requires non-empty reflection
 * - applied requires at least one application evidence id (practice)
 * - repeatedly_applied requires ≥2 application evidence ids
 * - outcome_supported requires linked knowledge evidence_id + measured ScoreRun delta
 * - Never writes capability; never lights Verified
 */

import {
  LEARNING_EVIDENCE_LEVELS,
  levelRank,
  type LearningEvidenceLevel,
} from "@/lib/learning-intelligence/types";

export type LevelProgressionContext = {
  current: LearningEvidenceLevel;
  reflection?: string | null;
  concepts?: string[];
  applicationEvidenceIds?: string[];
  /** Knowledge ledger evidence for this learning item. */
  evidenceId?: string | null;
  /**
   * Measured capability level change from a subsequent ScoreRun,
   * associated (not proven causation) with this learning item.
   */
  measuredLevelChange?: boolean;
  /** Explicit request to advance one step (user action). */
  advance?: boolean;
};

export type LevelProgressionResult =
  | {
      ok: true;
      from: LearningEvidenceLevel;
      to: LearningEvidenceLevel;
      capabilityAssigned: false;
      learningNotCapability: true;
    }
  | {
      ok: false;
      from: LearningEvidenceLevel;
      to: LearningEvidenceLevel;
      reason: string;
      capabilityAssigned: false;
      learningNotCapability: true;
    };

function hasReflection(text: string | null | undefined): boolean {
  return Boolean(text && text.trim().length >= 20);
}

function hasConcepts(concepts: string[] | undefined): boolean {
  return Boolean(concepts && concepts.some((c) => c.trim().length > 0));
}

/**
 * Derive the highest level justified by signals (never capability).
 * Pure — no I/O.
 */
export function deriveJustifiedLevel(ctx: {
  reflection?: string | null;
  concepts?: string[];
  applicationEvidenceIds?: string[];
  evidenceId?: string | null;
  measuredLevelChange?: boolean;
}): LearningEvidenceLevel {
  const apps = ctx.applicationEvidenceIds ?? [];
  if (ctx.measuredLevelChange && ctx.evidenceId && apps.length >= 1) {
    return "outcome_supported";
  }
  if (apps.length >= 2) return "repeatedly_applied";
  if (apps.length >= 1) return "applied";
  if (hasReflection(ctx.reflection)) return "reflected_upon";
  if (hasConcepts(ctx.concepts)) return "understood";
  return "consumed";
}

/**
 * Attempt to advance (or recompute) evidence level.
 * Refuses outcome_supported without evidence + measured delta.
 * Never assigns capability.
 */
export function advanceLearningLevel(
  ctx: LevelProgressionContext,
): LevelProgressionResult {
  const from = ctx.current;
  const justified = deriveJustifiedLevel(ctx);

  let to: LearningEvidenceLevel = from;

  if (ctx.advance) {
    const nextIdx = Math.min(levelRank(from) + 1, LEARNING_EVIDENCE_LEVELS.length - 1);
    const candidate = LEARNING_EVIDENCE_LEVELS[nextIdx];
    // Only allow advance if justified reaches at least the candidate
    if (levelRank(justified) >= levelRank(candidate)) {
      to = candidate;
    } else {
      return {
        ok: false,
        from,
        to: candidate,
        reason: rejectReason(candidate, ctx),
        capabilityAssigned: false,
        learningNotCapability: true,
      };
    }
  } else {
    // Recompute upward (never regress automatically)
    if (levelRank(justified) > levelRank(from)) {
      to = justified;
    }
  }

  if (to === "outcome_supported") {
    if (!ctx.evidenceId || !ctx.measuredLevelChange) {
      return {
        ok: false,
        from,
        to: "outcome_supported",
        reason:
          "outcome_supported requires linked ledger evidence and a measured ScoreRun level change. Learning completion alone is not enough.",
        capabilityAssigned: false,
        learningNotCapability: true,
      };
    }
  }

  return {
    ok: true,
    from,
    to,
    capabilityAssigned: false,
    learningNotCapability: true,
  };
}

function rejectReason(target: LearningEvidenceLevel, ctx: LevelProgressionContext): string {
  switch (target) {
    case "understood":
      return "Add at least one concept before marking understood.";
    case "reflected_upon":
      return "Write a reflection (≥20 characters) before marking reflected_upon.";
    case "applied":
      return "Link at least one Experience / workspace practice evidence id before applied.";
    case "repeatedly_applied":
      return "Link at least two practice evidence ids before repeatedly_applied.";
    case "outcome_supported":
      return "outcome_supported requires linked ledger evidence and a measured ScoreRun level change.";
    default:
      return `Cannot advance to ${target} with current signals (current=${ctx.current}).`;
  }
}

/** Levels at which Profile "What next?" should recommend Experience application. */
export function isApplicationReady(level: LearningEvidenceLevel): boolean {
  return levelRank(level) >= levelRank("reflected_upon");
}

/** Levels that still look like a knowledge gap (suggest learning). */
export function isKnowledgeStage(level: LearningEvidenceLevel): boolean {
  return levelRank(level) < levelRank("reflected_upon");
}
