/**
 * Traceability — stakeholders, standups, governance link graph.
 */

import { createClient } from "@/lib/supabase/server";
import { listDecisions, listMeetings, listRaidItems } from "./governance";
import {
  buildProjectTraceability,
  type ProjectTraceability,
} from "./traceabilityEngine";

export type StakeholderLevel = "low" | "medium" | "high";
export type StakeholderSentiment = "champion" | "neutral" | "skeptic" | "blocker";

export type StakeholderRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  name: string;
  role_label: string | null;
  organisation_name: string | null;
  email: string | null;
  influence: StakeholderLevel;
  interest: StakeholderLevel;
  sentiment: StakeholderSentiment;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type StandupRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  user_id: string;
  standup_date: string;
  yesterday: string;
  today: string;
  blockers: string | null;
  created_at: string;
  updated_at: string;
};

export type StandupWithContext = StandupRow & {
  project_name: string;
  user_name: string | null;
  user_email: string | null;
};

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, name")
    .eq("id", user.id)
    .single();

  if (!profile?.organisation_id) throw new Error("No organisation");
  return {
    supabase,
    orgId: profile.organisation_id,
    userId: user.id,
    userName: profile.name as string | null,
  };
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

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function listStakeholders(projectId: string): Promise<StakeholderRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("stakeholders")
    .select("*")
    .eq("project_id", projectId)
    .order("name");
  if (error) throw error;
  return (data ?? []) as StakeholderRow[];
}

export async function createStakeholder(input: {
  projectId: string;
  name: string;
  roleLabel?: string;
  organisationName?: string;
  email?: string;
  influence?: StakeholderLevel;
  interest?: StakeholderLevel;
  sentiment?: StakeholderSentiment;
  notes?: string;
}): Promise<StakeholderRow> {
  const { supabase, orgId, userId } = await getOrgContext();
  await assertProjectInOrg(supabase, orgId, input.projectId);

  const { data, error } = await supabase
    .from("stakeholders")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      name: input.name.trim(),
      role_label: input.roleLabel?.trim() || null,
      organisation_name: input.organisationName?.trim() || null,
      email: input.email?.trim() || null,
      influence: input.influence ?? "medium",
      interest: input.interest ?? "medium",
      sentiment: input.sentiment ?? "neutral",
      notes: input.notes?.trim() || null,
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as StakeholderRow;
}

export async function deleteStakeholder(id: string): Promise<void> {
  const { supabase } = await getOrgContext();
  const { error } = await supabase.from("stakeholders").delete().eq("id", id);
  if (error) throw error;
}

export async function listStandups(
  projectId: string,
  opts: { limit?: number; days?: number } = {},
): Promise<StandupRow[]> {
  const { supabase } = await getOrgContext();
  const limit = opts.limit ?? 30;
  const days = opts.days ?? 14;
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);

  const { data, error } = await supabase
    .from("standups")
    .select("*")
    .eq("project_id", projectId)
    .gte("standup_date", since.toISOString().slice(0, 10))
    .order("standup_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as StandupRow[];
}

export async function getTodayStandup(
  projectId: string,
  userId?: string,
): Promise<StandupRow | null> {
  const ctx = await getOrgContext();
  const uid = userId ?? ctx.userId;

  const { data, error } = await ctx.supabase
    .from("standups")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", uid)
    .eq("standup_date", utcToday())
    .maybeSingle();

  if (error) throw error;
  return (data as StandupRow | null) ?? null;
}

export async function upsertStandup(input: {
  projectId: string;
  yesterday: string;
  today: string;
  blockers?: string;
  standupDate?: string;
}): Promise<StandupRow> {
  const { supabase, orgId, userId } = await getOrgContext();
  await assertProjectInOrg(supabase, orgId, input.projectId);

  const standupDate = input.standupDate ?? utcToday();
  const existing = await getTodayStandup(input.projectId, userId);

  if (existing && existing.standup_date === standupDate) {
    const { data, error } = await supabase
      .from("standups")
      .update({
        yesterday: input.yesterday.trim(),
        today: input.today.trim(),
        blockers: input.blockers?.trim() || null,
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return data as StandupRow;
  }

  const { data, error } = await supabase
    .from("standups")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      user_id: userId,
      standup_date: standupDate,
      yesterday: input.yesterday.trim(),
      today: input.today.trim(),
      blockers: input.blockers?.trim() || null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as StandupRow;
}

export async function listOrgStandupsRecent(
  days = 7,
  limit = 50,
): Promise<StandupWithContext[]> {
  const { supabase, orgId } = await getOrgContext();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);

  const { data: standups, error } = await supabase
    .from("standups")
    .select("*")
    .eq("organisation_id", orgId)
    .gte("standup_date", since.toISOString().slice(0, 10))
    .order("standup_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!standups?.length) return [];

  const projectIds = [...new Set(standups.map((s) => s.project_id as string))];
  const userIds = [...new Set(standups.map((s) => s.user_id as string))];

  const [{ data: projects }, { data: users }] = await Promise.all([
    supabase.from("projects").select("id, name").in("id", projectIds),
    supabase.from("users").select("id, name, email").in("id", userIds),
  ]);

  const projectMap = Object.fromEntries((projects ?? []).map((p) => [p.id, p.name]));
  const userMap = Object.fromEntries(
    (users ?? []).map((u) => [u.id, { name: u.name, email: u.email }]),
  );

  return (standups as StandupRow[]).map((s) => ({
    ...s,
    project_name: projectMap[s.project_id] ?? "Project",
    user_name: userMap[s.user_id]?.name ?? null,
    user_email: userMap[s.user_id]?.email ?? null,
  }));
}

export async function countRecentStandups(projectId: string, days = 7): Promise<number> {
  const { supabase } = await getOrgContext();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);

  const { count, error } = await supabase
    .from("standups")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)
    .gte("standup_date", since.toISOString().slice(0, 10));

  if (error) throw error;
  return count ?? 0;
}

export async function hasStandupToday(projectId: string): Promise<boolean> {
  const row = await getTodayStandup(projectId);
  return Boolean(row?.today?.trim());
}

export async function getProjectTraceability(
  projectId: string,
): Promise<ProjectTraceability> {
  const [meetings, decisions, raid] = await Promise.all([
    listMeetings(projectId),
    listDecisions(projectId),
    listRaidItems(projectId),
  ]);
  return buildProjectTraceability(meetings, decisions, raid);
}

export type { ProjectTraceability, MeetingTraceChain } from "./traceabilityEngine";
