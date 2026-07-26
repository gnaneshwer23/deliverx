/**
 * B9 Experience activity state-machine honesty (TRD-SM-ACTIVITY):
 * Tasks, meetings, and risks only move through declared transitions.
 * Same-state is an idempotent no-op. Invalid → clear error (never silent fake success).
 * Activity transitions never assign capability or light Verified.
 */

import type { ExperienceLifecycle } from "@/lib/experience-sim/types";

export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type MeetingStatus = "scheduled" | "completed" | "cancelled";
export type RiskStatus = "open" | "mitigated" | "accepted";

export const TASK_TRANSITIONS: Readonly<Record<TaskStatus, readonly TaskStatus[]>> = {
  todo: ["in_progress", "blocked", "done"],
  in_progress: ["todo", "blocked", "done"],
  blocked: ["todo", "in_progress", "done"],
  done: [],
} as const;

export const MEETING_TRANSITIONS: Readonly<
  Record<MeetingStatus, readonly MeetingStatus[]>
> = {
  scheduled: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
} as const;

export const RISK_TRANSITIONS: Readonly<Record<RiskStatus, readonly RiskStatus[]>> = {
  open: ["mitigated", "accepted"],
  mitigated: [],
  accepted: [],
} as const;

/** Lifecycle: fail/pause from active work; recover restores prior phase. Terminal completed stays. */
export const LIFECYCLE_TRANSITIONS: Readonly<
  Record<ExperienceLifecycle, readonly ExperienceLifecycle[]>
> = {
  draft: ["active"],
  active: ["reflecting", "paused", "failed", "completed"],
  reflecting: ["assessing", "paused", "failed", "active"],
  assessing: ["completed", "paused", "failed", "reflecting"],
  paused: ["active", "reflecting", "assessing", "failed"],
  failed: ["active", "reflecting", "assessing", "paused"],
  completed: [],
} as const;

export type ActivityTransitionDecision<T extends string> =
  | { kind: "apply"; from: T; to: T }
  | { kind: "noop"; status: T }
  | { kind: "invalid"; from: T; to: T; reason: string };

function decideTransition<T extends string>(
  map: Readonly<Record<T, readonly T[]>>,
  from: T,
  to: T,
  entity: string,
): ActivityTransitionDecision<T> {
  if (from === to) return { kind: "noop", status: from };
  if (!(map[from]?.includes(to) ?? false)) {
    return {
      kind: "invalid",
      from,
      to,
      reason: `Cannot move ${entity} from "${from}" to "${to}".`,
    };
  }
  return { kind: "apply", from, to };
}

export function decideTaskTransition(
  from: TaskStatus,
  to: TaskStatus,
): ActivityTransitionDecision<TaskStatus> {
  return decideTransition(TASK_TRANSITIONS, from, to, "a task");
}

export function decideMeetingTransition(
  from: MeetingStatus,
  to: MeetingStatus,
): ActivityTransitionDecision<MeetingStatus> {
  return decideTransition(MEETING_TRANSITIONS, from, to, "a meeting");
}

export function decideRiskTransition(
  from: RiskStatus,
  to: RiskStatus,
): ActivityTransitionDecision<RiskStatus> {
  return decideTransition(RISK_TRANSITIONS, from, to, "a risk");
}

export function decideLifecycleTransition(
  from: ExperienceLifecycle,
  to: ExperienceLifecycle,
): ActivityTransitionDecision<ExperienceLifecycle> {
  return decideTransition(LIFECYCLE_TRANSITIONS, from, to, "experience lifecycle");
}

export function canTransitionTask(from: TaskStatus, to: TaskStatus): boolean {
  return TASK_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionMeeting(from: MeetingStatus, to: MeetingStatus): boolean {
  return MEETING_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionRisk(from: RiskStatus, to: RiskStatus): boolean {
  return RISK_TRANSITIONS[from]?.includes(to) ?? false;
}

export class InvalidActivityTransitionError extends Error {
  readonly code = "invalid_transition" as const;
  readonly status = 409;
  constructor(
    readonly entity: string,
    readonly from: string,
    readonly to: string,
  ) {
    super(`Cannot move ${entity} from "${from}" to "${to}".`);
    this.name = "InvalidActivityTransitionError";
  }
}

export function assertActivityTransition<T extends string>(
  decision: ActivityTransitionDecision<T>,
  entity: string,
): void {
  if (decision.kind === "invalid") {
    throw new InvalidActivityTransitionError(entity, decision.from, decision.to);
  }
}
