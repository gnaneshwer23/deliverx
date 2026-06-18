import Link from "next/link";
import { Suspense } from "react";
import { listPendingProposals } from "@/services/proposedActions";
import { listPendingArtifactReviews } from "@/services/artifactReviews";
import { ProposalsQueuePanel } from "@/components/proposals/proposals-queue-panel";
import { ArtifactReviewsPanel } from "@/components/approvals/artifact-reviews-panel";
import { ProposalsPersonaFilter } from "@/components/approvals/proposals-persona-filter";
import { DeliveryImpactFeed } from "@/components/delivery/delivery-impact-feed";
import { listOrgImpactEvents } from "@/services/deliveryImpact";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";
import {
  countPendingReviewsByPersona,
  filterPendingReviewsForPersona,
  PROPOSALS_PERSONA_TABS,
  type ProposalsPersonaTab,
} from "@/lib/approval/persona-reviews";
import type { MissionPersonaId } from "@/lib/mission-nav";

export const dynamic = "force-dynamic";

function parsePersona(value?: string): ProposalsPersonaTab {
  if (value && (PROPOSALS_PERSONA_TABS as readonly string[]).includes(value)) {
    return value as ProposalsPersonaTab;
  }
  return "all";
}

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string }>;
}) {
  const params = await searchParams;
  const persona = parsePersona(params.persona);

  const [proposals, artifactReviews, impactEvents] = await Promise.all([
    listPendingProposals(50),
    listPendingArtifactReviews(50),
    listOrgImpactEvents({ limit: 10 }).catch(() => []),
  ]);

  const filteredReviews =
    persona === "all"
      ? artifactReviews
      : filterPendingReviewsForPersona(artifactReviews, persona as MissionPersonaId);

  const personaCounts = {
    all: artifactReviews.length,
    ba: countPendingReviewsByPersona(artifactReviews, "ba"),
    product: countPendingReviewsByPersona(artifactReviews, "product"),
    "pm-mission": countPendingReviewsByPersona(artifactReviews, "pm-mission"),
    engineer: countPendingReviewsByPersona(artifactReviews, "engineer"),
    qa: countPendingReviewsByPersona(artifactReviews, "qa"),
    scrum: countPendingReviewsByPersona(artifactReviews, "scrum"),
    founder: countPendingReviewsByPersona(artifactReviews, "founder"),
  } as const;

  const totalPending = proposals.length + artifactReviews.length;

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX OS · Governance"
        title="AI output"
        titleEm="review"
        action={
          <div className="flex items-center gap-3">
            <Link href="/workspace/audit" className={`${dxClass.btnGhost} text-[10px]`}>
              Responses audit →
            </Link>
            <Link href="/workspace/governance/approvals" className={`${dxClass.btnGhost} text-[10px]`}>
              Steering approvals →
            </Link>
          </div>
        }
      />
      <div className="space-y-8 p-6 md:p-8">
        <p className="max-w-3xl text-sm text-[#6B6B64]">
          Responses audit — universal review queue for AI outputs. Nothing from bootstrap, meetings,
          or assistants reaches production data without your sign-off.
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
            Requirements, roadmap features, delivery structure, and persona-specific outputs from
            GO-triggered bootstrap and assistants.
          </p>
          <Suspense fallback={<p className="text-sm text-[#6B6B64]">Loading filters…</p>}>
            <ProposalsPersonaFilter counts={personaCounts} currentPersona={persona} />
          </Suspense>
          <div className="mt-4">
            <ArtifactReviewsPanel
              reviews={filteredReviews}
              emptyMessage={
                persona === "all"
                  ? "No AI artifacts pending review."
                  : `No pending reviews for ${persona} persona artifacts.`
              }
            />
          </div>
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
