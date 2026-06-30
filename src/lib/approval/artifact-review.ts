import type {
  ArtifactEntityType,
  ArtifactReviewStatus,
} from "@/lib/approval/constants";

/** Client-safe artifact review row shape (no server imports). */
export type ArtifactReviewRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  entity_type: ArtifactEntityType;
  entity_id: string | null;
  entity_ids: string[];
  title: string;
  summary: string;
  payload: Record<string, unknown>;
  status: ArtifactReviewStatus;
  source: string;
  reviewer_notes: string | null;
  decided_by: string | null;
  decided_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
