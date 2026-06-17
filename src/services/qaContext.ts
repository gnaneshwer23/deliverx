/**
 * QA context persistence (per user).
 */

import { createClient } from "@/lib/supabase/server";

export type QaContext = {
  id: string;
  organisation_id: string;
  user_id: string;
  specialisation: string | null;
  testing_tools: string[];
  quality_plan: Record<string, unknown>;
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

function mapRow(data: Record<string, unknown>): QaContext {
  return {
    id: data.id as string,
    organisation_id: data.organisation_id as string,
    user_id: data.user_id as string,
    specialisation: (data.specialisation as string) ?? null,
    testing_tools: (data.testing_tools as string[]) ?? [],
    quality_plan: (data.quality_plan ?? {}) as Record<string, unknown>,
    ai_summary: (data.ai_summary as string) ?? null,
    extraction_status: (data.extraction_status as string) ?? "pending",
  };
}

export async function getQaContext(): Promise<QaContext | null> {
  const { supabase, userId } = await getOrgContext();
  const { data } = await supabase
    .from("qa_context")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function upsertQaContext(input: {
  specialisation?: string;
  testingTools?: string[];
  qualityPlan?: Record<string, unknown>;
  aiSummary?: string;
  extractionStatus?: string;
}): Promise<QaContext> {
  const { supabase, orgId, userId } = await getOrgContext();
  const existing = await getQaContext();

  const payload = {
    specialisation: input.specialisation ?? existing?.specialisation,
    testing_tools: input.testingTools ?? existing?.testing_tools ?? [],
    quality_plan: input.qualityPlan ?? existing?.quality_plan ?? {},
    ai_summary: input.aiSummary ?? existing?.ai_summary,
    extraction_status: input.extractionStatus ?? existing?.extraction_status ?? "pending",
  };

  if (existing) {
    const { data, error } = await supabase
      .from("qa_context")
      .update(payload)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data as Record<string, unknown>);
  }

  const { data, error } = await supabase
    .from("qa_context")
    .insert({ organisation_id: orgId, user_id: userId, ...payload })
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}
