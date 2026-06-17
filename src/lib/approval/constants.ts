export type ArtifactReviewStatus =
  | "draft"
  | "needs_review"
  | "approved"
  | "rejected"
  | "updated";

export type ArtifactEntityType =
  | "requirement"
  | "user_story"
  | "product_feature"
  | "raid_item"
  | "task"
  | "report"
  | "structure_bundle"
  | "estimation"
  | "decision"
  | "change_request"
  | "customer_insight";

export type AuditEventType =
  | "ai_suggested"
  | "human_approved"
  | "human_rejected"
  | "applied"
  | "updated";

export const ARTIFACT_ENTITY_LABELS: Record<ArtifactEntityType, string> = {
  requirement: "Requirement",
  user_story: "User story",
  product_feature: "Product feature",
  raid_item: "RAID item",
  task: "Task",
  report: "Report",
  structure_bundle: "Delivery structure",
  estimation: "Estimation",
  decision: "Decision",
  change_request: "Change request",
  customer_insight: "Customer insight",
};

export const REVIEW_STATUS_LABELS: Record<ArtifactReviewStatus, string> = {
  draft: "Draft",
  needs_review: "Needs review",
  approved: "Approved",
  rejected: "Rejected",
  updated: "Updated",
};
