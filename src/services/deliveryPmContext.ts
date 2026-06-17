/**
 * PM delivery context persistence.
 */

import { createClient } from "@/lib/supabase/server";

export type PmDeliveryContext = {
  id: string;
  project_id: string;
  project_type: string | null;
  budget: {
    approved?: number;
    spent?: number;
    forecast?: number;
    burnRateMonthly?: number;
    currency?: string;
  };
  delivery_plan: Record<string, unknown>;
  ai_summary: string | null;
  go_live_probability: number | null;
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
  return { supabase, orgId: profile.organisation_id as string };
}

export async function getPmDeliveryContext(
  projectId: string,
): Promise<PmDeliveryContext | null> {
  const { supabase } = await getOrgContext();
  const { data } = await supabase
    .from("pm_delivery_context")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();
  return data as PmDeliveryContext | null;
}

export async function upsertPmDeliveryContext(input: {
  projectId: string;
  projectType?: string;
  budget?: PmDeliveryContext["budget"];
  deliveryPlan?: Record<string, unknown>;
  aiSummary?: string;
  goLiveProbability?: number;
  extractionStatus?: string;
}): Promise<PmDeliveryContext> {
  const { supabase, orgId } = await getOrgContext();
  const existing = await getPmDeliveryContext(input.projectId);

  const payload = {
    project_type: input.projectType ?? existing?.project_type,
    budget: input.budget ?? existing?.budget ?? {},
    delivery_plan: input.deliveryPlan ?? existing?.delivery_plan ?? {},
    ai_summary: input.aiSummary ?? existing?.ai_summary,
    go_live_probability: input.goLiveProbability ?? existing?.go_live_probability,
    extraction_status: input.extractionStatus ?? existing?.extraction_status ?? "pending",
  };

  if (existing) {
    const { data, error } = await supabase
      .from("pm_delivery_context")
      .update(payload)
      .eq("project_id", input.projectId)
      .select("*")
      .single();
    if (error) throw error;
    return data as PmDeliveryContext;
  }

  const { data, error } = await supabase
    .from("pm_delivery_context")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      ...payload,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as PmDeliveryContext;
}
