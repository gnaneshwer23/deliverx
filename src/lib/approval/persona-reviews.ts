import type { ArtifactEntityType } from "@/lib/approval/constants";
import type { ArtifactReviewRow } from "@/services/artifactReviews";
import type { MissionPersonaId } from "@/lib/mission-nav";

export const PERSONA_ARTIFACT_ENTITY_TYPES: Record<MissionPersonaId, ArtifactEntityType[]> = {
  founder: [
    "report",
    "decision",
    "customer_insight",
    "structure_bundle",
    "change_request",
  ],
  ba: ["requirement", "customer_insight", "decision"],
  product: ["product_feature", "customer_insight", "decision"],
  "pm-mission": [
    "structure_bundle",
    "task",
    "raid_item",
    "change_request",
    "decision",
    "estimation",
    "report",
  ],
  engineer: ["task", "estimation", "structure_bundle"],
  scrum: ["user_story", "task", "raid_item"],
  qa: ["requirement", "user_story", "task", "raid_item"],
};

export const PERSONA_REVIEW_LABELS: Record<MissionPersonaId, string> = {
  founder: "Founder",
  ba: "BA",
  product: "Product",
  "pm-mission": "PM",
  engineer: "Engineering",
  scrum: "Scrum",
  qa: "QA",
};

export function filterPendingReviewsForPersona<T extends Pick<ArtifactReviewRow, "entity_type">>(
  reviews: T[],
  persona: MissionPersonaId,
): T[] {
  const allowed = new Set(PERSONA_ARTIFACT_ENTITY_TYPES[persona]);
  return reviews.filter((review) => allowed.has(review.entity_type));
}
