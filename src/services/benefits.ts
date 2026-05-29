/**
 * Benefits realisation — hypotheses and KPI tracking.
 */

import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";

export type BenefitHypothesisRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  title: string;
  description: string | null;
  kpi_name: string | null;
  baseline_value: number | null;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
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

export async function listBenefits(projectId: string): Promise<BenefitHypothesisRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("benefit_hypotheses")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at");
  if (error) {
    throwIfMissingTable(error, "benefit_hypotheses");
    throw error;
  }
  return (data ?? []) as BenefitHypothesisRow[];
}

export async function listOrgBenefits(limit = 100): Promise<
  (BenefitHypothesisRow & { project_name: string })[]
> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("benefit_hypotheses")
    .select("*, projects!inner(name)")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) {
    throwIfMissingTable(error, "benefit_hypotheses");
    throw error;
  }
  return (data ?? []).map((row) => {
    const r = row as BenefitHypothesisRow & { projects: { name: string } };
    return { ...r, project_name: r.projects.name };
  });
}

export async function createBenefit(input: {
  projectId: string;
  title: string;
  description?: string;
  kpiName?: string;
  baselineValue?: number;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
}): Promise<BenefitHypothesisRow> {
  const { supabase, orgId, userId } = await getOrgContext();
  const { data, error } = await supabase
    .from("benefit_hypotheses")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      kpi_name: input.kpiName?.trim() || null,
      baseline_value: input.baselineValue ?? null,
      target_value: input.targetValue ?? null,
      current_value: input.currentValue ?? null,
      unit: input.unit?.trim() || null,
      created_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as BenefitHypothesisRow;
}

export async function updateBenefitCurrent(
  id: string,
  currentValue: number,
): Promise<BenefitHypothesisRow> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("benefit_hypotheses")
    .update({ current_value: currentValue })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as BenefitHypothesisRow;
}

export function benefitProgress(b: BenefitHypothesisRow): number | null {
  if (b.baseline_value == null || b.target_value == null || b.current_value == null) return null;
  const range = b.target_value - b.baseline_value;
  if (range === 0) return b.current_value >= b.target_value ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round(((b.current_value - b.baseline_value) / range) * 100)));
}
