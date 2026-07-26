/**
 * B9 intervention lifecycle honesty (TRD-SM-ACTIVITY subset):
 *   offered  → accepted | dismissed | expired
 *   accepted → completed | dismissed
 * Terminal: dismissed, completed, expired.
 * Same-state requests are idempotent no-ops. Never assigns capability or Verified.
 */

import type { InterventionStatus } from "@/lib/workspace-observation/types";

export const INTERVENTION_TRANSITIONS: Readonly<
  Record<InterventionStatus, readonly InterventionStatus[]>
> = {
  offered: ["accepted", "dismissed", "expired"],
  accepted: ["completed", "dismissed"],
  dismissed: [],
  completed: [],
  expired: [],
} as const;

export function canTransitionIntervention(
  from: InterventionStatus,
  to: InterventionStatus,
): boolean {
  return INTERVENTION_TRANSITIONS[from]?.includes(to) ?? false;
}

export type InterventionTransitionDecision =
  | { kind: "apply"; from: InterventionStatus; to: InterventionStatus }
  | { kind: "noop"; status: InterventionStatus }
  | {
      kind: "invalid";
      from: InterventionStatus;
      to: InterventionStatus;
      reason: string;
    };

/** Pure decision — no I/O. Idempotent: same-state requests are no-ops. */
export function decideInterventionTransition(
  from: InterventionStatus,
  to: InterventionStatus,
): InterventionTransitionDecision {
  if (from === to) {
    return { kind: "noop", status: from };
  }
  if (!canTransitionIntervention(from, to)) {
    return {
      kind: "invalid",
      from,
      to,
      reason: `Cannot move an intervention from "${from}" to "${to}".`,
    };
  }
  return { kind: "apply", from, to };
}

export class InvalidInterventionTransitionError extends Error {
  readonly code = "invalid_transition" as const;
  readonly status = 409;
  constructor(
    readonly from: InterventionStatus,
    readonly to: InterventionStatus,
  ) {
    super(`Cannot move an intervention from "${from}" to "${to}".`);
    this.name = "InvalidInterventionTransitionError";
  }
}
