import type {
  ReviewQueueItem,
  StructuredJudgement,
} from "@/lib/capability-engine/types";

/** Review Queue — material updates requiring user/admin review. */
export function buildReviewQueue(input: {
  judgements: StructuredJudgement[];
  excludedOutdated: string[];
  verifierNotes: string[];
}): ReviewQueueItem[] {
  const queue: ReviewQueueItem[] = [];

  for (const j of input.judgements) {
    if (j.reviewStatus === "pending_review") {
      queue.push({
        reason: "judgement_pending_review",
        judgement: j,
        payload: {
          competencyId: j.competencyId,
          levelProposed: j.levelProposed,
          confidence: j.confidence,
        },
      });
    }
    if (j.confidence >= 0.85 && j.levelProposed === "advanced") {
      queue.push({
        reason: "high_impact_level_change",
        judgement: j,
        payload: { competencyId: j.competencyId, levelProposed: j.levelProposed },
      });
    }
  }

  if (input.excludedOutdated.length) {
    queue.push({
      reason: "outdated_evidence_excluded",
      payload: { evidenceIds: input.excludedOutdated },
    });
  }

  for (const note of input.verifierNotes) {
    queue.push({
      reason: "verifier_note",
      payload: { note },
    });
  }

  return queue;
}
