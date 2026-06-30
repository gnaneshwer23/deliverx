import Link from "next/link";
import type { ArtifactReviewRow } from "@/lib/approval/artifact-review";
import type { ProposedActionRow } from "@/services/proposedActions";
import { ArtifactReviewsPanel } from "./artifact-reviews-panel";
import { ProposalsQueuePanel } from "@/components/proposals/proposals-queue-panel";

export function ApprovalCentrePanel({
  artifactReviews,
  proposals,
}: {
  artifactReviews: (ArtifactReviewRow & { project_name?: string })[];
  proposals: ProposedActionRow[];
}) {
  const total = artifactReviews.length + proposals.length;

  if (total === 0) {
    return (
      <p className="text-sm text-[#6B6B64]">
        No pending AI outputs — proposals and artifact reviews will appear here when assistants
        or bootstrap flows suggest changes.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {artifactReviews.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-[#2C2C28]">Artifact reviews</h4>
            <Link href="/workspace/proposals" className="text-xs text-[#1C4A2E] hover:underline">
              View all →
            </Link>
          </div>
          <ArtifactReviewsPanel reviews={artifactReviews} showProject />
        </div>
      ) : null}
      {proposals.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-[#2C2C28]">Action proposals</h4>
            <Link href="/workspace/proposals" className="text-xs text-[#1C4A2E] hover:underline">
              View all →
            </Link>
          </div>
          <ProposalsQueuePanel proposals={proposals} />
        </div>
      ) : null}
    </div>
  );
}
