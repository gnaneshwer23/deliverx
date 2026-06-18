/**
 * Universal artifact approval — AI outputs require human sign-off.
 */

import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";
import type {
  ArtifactEntityType,
  ArtifactReviewStatus,
} from "@/lib/approval/constants";
import type { MissionPersonaId } from "@/lib/mission-nav";
import { filterPendingReviewsForPersona } from "@/lib/approval/persona-reviews";
import { logAuditEvent } from "./auditEvents";
import { applyProjectStructure } from "./applyProjectStructure";
import type { ProjectStructureDraft } from "./aiProjectStructuring";

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

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.organisation_id) throw new Error("No organisation");

  return {
    supabase,
    userId: user.id,
    orgId: profile.organisation_id as string,
    role: profile.role as string | null,
  };
}

function mapRow(row: Record<string, unknown>): ArtifactReviewRow {
  return {
    id: String(row.id),
    organisation_id: String(row.organisation_id),
    project_id: String(row.project_id),
    entity_type: row.entity_type as ArtifactEntityType,
    entity_id: row.entity_id ? String(row.entity_id) : null,
    entity_ids: Array.isArray(row.entity_ids) ? (row.entity_ids as string[]) : [],
    title: String(row.title),
    summary: String(row.summary ?? ""),
    payload: (row.payload as Record<string, unknown>) ?? {},
    status: row.status as ArtifactReviewStatus,
    source: String(row.source ?? "ai"),
    reviewer_notes: row.reviewer_notes ? String(row.reviewer_notes) : null,
    decided_by: row.decided_by ? String(row.decided_by) : null,
    decided_at: row.decided_at ? String(row.decided_at) : null,
    created_by: row.created_by ? String(row.created_by) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function queueArtifactReview(input: {
  projectId: string;
  entityType: ArtifactEntityType;
  title: string;
  summary: string;
  payload?: Record<string, unknown>;
  entityId?: string;
  entityIds?: string[];
  source?: string;
}): Promise<ArtifactReviewRow> {
  const { supabase, orgId, userId } = await getOrgContext();

  const { data, error } = await supabase
    .from("artifact_reviews")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      entity_ids: input.entityIds ?? [],
      title: input.title,
      summary: input.summary,
      payload: input.payload ?? {},
      status: "needs_review",
      source: input.source ?? "ai",
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) {
    throwIfMissingTable(error, "artifact_reviews");
    throw error;
  }

  const row = mapRow(data as Record<string, unknown>);

  await logAuditEvent({
    projectId: input.projectId,
    eventType: "ai_suggested",
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    artifactReviewId: row.id,
    metadata: {
      title: input.title,
      entityIds: input.entityIds ?? [],
    },
  });

  return row;
}

export async function listPendingArtifactReviews(limit = 50): Promise<
  (ArtifactReviewRow & { project_name: string })[]
> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("artifact_reviews")
    .select("*, projects!inner(name)")
    .eq("status", "needs_review")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throwIfMissingTable(error, "artifact_reviews");
    throw error;
  }

  return (data ?? []).map((row) => {
    const r = row as ArtifactReviewRow & { projects: { name: string } };
    return { ...mapRow(r as unknown as Record<string, unknown>), project_name: r.projects.name };
  });
}

export async function listPendingArtifactReviewsForPersona(
  persona: MissionPersonaId,
  limit = 5,
): Promise<(ArtifactReviewRow & { project_name: string })[]> {
  const all = await listPendingArtifactReviews(50);
  return filterPendingReviewsForPersona(all, persona).slice(0, limit);
}

export async function countPendingArtifactReviews(): Promise<number> {
  const { supabase } = await getOrgContext();
  const { count, error } = await supabase
    .from("artifact_reviews")
    .select("id", { count: "exact", head: true })
    .eq("status", "needs_review");

  if (error) {
    if (error.code === "42P01") return 0;
    throw error;
  }
  return count ?? 0;
}

export async function listProjectArtifactReviews(
  projectId: string,
  limit = 20,
): Promise<ArtifactReviewRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("artifact_reviews")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throwIfMissingTable(error, "artifact_reviews");
    throw error;
  }

  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

