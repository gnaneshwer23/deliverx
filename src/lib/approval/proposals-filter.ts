import type { ArtifactReviewRow } from "@/lib/approval/artifact-review";
import type { ProposedActionRow } from "@/services/proposedActions";

export function filterProposalsByProject<T extends Pick<ProposedActionRow, "project_id">>(
  proposals: T[],
  projectId: string | null | undefined,
): T[] {
  if (!projectId) return proposals;
  return proposals.filter((proposal) => proposal.project_id === projectId);
}

export function filterArtifactReviewsByProject<T extends Pick<ArtifactReviewRow, "project_id">>(
  reviews: T[],
  projectId: string | null | undefined,
): T[] {
  if (!projectId) return reviews;
  return reviews.filter((review) => review.project_id === projectId);
}
