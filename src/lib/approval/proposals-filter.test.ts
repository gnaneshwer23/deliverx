import { describe, expect, it } from "vitest";
import {
  filterArtifactReviewsByProject,
  filterProposalsByProject,
} from "./proposals-filter";
import type { ArtifactReviewRow } from "@/lib/approval/artifact-review";
import type { ProposedActionRow } from "@/services/proposedActions";

function mockProposal(projectId: string, id = "p1"): ProposedActionRow {
  return {
    id,
    organisation_id: "org-1",
    project_id: projectId,
    source: "meeting",
    source_id: null,
    action_type: "create_task",
    title: "Proposal",
    summary: "",
    payload: {},
    status: "pending",
    reviewer_notes: null,
    apply_result: null,
    decided_by: null,
    decided_at: null,
    applied_at: null,
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

function mockReview(projectId: string, id = "r1"): ArtifactReviewRow {
  return {
    id,
    organisation_id: "org-1",
    project_id: projectId,
    entity_type: "task",
    entity_id: null,
    entity_ids: [],
    title: "Review",
    summary: "",
    payload: {},
    status: "needs_review",
    source: "ai",
    reviewer_notes: null,
    decided_by: null,
    decided_at: null,
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

describe("proposals project filter", () => {
  it("filters proposals by project id", () => {
    const proposals = [mockProposal("proj-a", "p1"), mockProposal("proj-b", "p2")];
    expect(filterProposalsByProject(proposals, "proj-a").map((p) => p.id)).toEqual(["p1"]);
  });

  it("returns all proposals when no project selected", () => {
    const proposals = [mockProposal("proj-a"), mockProposal("proj-b")];
    expect(filterProposalsByProject(proposals, undefined)).toHaveLength(2);
  });

  it("filters artifact reviews by project id", () => {
    const reviews = [mockReview("proj-a", "r1"), mockReview("proj-b", "r2")];
    expect(filterArtifactReviewsByProject(reviews, "proj-b").map((r) => r.id)).toEqual(["r2"]);
  });
});
