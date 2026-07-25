import {
  FRAMEWORK_PUBLICATION_STATUSES,
  IMMUTABLE_FRAMEWORK_STATUSES,
  MUTABLE_FRAMEWORK_STATUSES,
  type FrameworkPublicationStatus,
  type ImmutableFrameworkStatus,
  type MutableFrameworkStatus,
} from "@/lib/admin-framework/types";

/**
 * Allowed status transitions for competency framework versions.
 *
 * Draft → Internal Review → Calibration → Published → Deprecated → Archived
 *
 * Published versions are immutable; content edits require cloning a new draft version.
 * Rollback is modelled as deprecate + publish a prior cloned draft — never mutate published rows.
 */
export const FRAMEWORK_STATUS_TRANSITIONS: Record<
  FrameworkPublicationStatus,
  readonly FrameworkPublicationStatus[]
> = {
  draft: ["internal_review", "archived"],
  internal_review: ["draft", "calibration", "archived"],
  calibration: ["internal_review", "published", "archived"],
  published: ["deprecated"],
  deprecated: ["archived"],
  archived: [],
};

export function isFrameworkPublicationStatus(
  value: unknown,
): value is FrameworkPublicationStatus {
  return (
    typeof value === "string" &&
    (FRAMEWORK_PUBLICATION_STATUSES as readonly string[]).includes(value)
  );
}

export function isMutableFrameworkStatus(
  status: FrameworkPublicationStatus,
): status is MutableFrameworkStatus {
  return (MUTABLE_FRAMEWORK_STATUSES as readonly string[]).includes(status);
}

export function isImmutableFrameworkStatus(
  status: FrameworkPublicationStatus,
): status is ImmutableFrameworkStatus {
  return (IMMUTABLE_FRAMEWORK_STATUSES as readonly string[]).includes(status);
}

export type TransitionResult =
  | { ok: true; from: FrameworkPublicationStatus; to: FrameworkPublicationStatus }
  | {
      ok: false;
      code: "invalid_transition" | "immutable_content_edit";
      message: string;
      from: FrameworkPublicationStatus;
      to: FrameworkPublicationStatus;
    };

export function canTransitionFrameworkStatus(
  from: FrameworkPublicationStatus,
  to: FrameworkPublicationStatus,
): boolean {
  if (from === to) return true;
  return FRAMEWORK_STATUS_TRANSITIONS[from].includes(to);
}

export function assertFrameworkStatusTransition(
  from: FrameworkPublicationStatus,
  to: FrameworkPublicationStatus,
): TransitionResult {
  if (from === to) {
    return { ok: true, from, to };
  }
  if (!canTransitionFrameworkStatus(from, to)) {
    return {
      ok: false,
      code: "invalid_transition",
      message: `Cannot transition framework version from ${from} to ${to}`,
      from,
      to,
    };
  }
  return { ok: true, from, to };
}

/**
 * Content mutations (roles, competencies, anchors, assessment items, …)
 * are only allowed while the version is in a mutable lifecycle state.
 */
export function assertContentMutationAllowed(
  status: FrameworkPublicationStatus,
): TransitionResult {
  if (isMutableFrameworkStatus(status)) {
    return { ok: true, from: status, to: status };
  }
  return {
    ok: false,
    code: "immutable_content_edit",
    message:
      `Framework version status "${status}" is immutable. ` +
      `Clone a new draft version instead of editing published content.`,
    from: status,
    to: status,
  };
}

/**
 * Publishing requires an explicit confirmation that the version becomes immutable.
 */
export function assertPublishConfirmation(input: {
  toStatus: FrameworkPublicationStatus;
  confirmImmutable?: boolean;
}): { ok: true } | { ok: false; code: "publish_confirmation_required"; message: string } {
  if (input.toStatus !== "published") {
    return { ok: true };
  }
  if (input.confirmImmutable === true) {
    return { ok: true };
  }
  return {
    ok: false,
    code: "publish_confirmation_required",
    message:
      "Publishing freezes this framework version permanently. Pass confirmImmutable: true.",
  };
}

/** Suggest next draft version label after a published version (semver-ish year.minor). */
export function suggestNextFrameworkVersion(current: string): string {
  const match = /^(\d{4})\.(\d+)$/.exec(current.trim());
  if (!match) {
    return `${current}-draft`;
  }
  const year = match[1];
  const minor = Number(match[2]);
  return `${year}.${minor + 1}`;
}
