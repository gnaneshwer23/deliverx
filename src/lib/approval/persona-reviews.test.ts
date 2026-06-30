import { describe, expect, it } from "vitest";
import {
  countPendingReviewsByPersonaMap,
  filterReviewsByProject,
} from "./persona-reviews";
import type { ArtifactReviewRow } from "@/lib/approval/artifact-review";

function mockReview(
  entityType: ArtifactReviewRow["entity_type"],
  projectId = "proj-1",
  id = "1",
): ArtifactReviewRow {
  return {
    id,
    organisation_id: "org-1",
    project_id: projectId,
    entity_type: entityType,
    entity_id: null,
    entity_ids: [],
    title: `Review ${id}`,
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

describe("countPendingReviewsByPersonaMap", () => {
  it("returns counts for every mission persona", () => {
    const reviews = [
      mockReview("requirement", "p1", "r1"),
      mockReview("task", "p1", "r2"),
      mockReview("product_feature", "p2", "r3"),
    ];
    const counts = countPendingReviewsByPersonaMap(reviews);
    expect(counts.ba).toBe(1);
    expect(counts.engineer).toBe(1);
    expect(counts.product).toBe(1);
    expect(counts.qa).toBe(2);
    expect(counts.founder).toBe(0);
  });
});

describe("filterReviewsByProject", () => {
  it("returns all reviews when projectId is null", () => {
    const reviews = [mockReview("task", "p1"), mockReview("task", "p2")];
    expect(filterReviewsByProject(reviews, null)).toHaveLength(2);
  });

  it("filters reviews to a single project", () => {
    const reviews = [
      mockReview("task", "p1", "r1"),
      mockReview("task", "p2", "r2"),
      mockReview("requirement", "p1", "r3"),
    ];
    expect(filterReviewsByProject(reviews, "p1").map((r) => r.id)).toEqual(["r1", "r3"]);
  });
});
