import Link from "next/link";
import { Suspense } from "react";
import { listPendingProposals } from "@/services/proposedActions";
import { listPendingArtifactReviews } from "@/services/artifactReviews";
import { listOrgProjects } from "@/services/delivery";
import { ProposalsQueuePanel } from "@/components/proposals/proposals-queue-panel";
import { ArtifactReviewsPanel } from "@/components/approvals/artifact-reviews-panel";
import { ProposalsPersonaFilter } from "@/components/approvals/proposals-persona-filter";
import { ProposalsProjectFilter } from "@/components/approvals/proposals-project-filter";
import { DeliveryImpactFeed } from "@/components/delivery/delivery-impact-feed";
import { listOrgImpactEvents } from "@/services/deliveryImpact";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";
import { governanceTabHref } from "@/lib/governance-tabs";
import {
  countPendingReviewsByPersona,
  filterPendingReviewsForPersona,
  PROPOSALS_PERSONA_TABS,
  type ProposalsPersonaTab,
} from "@/lib/approval/persona-reviews";
import {
  filterArtifactReviewsByProject,
  filterProposalsByProject,
} from "@/lib/approval/proposals-filter";
import type { MissionPersonaId } from "@/lib/mission-nav";
import { resolveWorkspaceOrgProjectId } from "@/lib/professional-workspace/project-context";

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
  searchParams: Promise<{ persona?: string; project?: string; review?: string }>;
}) {
  const params = await searchParams;
  const persona = parsePersona(params.persona);
  const projectId = resolveWorkspaceOrgProjectId(params.project);
  const highlightReviewId = params.review ?? null;

  const [proposals, artifactReviews, impactEvents, projects] = await Promise.all([
    listPendingProposals(50),
    listPendingArtifactReviews(50),
    listOrgImpactEvents({ limit: 10 }).catch(() => []),
    listOrgProjects().catch(() => []),
  ]);

  const projectScopedProposals = filterProposalsByProject(proposals, projectId);
  const projectScopedReviews = filterArtifactReviewsByProject(artifactReviews, projectId);

  const filteredReviews =
    persona === "all"
      ? projectScopedReviews
      : filterPendingReviewsForPersona(projectScopedReviews, persona as MissionPersonaId);

  const personaCounts = {
    all: projectScopedReviews.length,
    ba: countPendingReviewsByPersona(projectScopedReviews, "ba"),
    product: countPendingReviewsByPersona(projectScopedReviews, "product"),
    "pm-mission": countPendingReviewsByPersona(projectScopedReviews, "pm-mission"),
    engineer: countPendingReviewsByPersona(projectScopedReviews, "engineer"),
    qa: countPendingReviewsByPersona(projectScopedReviews, "qa"),
    scrum: countPendingReviewsByPersona(projectScopedReviews, "scrum"),
    founder: countPendingReviewsByPersona(projectScopedReviews, "founder"),
  } as const;

  const totalPending = projectScopedProposals.length + projectScopedReviews.length;

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX · Governance"
        title="AI output"
        titleEm="review"
        action={
          <div className="flex items-center gap-3">
            <Link href="/workspace/audit" className={`${dxClass.btnGhost} text-[10px]`}>
              Responses audit →
            </Link>
            <Link href={governanceTabHref("approvals")} className={`${dxClass.btnGhost} text-[10px]`}>
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

        <Suspense fallback={<p className="text-sm text-[#6B6B64]">Loading filters…</p>}>
          <ProposalsProjectFilter projects={projects} currentProjectId={projectId} />
        </Suspense>

        <section>
          <h2 className={`${dxClass.display} mb-3 text-lg`}>AI artifact reviews</h2>
          <p className="mb-4 text-sm text-[#6B6B64]">
            Requirements, roadmap features, delivery structure, and persona-specific outputs from
            GO-triggered bootstrap and assistants.
            {projectId ? " Filtered to the selected project." : null}
          </p>
          <Suspense fallback={<p className="text-sm text-[#6B6B64]">Loading filters…</p>}>
            <ProposalsPersonaFilter counts={personaCounts} currentPersona={persona} />
          </Suspense>
          <div className="mt-4">
            <ArtifactReviewsPanel
              reviews={filteredReviews}
              highlightReviewId={highlightReviewId}
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
          <ProposalsQueuePanel proposals={projectScopedProposals} />
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
