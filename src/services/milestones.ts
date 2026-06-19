/**
 * Milestones — delivery milestone tracking with confidence scores.
 */

import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";
import { emitLoopPropagation, milestoneChangeToImpactDrafts } from "./loopEventPropagation";

export type MilestoneStatus = "planned" | "at_risk" | "completed" | "slipped";

export type MilestoneRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  workstream_id: string | null;
  title: string;
  description: string | null;
  target_date: string | null;
  confidence_score: number;
  status: MilestoneStatus;
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
    .single();
  if (!profile?.organisation_id) throw new Error("No organisation");
  return { supabase, userId: user.id, orgId: profile.organisation_id as string };
}

export async function listMilestones(projectId: string): Promise<MilestoneRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("target_date", { ascending: true, nullsFirst: false });
  if (error) {
    throwIfMissingTable(error, "milestones");
    throw error;
  }
  return (data ?? []) as MilestoneRow[];
}

export async function listOrgMilestones(limit = 80): Promise<
  (MilestoneRow & { project_name: string })[]
> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("milestones")
    .select("*, projects!inner(name)")
    .in("status", ["planned", "at_risk", "slipped"])
    .order("target_date", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) {
    throwIfMissingTable(error, "milestones");
    throw error;
  }
  return (data ?? []).map((row) => {
    const r = row as MilestoneRow & { projects: { name: string } };
    return { ...r, project_name: r.projects.name };
  });
}

export async function createMilestone(input: {
  projectId: string;
  title: string;
  description?: string;
  targetDate?: string;
  confidenceScore?: number;
  workstreamId?: string;
  status?: MilestoneStatus;
}): Promise<MilestoneRow> {
  const { supabase, orgId, userId } = await getOrgContext();
  const { data, error } = await supabase
    .from("milestones")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      workstream_id: input.workstreamId ?? null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      target_date: input.targetDate ?? null,
      confidence_score: input.confidenceScore ?? 80,
      status: input.status ?? "planned",
      created_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  const row = data as MilestoneRow;

  void emitLoopPropagation({
    projectId: input.projectId,
    actionType: "milestone_create",
    entityType: "milestone",
    entityId: row.id,
    drafts: milestoneChangeToImpactDrafts({
      title: row.title,
      statusAfter: row.status,
      confidenceScore: row.confidence_score,
      isNew: true,
    }),
    syncNarrativeThreads: false,
  }).catch(() => 0);

  return row;
}

export async function updateMilestoneConfidence(
  id: string,
  confidenceScore: number,
  status?: MilestoneStatus,
): Promise<MilestoneRow> {
  const { supabase } = await getOrgContext();
  const { data: before, error: beforeError } = await supabase
    .from("milestones")
    .select("title, status, confidence_score")
    .eq("id", id)
    .maybeSingle();
  if (beforeError) throw beforeError;

  const patch: Record<string, unknown> = { confidence_score: confidenceScore };
  if (status) patch.status = status;
  const { data, error } = await supabase
    .from("milestones")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  const row = data as MilestoneRow;

  if (before) {
    const drafts = milestoneChangeToImpactDrafts({
      title: row.title,
      statusBefore: String(before.status),
      statusAfter: row.status,
      confidenceScore: row.confidence_score,
      confidenceBefore: Number(before.confidence_score),
    });
    if (drafts.length > 0) {
      void emitLoopPropagation({
        projectId: row.project_id,
        actionType: "milestone_update",
        entityType: "milestone",
        entityId: row.id,
        drafts,
        syncNarrativeThreads: false,
      }).catch(() => 0);
    }
  }

  return row;
}
