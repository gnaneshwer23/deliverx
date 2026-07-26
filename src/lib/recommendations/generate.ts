/**
 * B2 recommendation generation — deterministic projection, no AI, no I/O.
 * Reuses the Capability Engine snapshot recommendations (already rationale +
 * evidence cited by the rubric judge). The snapshot/ScoreRun is the claim
 * reference; nothing here interprets evidence or assigns capability.
 */

import type { SnapshotClaims } from "@/lib/capability-engine/snapshot-claims";
import type { RecommendationDraft } from "@/lib/recommendations/types";

const MAX_RECOMMENDATIONS_PER_SNAPSHOT = 8;

/** UX-HOME rule — surfaces show at most three active recommendations. */
export const MAX_ACTIVE_RECOMMENDATIONS_SHOWN = 3;

function competencyFromRecId(recId: string): string | null {
  const match = recId.match(/^rec-(comp\.[a-z0-9_.-]+)$/i);
  return match ? match[1].toLowerCase() : null;
}

function hrefForRecommendation(recId: string, competencyId: string | null): string {
  if (recId === "rec-apply-learning") return "/learning";
  if (competencyId) return "/experience/app";
  return "/profile/evidence";
}

/**
 * Map snapshot recommendations to canonical drafts.
 * Idempotent by construction: dedupe key = source snapshot + recommendation id.
 */
export function buildRecommendationDraftsFromSnapshot(
  claims: SnapshotClaims,
): RecommendationDraft[] {
  const drafts: RecommendationDraft[] = [];

  for (const [index, rec] of claims.recommendations
    .slice(0, MAX_RECOMMENDATIONS_PER_SNAPSHOT)
    .entries()) {
    const recId = rec.id ?? `rec-${index}`;
    const competencyId = competencyFromRecId(recId);
    const rationale =
      rec.rationale?.trim() ||
      `Capability assessment ${claims.snapshotId.slice(0, 8)} surfaced this gap. Practise it and capture evidence so the next ScoreRun can interpret demonstrated behaviour.`;

    drafts.push({
      title: rec.title,
      rationale,
      competencyId,
      href: hrefForRecommendation(recId, competencyId),
      sourceType: "capability_snapshot",
      sourceId: claims.snapshotId,
      sourceSnapshotId: claims.snapshotId,
      sourceScoreRunId: claims.scoreRunId,
      dedupeKey: `capability_snapshot:${claims.snapshotId}:${recId}`,
      evidenceReferences: [...new Set(rec.evidenceReferences ?? [])].slice(0, 8),
      payload: {
        recId,
        frameworkVersionId: claims.frameworkVersionId,
        confidenceBandAlgorithmVersion: claims.confidenceBandAlgorithmVersion,
      },
    });
  }

  return drafts;
}

/** Guard shared by generation and persistence — mirrors the DB constraints. */
export function assertRecommendationDraftSafe(draft: RecommendationDraft): void {
  if (!draft.title.trim()) {
    throw new Error("Recommendation title is required");
  }
  if (!draft.rationale.trim()) {
    throw new Error("Recommendation rationale is required — no unexplained next actions");
  }
  if (!draft.href.startsWith("/")) {
    throw new Error("Recommendation href must be an internal deterministic path");
  }
  if (!draft.sourceId.trim() || !draft.dedupeKey.trim()) {
    throw new Error("Recommendation must reference its generating source");
  }
  const payload = draft.payload ?? {};
  if (
    payload.capabilityAssigned === true ||
    payload.verified === true ||
    payload.externallyVerified === true ||
    payload.verificationChanged === true
  ) {
    throw new Error("Recommendations cannot assign capability or verification");
  }
}
