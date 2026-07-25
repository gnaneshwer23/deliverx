import type {
  AssessmentFrameworkPin,
  FrameworkVersionGraph,
  FrameworkVersionSummary,
} from "@/lib/admin-framework/types";
import {
  assertContentMutationAllowed,
  assertFrameworkStatusTransition,
  assertPublishConfirmation,
  isImmutableFrameworkStatus,
  suggestNextFrameworkVersion,
} from "@/lib/admin-framework/lifecycle";
import {
  requireAcknowledgedWarnings,
  validateFrameworkVersionGraph,
} from "@/lib/admin-framework/validation";

/**
 * In-memory helpers used by API stubs and tests.
 * Real persistence lands in a later phase against pi_cf_* tables.
 */

export type AssessmentRunRecord = {
  id: string;
  userId: string;
  /** Pinned at creation — never rewritten when frameworks evolve. */
  frameworkPin: AssessmentFrameworkPin;
  judgements: Array<{
    competencyCode: string;
    level: string;
    rubricVersion: string;
  }>;
};

export function createAssessmentPin(
  version: FrameworkVersionSummary,
  at = new Date().toISOString(),
): AssessmentFrameworkPin {
  return {
    frameworkVersionId: version.id,
    frameworkSlug: version.frameworkSlug,
    frameworkVersion: version.version,
    rubricVersionId: version.rubricVersionId,
    rubricSlug: version.frameworkSlug,
    rubricVersion: version.version,
    pinnedAt: at,
  };
}

export function createAssessmentRun(input: {
  id: string;
  userId: string;
  version: FrameworkVersionSummary;
  judgements: AssessmentRunRecord["judgements"];
}): AssessmentRunRecord {
  return {
    id: input.id,
    userId: input.userId,
    frameworkPin: createAssessmentPin(input.version),
    judgements: input.judgements,
  };
}

/**
 * Apply a content patch only when the version is mutable.
 * On immutable versions, returns a plan to clone instead of mutating.
 */
export function planContentChange(input: {
  version: FrameworkVersionSummary;
  patchSummary: string;
}):
  | { ok: true; mode: "mutate"; versionId: string }
  | {
      ok: true;
      mode: "clone_new_version";
      suggestedVersion: string;
      message: string;
    }
  | { ok: false; code: string; message: string } {
  const mutation = assertContentMutationAllowed(input.version.status);
  if (mutation.ok) {
    return { ok: true, mode: "mutate", versionId: input.version.id };
  }
  if (isImmutableFrameworkStatus(input.version.status)) {
    return {
      ok: true,
      mode: "clone_new_version",
      suggestedVersion: suggestNextFrameworkVersion(input.version.version),
      message:
        `Cannot apply "${input.patchSummary}" to ${input.version.status} version ` +
        `${input.version.frameworkSlug}@${input.version.version}. ` +
        `Create draft ${suggestNextFrameworkVersion(input.version.version)} instead.`,
    };
  }
  return {
    ok: false,
    code: mutation.code,
    message: mutation.message,
  };
}

export function planPublish(input: {
  graph: FrameworkVersionGraph;
  confirmImmutable?: boolean;
  acknowledgedWarningIds?: string[];
}):
  | { ok: true; nextStatus: "published" }
  | {
      ok: false;
      code: string;
      message: string;
      issues?: ReturnType<typeof validateFrameworkVersionGraph>["errors"];
      unacknowledgedWarnings?: ReturnType<
        typeof validateFrameworkVersionGraph
      >["warnings"];
    } {
  const from = input.graph.version.status;
  const transition = assertFrameworkStatusTransition(from, "published");
  if (!transition.ok) {
    return {
      ok: false,
      code: transition.code,
      message: transition.message,
    };
  }

  const confirm = assertPublishConfirmation({
    toStatus: "published",
    confirmImmutable: input.confirmImmutable,
  });
  if (!confirm.ok) {
    return confirm;
  }

  const validation = validateFrameworkVersionGraph(input.graph);
  if (!validation.ok) {
    return {
      ok: false,
      code: "validation_failed",
      message: "Framework version failed validation.",
      issues: validation.errors,
    };
  }

  const unacked = requireAcknowledgedWarnings(
    validation.warnings,
    input.acknowledgedWarningIds,
  );
  if (unacked.length > 0) {
    return {
      ok: false,
      code: "dependency_warnings_unacknowledged",
      message: "Acknowledge dependency warnings before publish.",
      unacknowledgedWarnings: unacked,
    };
  }

  return { ok: true, nextStatus: "published" };
}

/**
 * Historical assessment retention: pins never upgrade when a new version publishes.
 */
export function retainAssessmentPinAfterFrameworkPublish(input: {
  run: AssessmentRunRecord;
  newlyPublished: FrameworkVersionSummary;
}): AssessmentRunRecord {
  // Explicit no-op rewrite guard — callers must not replace frameworkPin.
  if (input.run.frameworkPin.frameworkVersionId === input.newlyPublished.id) {
    return input.run;
  }
  return {
    ...input.run,
    frameworkPin: { ...input.run.frameworkPin },
    judgements: input.run.judgements.map((j) => ({ ...j })),
  };
}
