/**
 * Proposed actions — persistence and apply workflow (approve before execute).
 */

import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";
import { createTask } from "./delivery";
import {
  createDecision,
  createRaidItem,
  type RaidItemType,
  type RaidSeverity,
} from "./governance";
import {
  buildGoogleCalendarUrl,
  type CalendarEventPayload,
  type ProposalActionType,
  type ProposalSource,
  type ProposalStatus,
  type StructuredProposal,
} from "./proposedActionEngine";

export type ProposedActionRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  source: ProposalSource;
  source_id: string | null;
  action_type: ProposalActionType;
  title: string;
  summary: string;
  payload: Record<string, unknown>;
  status: ProposalStatus;
  reviewer_notes: string | null;
  apply_result: Record<string, unknown> | null;
  decided_by: string | null;
  decided_at: string | null;
  applied_at: string | null;
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

function mapRow(row: Record<string, unknown>): ProposedActionRow {
  return {
    id: String(row.id),
    organisation_id: String(row.organisation_id),
    project_id: String(row.project_id),
    source: row.source as ProposalSource,
    source_id: row.source_id ? String(row.source_id) : null,
    action_type: row.action_type as ProposalActionType,
    title: String(row.title),
    summary: String(row.summary ?? ""),
    payload: (row.payload as Record<string, unknown>) ?? {},
    status: row.status as ProposalStatus,
    reviewer_notes: row.reviewer_notes ? String(row.reviewer_notes) : null,
    apply_result: (row.apply_result as Record<string, unknown>) ?? null,
    decided_by: row.decided_by ? String(row.decided_by) : null,
    decided_at: row.decided_at ? String(row.decided_at) : null,
    applied_at: row.applied_at ? String(row.applied_at) : null,
    created_by: row.created_by ? String(row.created_by) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function listPendingProposals(limit = 50): Promise<
  (ProposedActionRow & { project_name: string })[]
> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("proposed_actions")
    .select("*, projects!inner(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throwIfMissingTable(error, "proposed_actions");
    throw error;
  }

  return (data ?? []).map((row) => {
    const r = row as ProposedActionRow & { projects: { name: string } };
    return { ...mapRow(r as unknown as Record<string, unknown>), project_name: r.projects.name };
  });
}

export async function listProjectProposals(
  projectId: string,
  limit = 20,
): Promise<ProposedActionRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("proposed_actions")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throwIfMissingTable(error, "proposed_actions");
    throw error;
  }

  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function countPendingProposals(): Promise<number> {
  const { supabase } = await getOrgContext();
  const { count, error } = await supabase
    .from("proposed_actions")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) {
    if (error.code === "42P01") return 0;
    throw error;
  }
  return count ?? 0;
}

export async function queueProposals(input: {
  projectId: string;
  source: ProposalSource;
  sourceId?: string;
  proposals: StructuredProposal[];
}): Promise<ProposedActionRow[]> {
  if (input.proposals.length === 0) return [];

  const { supabase, orgId, userId } = await getOrgContext();
  const rows = input.proposals.map((p) => ({
    organisation_id: orgId,
    project_id: input.projectId,
    source: input.source,
    source_id: input.sourceId ?? null,
    action_type: p.actionType,
    title: p.title,
    summary: p.summary,
    payload: p.payload,
    status: "pending" as const,
    created_by: userId,
  }));

  const { data, error } = await supabase
    .from("proposed_actions")
    .insert(rows)
    .select("*");

  if (error) {
    throwIfMissingTable(error, "proposed_actions");
    throw error;
  }

  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function resolveProposal(
  id: string,
  status: "approved" | "rejected",
  reviewerNotes?: string,
): Promise<ProposedActionRow> {
  const { supabase, userId } = await getOrgContext();
  const { data, error } = await supabase
    .from("proposed_actions")
    .update({
      status,
      reviewer_notes: reviewerNotes?.trim() || null,
      decided_by: userId,
      decided_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

export async function applyProposal(id: string): Promise<ProposedActionRow> {
  const { supabase, userId } = await getOrgContext();

  const { data: row, error: fetchErr } = await supabase
    .from("proposed_actions")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !row) throw new Error("Proposal not found");

  const proposal = mapRow(row as Record<string, unknown>);
  if (proposal.status !== "approved" && proposal.status !== "pending") {
    throw new Error("Proposal is not approvable");
  }

  const applyResult = await executeProposal(proposal);

  const { data, error } = await supabase
    .from("proposed_actions")
    .update({
      status: "applied",
      apply_result: applyResult,
      decided_by: proposal.decided_by ?? userId,
      decided_at: proposal.decided_at ?? new Date().toISOString(),
      applied_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

async function executeProposal(
  proposal: ProposedActionRow,
): Promise<Record<string, unknown>> {
  const p = proposal.payload;

  switch (proposal.action_type) {
    case "create_task": {
      const task = await createTask({
        projectId: proposal.project_id,
        title: String(p.title ?? proposal.title),
        description: p.description ? String(p.description) : undefined,
        priority: (p.priority as "low" | "medium" | "high" | "critical") ?? "medium",
      });
      return { entityType: "task", entityId: task.id };
    }
    case "create_raid": {
      const raid = await createRaidItem({
        projectId: proposal.project_id,
        type: (p.raidType as RaidItemType) ?? "risk",
        title: String(p.title ?? proposal.title),
        description: p.description ? String(p.description) : undefined,
        severity: (p.severity as RaidSeverity) ?? "medium",
        sourceMeetingId: proposal.source_id ?? undefined,
      });
      return { entityType: "raid", entityId: raid.id };
    }
    case "create_decision": {
      const decision = await createDecision({
        projectId: proposal.project_id,
        title: String(p.title ?? proposal.title),
        context: p.context ? String(p.context) : proposal.summary,
        meetingId: proposal.source_id ?? undefined,
      });
      return { entityType: "decision", entityId: decision.id };
    }
    case "calendar_event": {
      const event: CalendarEventPayload = {
        title: String(p.title ?? proposal.title),
        scheduledAt: String(p.scheduledAt),
        durationMinutes: Number(p.durationMinutes ?? 60),
        description: p.description ? String(p.description) : proposal.summary,
        location: p.location ? String(p.location) : undefined,
      };
      const calendarUrl = buildGoogleCalendarUrl(event);
      return { entityType: "calendar_event", calendarUrl };
    }
    default:
      throw new Error("Unsupported action type");
  }
}

export async function approveAndApplyProposal(
  id: string,
  reviewerNotes?: string,
): Promise<ProposedActionRow> {
  await resolveProposal(id, "approved", reviewerNotes);
  return applyProposal(id);
}
