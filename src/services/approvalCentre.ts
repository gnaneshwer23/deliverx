/**
 * Unified counts for the human-in-the-loop approval centre.
 */

import { countPendingArtifactReviews } from "./artifactReviews";
import { countPendingProposals } from "./proposedActions";

export type PendingApprovalCounts = {
  proposals: number;
  artifacts: number;
  total: number;
};

export async function getPendingApprovalCounts(): Promise<PendingApprovalCounts> {
  const [proposals, artifacts] = await Promise.all([
    countPendingProposals().catch(() => 0),
    countPendingArtifactReviews().catch(() => 0),
  ]);

  return {
    proposals,
    artifacts,
    total: proposals + artifacts,
  };
}
