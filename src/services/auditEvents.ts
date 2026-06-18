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

export async function listProjectAuditEvents(
  projectId: string,
  limit = 30,
): Promise<AuditEventRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("audit_events")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data ?? []) as AuditEventRow[];
}
