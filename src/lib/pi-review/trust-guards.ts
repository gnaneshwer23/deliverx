/**
 * B4 trust rails for human reviewer ops (non-Verified).
 *
 * Reviewers may uphold / revise / escalate dispute cases. They must NEVER:
 * - light deliverxVerified
 * - write Capability Engine levels
 * - treat ScoreRun / review outcome as external attestation
 *
 * Verified remains T8 attestation only (CX-04 / PD-2026-07-25c).
 */

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
 * Reject payloads that attempt to light Verified or write capability via review.
 * Returns an error message, or null when safe.
 */
export function guardReviewTrustRails(input: {
  proposedRevision?: Record<string, unknown>;
  factualCorrection?: Record<string, unknown>;
  audit?: Record<string, unknown>;
  visibilityChange?: Record<string, unknown>;
}): string | null {
  const bags = [
    input.proposedRevision,
    input.factualCorrection,
    input.audit,
    input.visibilityChange,
  ];

  for (const bag of bags) {
    const verifiedKey = hasTruthyKey(bag, VERIFIED_KEYS);
    if (verifiedKey) {
      return `Review actions cannot set ${verifiedKey}. Verified requires T8 external attestation — not human review.`;
    }
    const capabilityKey = hasTruthyKey(bag, CAPABILITY_WRITE_KEYS);
    if (capabilityKey) {
      return `Review actions cannot write ${capabilityKey}. Capability levels are Capability Engine–only; revise queues reassessment only.`;
    }
  }

  return null;
}

/** Explicit invariant for tests and playbook: review never lights Verified. */
export const REVIEW_DOES_NOT_GRANT_VERIFIED =
  "Human review does not grant the DeliverX Verified badge. Verified requires named third-party attestation (T8).";

/**
 * When an admin decision is AI-assisted, require at least one citation reference.
 * Citations are recorded in audit only — they do not create evidence.
 */
export function guardAiAssistedCitations(input: {
  aiAssisted?: boolean;
  citations?: unknown;
}): string | null {
  if (!input.aiAssisted) return null;
  const citations = input.citations;
  if (!Array.isArray(citations) || citations.length === 0) {
    return "AI-assisted review decisions require at least one citation (context source id).";
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
  if (!valid) {
    return "AI-assisted review citations must include a non-empty source id.";
  }
  return null;
}
