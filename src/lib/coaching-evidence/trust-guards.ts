/**
 * Phase 4 — Coaching evidence trust rails.
 *
 * These guards are the fence around the new evidence-generating path. They ensure
 * coaching confirmation can NEVER:
 * - light `deliverxVerified` (Verified is T8 external attestation only),
 * - write Capability Engine levels / ScoreRuns,
 * - append evidence at a verified strength,
 * - be confirmed by AI or by the learner themselves.
 */

import {
  COACH_CONFIRMATION_SOURCE,
  COACH_EVIDENCE_STATUS,
  type CoachingReviewerRole,
} from "@/lib/coaching-evidence/types";

const VERIFIED_KEYS = [
  "deliverxVerified",
  "deliverx_verified",
  "verified_badge",
  "verifiedBadge",
  "externally_attested",
  "externallyAttested",
] as const;

const CAPABILITY_WRITE_KEYS = [
  "capability_level",
  "capabilityLevel",
  "score_run_id",
  "scoreRunId",
  "write_capability",
  "writeCapability",
  "persist_judgement",
  "persistJudgement",
] as const;

function hasTruthyKey(
  payload: Record<string, unknown> | undefined,
  keys: readonly string[],
): string | null {
  if (!payload) return null;
  for (const key of keys) {
    if (!(key in payload)) continue;
    const value = payload[key];
    if (value === undefined || value === null || value === false || value === "") continue;
    return key;
  }
  return null;
}

/**
 * Reject any coaching decision payload that attempts to light Verified or write
 * capability. Returns an error message, or null when safe.
 */
export function guardCoachingTrustRails(
  ...bags: Array<Record<string, unknown> | undefined>
): string | null {
  for (const bag of bags) {
    const verifiedKey = hasTruthyKey(bag, VERIFIED_KEYS);
    if (verifiedKey) {
      return `Coaching confirmation cannot set ${verifiedKey}. Verified requires T8 external attestation — not coach confirmation.`;
    }
    const capabilityKey = hasTruthyKey(bag, CAPABILITY_WRITE_KEYS);
    if (capabilityKey) {
      return `Coaching confirmation cannot write ${capabilityKey}. Capability levels are Capability Engine–only.`;
    }
  }
  return null;
}

/**
 * The ONLY actors permitted to confirm coaching evidence are human coaches or
 * reviewers. AI and the learner (self) can never confirm.
 */
export function guardHumanConfirmer(input: {
  reviewerRole: CoachingReviewerRole | string;
  reviewerId: string | null | undefined;
  learnerUserId: string;
}): string | null {
  if ((input.reviewerRole as string) === "ai") {
    return "AI cannot confirm coaching evidence. A human coach or reviewer must confirm.";
  }
  if (input.reviewerRole !== "coach" && input.reviewerRole !== "reviewer") {
    return "Only a coach or reviewer may confirm coaching evidence.";
  }
  if (!input.reviewerId) {
    return "A confirming coach/reviewer id is required for provenance.";
  }
  if (input.reviewerId === input.learnerUserId) {
    return "A learner cannot confirm their own coaching evidence.";
  }
  return null;
}

/**
 * Assert the evidence that will be appended on confirmation is `supported` and
 * sourced from `coach_confirmation`. Throws if a caller ever tries to append a
 * verified strength or the wrong source through this path.
 */
export function assertCoachEvidenceShape(input: {
  sourceType: string;
  initialStatus: string;
}): void {
  if (input.sourceType !== COACH_CONFIRMATION_SOURCE) {
    throw new Error(
      `Coaching evidence must use source ${COACH_CONFIRMATION_SOURCE}, not ${input.sourceType}.`,
    );
  }
  if (input.initialStatus !== COACH_EVIDENCE_STATUS) {
    throw new Error(
      `Coaching evidence must be ${COACH_EVIDENCE_STATUS} strength, not ${input.initialStatus}. Verified is T8 only.`,
    );
  }
}

/** Explicit invariant string for tests + playbook. */
export const COACHING_DOES_NOT_GRANT_VERIFIED =
  "Coach confirmation records supported evidence. It never grants the DeliverX Verified badge (T8 external attestation only) and never writes capability.";

/**
 * When a coach decision is AI-assisted, at least one citation (context source id)
 * is required. Citations are audit-only — they never create evidence themselves.
 * Mirrors the B4 posture in pi-review/trust-guards.
 */
export function guardAiAssistedCoachingCitations(input: {
  aiAssisted?: boolean;
  citations?: unknown;
}): string | null {
  if (!input.aiAssisted) return null;
  const citations = input.citations;
  if (!Array.isArray(citations) || citations.length === 0) {
    return "AI-assisted coaching decisions require at least one citation (context source id).";
  }
  const valid = citations.every((c) => {
    if (typeof c === "string") return c.trim().length > 0;
    if (c && typeof c === "object" && "sourceId" in c) {
      return String((c as { sourceId: unknown }).sourceId ?? "").trim().length > 0;
    }
    if (c && typeof c === "object" && "id" in c) {
      return String((c as { id: unknown }).id ?? "").trim().length > 0;
    }
    return false;
  });
  return valid ? null : "AI-assisted coaching citations must include a non-empty source id.";
}
