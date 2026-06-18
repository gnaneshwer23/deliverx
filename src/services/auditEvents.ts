/**
 * Audit trail — every AI suggestion and human decision.
 */

import { createClient } from "@/lib/supabase/server";
import type { AuditEventType } from "@/lib/approval/constants";

export type AuditEventRow = {
  id: string;
  organisation_id: string;
  project_id: string | null;
  actor_id: string | null;
  event_type: AuditEventType;
  entity_type: string;
  entity_id: string | null;
  artifact_review_id: string | null;
  proposal_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.organisation_id) throw new Error("No organisation");

  return {
    supabase,
    userId: user.id,
    orgId: profile.organisation_id as string,
  };
}

export async function logAuditEvent(input: {
  projectId?: string | null;
  eventType: AuditEventType;
  entityType: string;
  entityId?: string | null;
  artifactReviewId?: string | null;
  proposalId?: string | null;
  metadata?: Record<string, unknown>;
  actorId?: string | null;
}): Promise<void> {
  const { supabase, orgId, userId } = await getOrgContext();

  const { error } = await supabase.from("audit_events").insert({
    organisation_id: orgId,
    project_id: input.projectId ?? null,
    actor_id: input.actorId ?? userId,
    event_type: input.eventType,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    artifact_review_id: input.artifactReviewId ?? null,
    proposal_id: input.proposalId ?? null,
    metadata: input.metadata ?? {},
  });

  if (error && error.code !== "42P01") throw error;
}

export type AuditEventWithContext = AuditEventRow & {
  actor_name: string | null;
  actor_email: string | null;
  project_name: string | null;
};

function mapAuditRow(row: Record<string, unknown>): AuditEventWithContext {
  const users = row.users as { full_name?: string; email?: string } | null | undefined;
  const projects = row.projects as { name?: string } | null | undefined;

  return {
    id: String(row.id),
    organisation_id: String(row.organisation_id),
    project_id: row.project_id ? String(row.project_id) : null,
    actor_id: row.actor_id ? String(row.actor_id) : null,
    event_type: row.event_type as AuditEventRow["event_type"],
    entity_type: String(row.entity_type),
    entity_id: row.entity_id ? String(row.entity_id) : null,
    artifact_review_id: row.artifact_review_id ? String(row.artifact_review_id) : null,
    proposal_id: row.proposal_id ? String(row.proposal_id) : null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_at: String(row.created_at),
    actor_name: users?.full_name ? String(users.full_name) : null,
    actor_email: users?.email ? String(users.email) : null,
    project_name: projects?.name ? String(projects.name) : null,
  };
}

export async function listProjectAuditEvents(
  projectId: string,
  limit = 30,
): Promise<AuditEventRow[]> {
  return listOrgAuditEvents({ projectId, limit });
}

export async function listOrgAuditEvents(input?: {
  projectId?: string | null;
  limit?: number;
}): Promise<AuditEventWithContext[]> {
  const { supabase } = await getOrgContext();
  const limit = input?.limit ?? 50;

  let query = supabase
    .from("audit_events")
    .select("*, users(full_name, email), projects(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (input?.projectId) {
    query = query.eq("project_id", input.projectId);
  }

  const { data, error } = await query;

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data ?? []).map((row) => mapAuditRow(row as Record<string, unknown>));
}
