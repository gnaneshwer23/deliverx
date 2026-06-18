/**
 * Founder context persistence (org-level).
 */

import { createClient } from "@/lib/supabase/server";

export type FounderFinancials = {
  cashInBank?: number;
  monthlyBurn?: number;
  runwayMonths?: number;
  mrr?: number;
  arr?: number;
  growthPct?: number;
  currency?: string;
  nextRaise?: string;
  runwayEndPrediction?: string;
};

export type FounderContext = {
  id: string;
  organisation_id: string;
  company_type: string | null;
  business_goals: string[];
  financials: FounderFinancials;
  strategic_objectives: Array<{ title: string; progress: number; insight?: string }>;
  company_summary: Record<string, unknown>;
  investor_snapshot: Record<string, unknown>;
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
  return { supabase, orgId: profile.organisation_id as string };
}

function mapRow(data: Record<string, unknown>): FounderContext {
  return {
    id: data.id as string,
    organisation_id: data.organisation_id as string,
    company_type: (data.company_type as string) ?? null,
    business_goals: Array.isArray(data.business_goals)
      ? (data.business_goals as string[])
      : [],
    financials: (data.financials ?? {}) as FounderFinancials,
    strategic_objectives: Array.isArray(data.strategic_objectives)
      ? (data.strategic_objectives as FounderContext["strategic_objectives"])
      : [],
    company_summary: (data.company_summary ?? {}) as Record<string, unknown>,
    investor_snapshot: (data.investor_snapshot ?? {}) as Record<string, unknown>,
    ai_summary: (data.ai_summary as string) ?? null,
    extraction_status: (data.extraction_status as string) ?? "pending",
  };
}

export async function getFounderContext(): Promise<FounderContext | null> {
  const { supabase, orgId } = await getOrgContext();
  const { data } = await supabase
    .from("founder_context")
    .select("*")
    .eq("organisation_id", orgId)
    .maybeSingle();
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function upsertFounderContext(input: {
  companyType?: string;
  businessGoals?: string[];
  financials?: FounderFinancials;
  strategicObjectives?: FounderContext["strategic_objectives"];
  companySummary?: Record<string, unknown>;
  investorSnapshot?: Record<string, unknown>;
  aiSummary?: string;
  extractionStatus?: string;
}): Promise<FounderContext> {
  const { supabase, orgId } = await getOrgContext();
  const existing = await getFounderContext();

  const payload = {
    company_type: input.companyType ?? existing?.company_type,
    business_goals: input.businessGoals ?? existing?.business_goals ?? [],
    financials: input.financials ?? existing?.financials ?? {},
    strategic_objectives:
      input.strategicObjectives ?? existing?.strategic_objectives ?? [],
    company_summary: input.companySummary ?? existing?.company_summary ?? {},
    investor_snapshot: input.investorSnapshot ?? existing?.investor_snapshot ?? {},
    ai_summary: input.aiSummary ?? existing?.ai_summary,
    extraction_status: input.extractionStatus ?? existing?.extraction_status ?? "pending",
  };

  if (existing) {
    const { data, error } = await supabase
      .from("founder_context")
      .update(payload)
      .eq("organisation_id", orgId)
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data as Record<string, unknown>);
  }

  const { data, error } = await supabase
    .from("founder_context")
    .insert({ organisation_id: orgId, ...payload })
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}
