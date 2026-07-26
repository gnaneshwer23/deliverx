/**
 * B2 deterministic recommendation lifecycle (TRD-SM-REC):
 *   generated → viewed → accepted | dismissed
 *   accepted  → completed | dismissed   (complete per B2 API plan; dismiss = reversible exit)
 * Terminal: dismissed, completed. Transition to the current state is an
 * idempotent no-op, never an error. Mirrored by the DB trigger in 0098.
 */

import type { RecommendationStatus } from "@/lib/recommendations/types";

export const RECOMMENDATION_TRANSITIONS: Readonly<
  Record<RecommendationStatus, readonly RecommendationStatus[]>
> = {
  generated: ["viewed", "accepted", "dismissed"],
  viewed: ["accepted", "dismissed"],
  accepted: ["completed", "dismissed"],
  dismissed: [],
  completed: [],
} as const;

export function canTransitionRecommendation(
  from: RecommendationStatus,
  to: RecommendationStatus,
): boolean {
  return RECOMMENDATION_TRANSITIONS[from]?.includes(to) ?? false;
}

export type TransitionDecision =
  | { kind: "apply"; from: RecommendationStatus; to: RecommendationStatus }
  | { kind: "noop"; status: RecommendationStatus }
  | { kind: "invalid"; from: RecommendationStatus; to: RecommendationStatus; reason: string };

/** Pure decision — no I/O. Idempotent: same-state requests are no-ops. */
export function decideRecommendationTransition(
  from: RecommendationStatus,
  to: RecommendationStatus,
): TransitionDecision {
  if (from === to) {
    return { kind: "noop", status: from };
  }
  if (!canTransitionRecommendation(from, to)) {
    return {
      kind: "invalid",
      from,
      to,
      reason: `Cannot move a recommendation from "${from}" to "${to}".`,
    };
  }
  return { kind: "apply", from, to };
}

/** Timestamp column set when a state is entered. */
export const RECOMMENDATION_STATUS_TIMESTAMP: Readonly<
  Partial<Record<RecommendationStatus, "viewed_at" | "accepted_at" | "dismissed_at" | "completed_at">>
> = {
  viewed: "viewed_at",
  accepted: "accepted_at",
  dismissed: "dismissed_at",
  completed: "completed_at",
} as const;
