/**
 * Scrum Master context persistence (per user).
 */

import { createClient } from "@/lib/supabase/server";

export type ScrumContext = {
  id: string;
  organisation_id: string;
  user_id: string;
  agile_framework: string | null;
  team_config: string | null;
  sprint_plan: Record<string, unknown>;
  ai_summary: string | null;
  extraction_status: string;
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
  return { supabase, orgId: profile.organisation_id as string, userId: user.id };
}

function mapRow(data: Record<string, unknown>): ScrumContext {
  return {
    id: data.id as string,
    organisation_id: data.organisation_id as string,
    user_id: data.user_id as string,
    agile_framework: (data.agile_framework as string) ?? null,
    team_config: (data.team_config as string) ?? null,
    sprint_plan: (data.sprint_plan ?? {}) as Record<string, unknown>,
    ai_summary: (data.ai_summary as string) ?? null,
    extraction_status: (data.extraction_status as string) ?? "pending",
  };
}

export async function getScrumContext(): Promise<ScrumContext | null> {
  const { supabase, userId } = await getOrgContext();
  const { data } = await supabase
    .from("scrum_context")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function upsertScrumContext(input: {
  agileFramework?: string;
  teamConfig?: string;
  sprintPlan?: Record<string, unknown>;
  aiSummary?: string;
  extractionStatus?: string;
}): Promise<ScrumContext> {
  const { supabase, orgId, userId } = await getOrgContext();
  const existing = await getScrumContext();

  const payload = {
    agile_framework: input.agileFramework ?? existing?.agile_framework,
    team_config: input.teamConfig ?? existing?.team_config,
    sprint_plan: input.sprintPlan ?? existing?.sprint_plan ?? {},
    ai_summary: input.aiSummary ?? existing?.ai_summary,
    extraction_status: input.extractionStatus ?? existing?.extraction_status ?? "pending",
  };

  if (existing) {
    const { data, error } = await supabase
      .from("scrum_context")
      .update(payload)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data as Record<string, unknown>);
  }

  const { data, error } = await supabase
    .from("scrum_context")
    .insert({ organisation_id: orgId, user_id: userId, ...payload })
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}
