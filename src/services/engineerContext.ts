/**
 * Engineer context persistence (per user).
 */

import { createClient } from "@/lib/supabase/server";

export type EngineerContext = {
  id: string;
  organisation_id: string;
  user_id: string;
  specialisation: string | null;
  tech_stack: Record<string, string[]>;
  engineering_plan: Record<string, unknown>;
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

function mapRow(data: Record<string, unknown>): EngineerContext {
  return {
    id: data.id as string,
    organisation_id: data.organisation_id as string,
    user_id: data.user_id as string,
    specialisation: (data.specialisation as string) ?? null,
    tech_stack: (data.tech_stack ?? {}) as Record<string, string[]>,
    engineering_plan: (data.engineering_plan ?? {}) as Record<string, unknown>,
    ai_summary: (data.ai_summary as string) ?? null,
    extraction_status: (data.extraction_status as string) ?? "pending",
  };
}

export async function getEngineerContext(): Promise<EngineerContext | null> {
  const { supabase, userId } = await getOrgContext();
  const { data } = await supabase
    .from("engineer_context")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function upsertEngineerContext(input: {
  specialisation?: string;
  techStack?: Record<string, string[]>;
  engineeringPlan?: Record<string, unknown>;
  aiSummary?: string;
  extractionStatus?: string;
}): Promise<EngineerContext> {
  const { supabase, orgId, userId } = await getOrgContext();
  const existing = await getEngineerContext();

  const payload = {
    specialisation: input.specialisation ?? existing?.specialisation,
    tech_stack: input.techStack ?? existing?.tech_stack ?? {},
    engineering_plan: input.engineeringPlan ?? existing?.engineering_plan ?? {},
    ai_summary: input.aiSummary ?? existing?.ai_summary,
    extraction_status: input.extractionStatus ?? existing?.extraction_status ?? "pending",
  };

  if (existing) {
    const { data, error } = await supabase
      .from("engineer_context")
      .update(payload)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data as Record<string, unknown>);
  }

  const { data, error } = await supabase
    .from("engineer_context")
    .insert({ organisation_id: orgId, user_id: userId, ...payload })
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}