async function markEntitiesApproved(review: ArtifactReviewRow): Promise<void> {
  const { supabase } = await getOrgContext();
  const ids = review.entity_ids.length ? review.entity_ids : review.entity_id ? [review.entity_id] : [];

  if (ids.length === 0 && review.entity_type !== "structure_bundle") return;

  const tableMap: Partial<Record<ArtifactEntityType, string>> = {
    requirement: "requirements",
    user_story: "user_stories",
    product_feature: "product_features",
    task: "tasks",
    raid_item: "raid_items",
  };

  const table = tableMap[review.entity_type];
  if (!table || ids.length === 0) return;

  await supabase
    .from(table)
    .update({ review_status: "approved" })
    .in("id", ids);

  if (review.entity_type === "requirement") {
    await supabase
      .from("requirements")
      .update({ status: "approved" })
      .in("id", ids)
      .eq("status", "draft");
  }
}

async function markEntitiesRejected(review: ArtifactReviewRow): Promise<void> {
  const { supabase } = await getOrgContext();
  const ids = review.entity_ids.length ? review.entity_ids : review.entity_id ? [review.entity_id] : [];

  const tableMap: Partial<Record<ArtifactEntityType, string>> = {
    requirement: "requirements",
    user_story: "user_stories",
    product_feature: "product_features",
    task: "tasks",
    raid_item: "raid_items",
  };

  const table = tableMap[review.entity_type];
  if (!table || ids.length === 0) return;

  await supabase
    .from(table)
    .update({ review_status: "rejected" })
    .in("id", ids);

  if (review.entity_type === "requirement") {
    await supabase
      .from("requirements")
      .update({ status: "rejected" })
      .in("id", ids);
  }
}

async function applyStructureBundle(review: ArtifactReviewRow): Promise<Record<string, unknown>> {
  const draft = review.payload.draft as ProjectStructureDraft | undefined;
  if (!draft) throw new Error("Structure bundle payload missing draft.");

  const applied = await applyProjectStructure(review.project_id, draft);
  return applied as unknown as Record<string, unknown>;
}

export async function resolveArtifactReview(
  id: string,
  status: "approved" | "rejected",
  reviewerNotes?: string,
): Promise<ArtifactReviewRow> {
  const { supabase, userId } = await getOrgContext();

  const { data: existing, error: fetchErr } = await supabase
    .from("artifact_reviews")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !existing) throw new Error("Artifact review not found");

  const review = mapRow(existing as Record<string, unknown>);
  if (review.status !== "needs_review") {
    throw new Error("Artifact is not pending review.");
  }

  let applyResult: Record<string, unknown> | null = null;

  if (status === "approved") {
    if (review.entity_type === "structure_bundle") {
      applyResult = await applyStructureBundle(review);
    } else {
      await markEntitiesApproved(review);
    }
  } else {
    await markEntitiesRejected(review);
  }

  const { data, error } = await supabase
    .from("artifact_reviews")
    .update({
      status: status === "approved" ? "approved" : "rejected",
      reviewer_notes: reviewerNotes?.trim() || null,
      decided_by: userId,
      decided_at: new Date().toISOString(),
      payload: applyResult ? { ...review.payload, applyResult } : review.payload,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  const updated = mapRow(data as Record<string, unknown>);

  await logAuditEvent({
    projectId: review.project_id,
    eventType: status === "approved" ? "human_approved" : "human_rejected",
    entityType: review.entity_type,
    entityId: review.entity_id,
    artifactReviewId: review.id,
    metadata: { reviewerNotes, applyResult },
  });

  if (status === "approved" && applyResult) {
    await logAuditEvent({
      projectId: review.project_id,
      eventType: "applied",
      entityType: review.entity_type,
      artifactReviewId: review.id,
      metadata: applyResult,
    });
  }

  return updated;
}

export async function approveArtifactReview(
  id: string,
  reviewerNotes?: string,
): Promise<ArtifactReviewRow> {
  return resolveArtifactReview(id, "approved", reviewerNotes);
}

export async function rejectArtifactReview(
  id: string,
  reviewerNotes?: string,
): Promise<ArtifactReviewRow> {
  return resolveArtifactReview(id, "rejected", reviewerNotes);
}
