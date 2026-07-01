/**
 * Platform workflow execution — admin-backed proposal apply for integrator API.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  type CalendarEventPayload,
} from "./proposedActionEngine";
import type { ProposedActionRow } from "./proposedActions";
import { processProposalAppliedSideEffects } from "./deliveryImpact";
import { refreshProjectDashboards } from "@/lib/dashboard-refresh";
import { emitProposalAppliedEvent, emitTaskCreatedEvent } from "./platformWebhooks";

function mapProposalRow(row: Record<string, unknown>): ProposedActionRow {
  return {
    id: String(row.id),
    organisation_id: String(row.organisation_id),
    project_id: String(row.project_id),
    source: row.source as ProposedActionRow["source"],
    source_id: row.source_id ? String(row.source_id) : null,
    action_type: row.action_type as ProposedActionRow["action_type"],
    title: String(row.title),
    summary: String(row.summary ?? ""),
    payload: (row.payload as Record<string, unknown>) ?? {},
    status: row.status as ProposedActionRow["status"],
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

async function executeProposalForOrg(proposal: ProposedActionRow): Promise<Record<string, unknown>> {
  const admin = createAdminClient();
  const orgId = proposal.organisation_id;
  const p = proposal.payload;

  switch (proposal.action_type) {
    case "create_task": {
      const { data: project, error: projectError } = await admin
        .from("projects")
        .select("id, name")
        .eq("id", proposal.project_id)
        .eq("organisation_id", orgId)
        .maybeSingle();
      if (projectError) throw projectError;
      if (!project) throw new Error("Project not found");

      const assigneeId =
        typeof p.assigneeId === "string" && p.assigneeId.trim()
          ? p.assigneeId.trim()
          : null;

      const { data, error } = await admin
        .from("tasks")
        .insert({
          organisation_id: orgId,
          project_id: proposal.project_id,
          title: String(p.title ?? proposal.title).trim(),
          description: p.description ? String(p.description).trim() : null,
          status: "todo",
          priority: (p.priority as string) ?? "medium",
          assignee_id: assigneeId,
          source: proposal.source === "meeting" ? "meeting" : null,
          source_id: proposal.source === "meeting" ? proposal.source_id : null,
        })
        .select("id, title, priority")
        .single();
      if (error) throw error;

      void emitTaskCreatedEvent(orgId, {
        taskId: String(data.id),
        projectId: proposal.project_id,
        projectName: String(project.name),
        title: String(data.title),
        priority: String(data.priority),
        source: "platform_api",
      }).catch(() => undefined);

      return { entityType: "task", entityId: String(data.id) };
    }
    case "create_raid": {
      const { data, error } = await admin
        .from("raid_items")
        .insert({
          organisation_id: orgId,
          project_id: proposal.project_id,
          type: (p.raidType as string) ?? "risk",
          title: String(p.title ?? proposal.title).trim(),
          description: p.description ? String(p.description).trim() : null,
          status: "open",
          severity: (p.severity as string) ?? "medium",
          source_meeting_id: proposal.source_id,
        })
        .select("id")
        .single();
      if (error) throw error;
      return { entityType: "raid", entityId: String(data.id) };
    }
    case "create_decision": {
      const { data, error } = await admin
        .from("decisions")
        .insert({
          organisation_id: orgId,
          project_id: proposal.project_id,
          title: String(p.title ?? proposal.title).trim(),
          context: p.context ? String(p.context).trim() : proposal.summary,
          status: "proposed",
          meeting_id: proposal.source_id,
        })
        .select("id")
        .single();
      if (error) throw error;
      return { entityType: "decision", entityId: String(data.id) };
    }
    case "calendar_event": {
      const event: CalendarEventPayload = {
        title: String(p.title ?? proposal.title),
        scheduledAt: String(p.scheduledAt),
        durationMinutes: Number(p.durationMinutes ?? 60),
        description: p.description ? String(p.description) : proposal.summary,
        location: p.location ? String(p.location) : undefined,
      };
      return {
        entityType: "calendar_event",
        calendarUrl: buildGoogleCalendarUrl(event),
        outlookCalendarUrl: buildOutlookCalendarUrl(event),
      };
    }
    default:
      throw new Error("Unsupported action type");
  }
}

export async function applyProposalForOrg(
  orgId: string,
  proposalId: string,
  reviewerNotes?: string,
): Promise<ProposedActionRow> {
  const admin = createAdminClient();
  const { data: row, error: fetchErr } = await admin
    .from("proposed_actions")
    .select("*")
    .eq("id", proposalId)
    .eq("organisation_id", orgId)
    .maybeSingle();

  if (fetchErr) throw fetchErr;
  if (!row) throw new Error("Proposal not found");

  const proposal = mapProposalRow(row as Record<string, unknown>);
  if (proposal.status !== "approved" && proposal.status !== "pending") {
    throw new Error("Proposal is not approvable");
  }

  const now = new Date().toISOString();
  const applyResult = await executeProposalForOrg(proposal);

  const { data, error } = await admin
    .from("proposed_actions")
    .update({
      status: "applied",
      reviewer_notes: reviewerNotes?.trim() || proposal.reviewer_notes,
      apply_result: applyResult,
      decided_at: proposal.decided_at ?? now,
      applied_at: now,
    })
    .eq("id", proposalId)
    .select("*")
    .single();

  if (error) throw error;
  const mapped = mapProposalRow(data as Record<string, unknown>);

  await admin.from("audit_events").insert({
    organisation_id: orgId,
    project_id: mapped.project_id,
    actor_id: null,
    event_type: "applied",
    entity_type: "proposal",
    entity_id: mapped.id,
    proposal_id: mapped.id,
    metadata: applyResult,
  });

  await processProposalAppliedSideEffects(mapped, applyResult).catch(() => ({
    impactEvents: 0,
  }));

  void emitProposalAppliedEvent(orgId, {
    proposalId: mapped.id,
    projectId: mapped.project_id,
    actionType: mapped.action_type,
    title: mapped.title,
    applyResult,
    source: "platform_api",
  }).catch(() => undefined);

  refreshProjectDashboards(mapped.project_id);

  return mapped;
}
