/**
 * Delivery impact events — persist and query cross-role dashboard updates.
 */

import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";
import type { ProposedActionRow } from "./proposedActions";
import { syncRequirementTraceLinks } from "./deliveryTraceability";
import { syncProjectMemory } from "./projectMemoryRag";
import { notifyProposalApplied } from "./notificationService";
import {
  mergeImpactIntoCrossRole,
  proposalApplyToImpactEvents,
  tonesForImpactSeverity,
  type DeliveryImpactEventDraft,
  type DeliveryImpactRole,
  type DeliveryImpactTone,
  type ImpactFeedSeverity,
} from "./deliveryImpactEngine";

export type DeliveryImpactEventRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  source: "proposal" | "meeting" | "artifact" | "bootstrap";
  source_id: string | null;
  proposal_id: string | null;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  target_role: DeliveryImpactRole;
  message: string;
  tone: DeliveryImpactTone;
  created_at: string;
  project_name?: string;
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
    .single();

  if (!profile?.organisation_id) throw new Error("No organisation");
  return { supabase, orgId: profile.organisation_id as string };
}

function mapRow(row: Record<string, unknown>): DeliveryImpactEventRow {
  return {
    id: String(row.id),
    organisation_id: String(row.organisation_id),
    project_id: String(row.project_id),
    source: row.source as DeliveryImpactEventRow["source"],
    source_id: row.source_id ? String(row.source_id) : null,
    proposal_id: row.proposal_id ? String(row.proposal_id) : null,
    action_type: String(row.action_type),
    entity_type: row.entity_type ? String(row.entity_type) : null,
    entity_id: row.entity_id ? String(row.entity_id) : null,
    target_role: row.target_role as DeliveryImpactRole,
    message: String(row.message),
    tone: row.tone as DeliveryImpactTone,
    created_at: String(row.created_at),
  };
}

export async function emitDeliveryImpactEvents(input: {
  projectId: string;
  source: DeliveryImpactEventRow["source"];
  sourceId?: string | null;
  proposalId?: string | null;
  actionType: string;
  entityType?: string | null;
  entityId?: string | null;
  drafts: DeliveryImpactEventDraft[];
}): Promise<number> {
  if (input.drafts.length === 0) return 0;

  const { supabase, orgId } = await getOrgContext();
  const rows = input.drafts.map((draft) => ({
    organisation_id: orgId,
    project_id: input.projectId,
    source: input.source,
    source_id: input.sourceId ?? null,
    proposal_id: input.proposalId ?? null,
    action_type: input.actionType,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    target_role: draft.targetRole,
    message: draft.message,
    tone: draft.tone,
  }));

  const { error } = await supabase.from("delivery_impact_events").insert(rows);
  if (error) {
    throwIfMissingTable(error, "delivery_impact_events");
    throw error;
  }

  return rows.length;
}

export async function processProposalAppliedSideEffects(
  proposal: ProposedActionRow,
  applyResult: Record<string, unknown>,
): Promise<{ impactEvents: number }> {
  const drafts = proposalApplyToImpactEvents({
    actionType: proposal.action_type,
    title: proposal.title,
    source: proposal.source,
    applyResult,
  });

  const impactEvents = await emitDeliveryImpactEvents({
    projectId: proposal.project_id,
    source: "proposal",
    sourceId: proposal.source_id,
    proposalId: proposal.id,
    actionType: proposal.action_type,
    entityType: applyResult.entityType ? String(applyResult.entityType) : null,
    entityId: applyResult.entityId ? String(applyResult.entityId) : null,
    drafts,
  });

  const sideEffects: Promise<unknown>[] = [];

  if (proposal.source === "meeting") {
    sideEffects.push(syncProjectMemory(proposal.project_id).catch(() => undefined));
  }

  if (proposal.action_type === "create_task") {
    sideEffects.push(syncRequirementTraceLinks(proposal.project_id).catch(() => undefined));
  }

  await Promise.all(sideEffects);

  await notifyProposalApplied(proposal, applyResult, proposal.organisation_id).catch(
    () => ({ sent: 0, skipped: 1 }),
  );

  return { impactEvents };
}

export async function listProjectImpactEvents(
  projectId: string,
  limit = 20,
): Promise<DeliveryImpactEventRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("delivery_impact_events")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function listRecentImpactEventsByRole(
  projectId: string,
  hours = 24,
): Promise<DeliveryImpactEventRow[]> {
  const { supabase } = await getOrgContext();
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("delivery_impact_events")
    .select("*")
    .eq("project_id", projectId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  const seen = new Set<DeliveryImpactRole>();
  const deduped: DeliveryImpactEventRow[] = [];
  for (const row of data ?? []) {
    const mapped = mapRow(row as Record<string, unknown>);
    if (seen.has(mapped.target_role)) continue;
    seen.add(mapped.target_role);
    deduped.push(mapped);
  }

  return deduped;
}

/** Merge persisted delivery_impact_events into cross-role dashboard rows. */
export async function mergeProjectImpactIntoCrossRole<
  T extends { role: string; message: string; tone: string },
>(base: T[], projectId: string | null | undefined): Promise<T[]> {
  if (!projectId) return base;
  const recentImpact = await listRecentImpactEventsByRole(projectId).catch(() => []);
  if (recentImpact.length === 0) return base;
  return mergeImpactIntoCrossRole(
    base,
    recentImpact.map((e) => ({
      targetRole: e.target_role,
      message: e.message,
      tone: e.tone,
    })),
  );
}

export async function listOrgImpactEvents(
  opts: {
    limit?: number;
    severity?: ImpactFeedSeverity;
    targetRole?: DeliveryImpactRole;
    projectId?: string;
  } = {},
): Promise<DeliveryImpactEventRow[]> {
  const limit = opts.limit ?? 12;
  const { supabase } = await getOrgContext();
  let q = supabase
    .from("delivery_impact_events")
    .select("*, projects!inner(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (opts.projectId) {
    q = q.eq("project_id", opts.projectId);
  }
  if (opts.targetRole) {
    q = q.eq("target_role", opts.targetRole);
  }
  const toneFilter = opts.severity ? tonesForImpactSeverity(opts.severity) : null;
  if (toneFilter?.length) {
    q = q.in("tone", toneFilter);
  }

  const { data, error } = await q;

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data ?? []).map((row) => {
    const r = row as DeliveryImpactEventRow & { projects: { name: string } };
    return {
      ...mapRow(r as unknown as Record<string, unknown>),
      project_name: r.projects.name,
    };
  });
}

export async function getDeliveryImpactStats(projectId: string): Promise<{
  last24h: number;
  byRole: Partial<Record<DeliveryImpactRole, number>>;
}> {
  const events = await listProjectImpactEvents(projectId, 100);
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const recent = events.filter((e) => new Date(e.created_at).getTime() >= since);
  const byRole: Partial<Record<DeliveryImpactRole, number>> = {};

  for (const event of recent) {
    byRole[event.target_role] = (byRole[event.target_role] ?? 0) + 1;
  }

  return { last24h: recent.length, byRole };
}
