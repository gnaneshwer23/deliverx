/**
 * Charter CRUD + alignment score persistence.
 */

import { createClient } from "@/lib/supabase/server";

export type CharterRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  title: string | null;
  content: string;
  extracted_goals: string[];
  success_criteria: string[];
  scope_summary: string | null;
  file_url: string | null;
  version: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AlignmentSource = "manual" | "scheduled" | "meeting" | "ai";

export type AlignmentScoreRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  charter_id: string;
  score: number;
  previous_score: number | null;
  delta: number | null;
  meeting_id: string | null;
  source: AlignmentSource;
  factors: string[];
  computed_at: string;
  created_by: string | null;
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
  return { supabase, orgId: profile.organisation_id, userId: user.id };
}

async function assertProjectInOrg(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orgId: string,
  projectId: string,
) {
  const { data } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("organisation_id", orgId)
    .maybeSingle();
  if (!data) throw new Error("Project not found");
}

function mapCharter(row: Record<string, unknown>): CharterRow {
  return {
    ...row,
    extracted_goals: (row.extracted_goals as string[]) ?? [],
    success_criteria: (row.success_criteria as string[]) ?? [],
  } as CharterRow;
}

function mapScore(row: Record<string, unknown>): AlignmentScoreRow {
  return {
    ...row,
    factors: (row.factors as string[]) ?? [],
  } as AlignmentScoreRow;
}

export async function getActiveCharter(projectId: string): Promise<CharterRow | null> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("charters")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCharter(data) : null;
}

export async function upsertCharter(input: {
  projectId: string;
  title?: string;
  content: string;
  extractedGoals?: string[];
  successCriteria?: string[];
  scopeSummary?: string;
  fileUrl?: string;
}): Promise<CharterRow> {
  const { supabase, orgId, userId } = await getOrgContext();
  await assertProjectInOrg(supabase, orgId, input.projectId);

  const existing = await getActiveCharter(input.projectId);

  if (existing) {
    const { data, error } = await supabase
      .from("charters")
      .update({
        title: input.title?.trim() || existing.title,
        content: input.content.trim(),
        extracted_goals: input.extractedGoals ?? existing.extracted_goals,
        success_criteria: input.successCriteria ?? existing.success_criteria,
        scope_summary: input.scopeSummary?.trim() || existing.scope_summary,
        file_url: input.fileUrl ?? existing.file_url,
        version: existing.version + 1,
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw error;
    return mapCharter(data);
  }

  const { data, error } = await supabase
    .from("charters")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      title: input.title?.trim() || "Project charter",
      content: input.content.trim(),
      extracted_goals: input.extractedGoals ?? [],
      success_criteria: input.successCriteria ?? [],
      scope_summary: input.scopeSummary?.trim() || null,
      file_url: input.fileUrl ?? null,
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapCharter(data);
}

export async function getLatestAlignmentScore(
  projectId: string,
): Promise<AlignmentScoreRow | null> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("charter_alignment_scores")
    .select("*")
    .eq("project_id", projectId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapScore(data) : null;
}

export async function listAlignmentScores(
  projectId: string,
  limit = 20,
): Promise<AlignmentScoreRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("charter_alignment_scores")
    .select("*")
    .eq("project_id", projectId)
    .order("computed_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapScore);
}

export async function saveAlignmentScore(input: {
  projectId: string;
  charterId: string;
  score: number;
  previousScore?: number | null;
  meetingId?: string;
  source?: AlignmentSource;
  factors: string[];
}): Promise<AlignmentScoreRow> {
  const { supabase, orgId, userId } = await getOrgContext();
  await assertProjectInOrg(supabase, orgId, input.projectId);

  const prev = input.previousScore ?? null;
  const delta = prev != null ? input.score - prev : null;

  const { data, error } = await supabase
    .from("charter_alignment_scores")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      charter_id: input.charterId,
      score: input.score,
      previous_score: prev,
      delta,
      meeting_id: input.meetingId ?? null,
      source: input.source ?? "ai",
      factors: input.factors,
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapScore(data);
}

export async function getOrgAlignmentSummary(): Promise<
  Array<{ projectId: string; projectName: string; score: number; delta: number | null }>
> {
  const { supabase, orgId } = await getOrgContext();

  const { data: projects, error: pErr } = await supabase
    .from("projects")
    .select("id, name")
    .eq("organisation_id", orgId)
    .in("status", ["draft", "active"])
    .order("created_at", { ascending: false })
    .limit(10);

  if (pErr) throw pErr;
  if (!projects?.length) return [];

  const out: Array<{
    projectId: string;
    projectName: string;
    score: number;
    delta: number | null;
  }> = [];

  for (const p of projects) {
    const latest = await getLatestAlignmentScore(p.id);
    if (latest) {
      out.push({
        projectId: p.id,
        projectName: p.name,
        score: latest.score,
        delta: latest.delta,
      });
    }
  }

  return out;
}
