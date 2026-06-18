import { describe, expect, it } from "vitest";
import {
  countPendingReviewsByPersona,
  filterPendingReviewsForPersona,
  PERSONA_ARTIFACT_ENTITY_TYPES,
} from "./persona-reviews";
import type { ArtifactReviewRow } from "@/services/artifactReviews";

function mockReview(
  entityType: ArtifactReviewRow["entity_type"],
  id = "1",
): ArtifactReviewRow {
  return {
    id,
    organisation_id: "org-1",
    project_id: "proj-1",
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

describe("filterPendingReviewsForPersona", () => {
  it("returns only BA-relevant entity types", () => {
    const reviews = [
      mockReview("requirement", "r1"),
      mockReview("task", "r2"),
      mockReview("customer_insight", "r3"),
    ];
    expect(filterPendingReviewsForPersona(reviews, "ba").map((r) => r.id)).toEqual(["r1", "r3"]);
  });

  it("returns only engineer-relevant entity types", () => {
    const reviews = [
      mockReview("task", "r1"),
      mockReview("estimation", "r2"),
      mockReview("requirement", "r3"),
    ];
    expect(filterPendingReviewsForPersona(reviews, "engineer").map((r) => r.id)).toEqual([
      "r1",
      "r2",
    ]);
  });

  it("defines entity types for every mission persona", () => {
    for (const persona of [
      "ba",
      "product",
      "pm-mission",
      "founder",
      "engineer",
      "scrum",
      "qa",
    ] as const) {
      expect(PERSONA_ARTIFACT_ENTITY_TYPES[persona].length).toBeGreaterThan(0);
    }
  });

  it("counts pending reviews per persona", () => {
    const reviews = [
      mockReview("requirement", "r1"),
      mockReview("task", "r2"),
      mockReview("estimation", "r3"),
    ];
    expect(countPendingReviewsByPersona(reviews, "engineer")).toBe(2);
    expect(countPendingReviewsByPersona(reviews, "ba")).toBe(1);
  });
});
