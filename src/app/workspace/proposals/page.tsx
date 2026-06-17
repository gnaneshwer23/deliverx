import Link from "next/link";
import { listPendingProposals } from "@/services/proposedActions";
import { listPendingArtifactReviews } from "@/services/artifactReviews";
import { ProposalsQueuePanel } from "@/components/proposals/proposals-queue-panel";
import { ArtifactReviewsPanel } from "@/components/approvals/artifact-reviews-panel";
import { DeliveryImpactFeed } from "@/components/delivery/delivery-impact-feed";
import { listOrgImpactEvents } from "@/services/deliveryImpact";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const [proposals, artifactReviews, impactEvents] = await Promise.all([
    listPendingProposals(50),
    listPendingArtifactReviews(50),
    listOrgImpactEvents(10).catch(() => []),
  ]);

  const totalPending = proposals.length + artifactReviews.length;

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX OS · Governance"
        title="Approval"
        titleEm="centre"
        action={
          <Link href="/workspace/governance/approvals" className={`${dxClass.btnGhost} text-[10px]`}>
            Steering approvals →
          </Link>
        }
      />
      <div className="space-y-8 p-6 md:p-8">
        <p className="max-w-3xl text-sm text-[#6B6B64]">
          Universal approval queue — AI suggestions land here first. Nothing from bootstrap,
          meetings, or assistants reaches production data without your sign-off.
          {totalPending > 0 ? (
            <>
              {" "}
              <strong className="text-[#1C4A2E]">{totalPending} pending</strong> across proposals
              and artifacts.
            </>
          ) : null}
        </p>

        <section>
          <h2 className={`${dxClass.display} mb-3 text-lg`}>AI artifact reviews</h2>
          <p className="mb-4 text-sm text-[#6B6B64]">
            Requirements, roadmap features, and delivery structure from GO-triggered bootstrap.
          </p>
          <ArtifactReviewsPanel reviews={artifactReviews} />
        </section>

        <section>
          <h2 className={`${dxClass.display} mb-3 text-lg`}>Action proposals</h2>
          <p className="mb-4 text-sm text-[#6B6B64]">
            Meeting follow-ups, calendar events, tasks, and RAID items from assistant flows.
          </p>
          <ProposalsQueuePanel proposals={proposals} />
        </section>

        <section>
          <h2 className={`${dxClass.display} mb-3 text-lg`}>Applied updates</h2>
          <p className="mb-4 text-sm text-[#6B6B64]">
            When you approve proposals, DeliverX propagates changes to persona dashboards and logs
            cross-role impact here.
          </p>
          <DeliveryImpactFeed
            events={impactEvents}
            showProject
            title="Cross-role impact feed"
            emptyMessage="No applied updates yet — approve a meeting proposal to see dashboards refresh."
          />
        </section>
      </div>
    </>
  );
}
