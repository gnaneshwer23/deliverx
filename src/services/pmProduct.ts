/**
 * Product Manager data — context, features, insights, segments.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  CustomerInsightRow,
  CustomerSegmentRow,
  ProductFeatureRow,
  RiceScore,
} from "./pmProductEngine";

export type PmProductContext = {
  id: string;
  project_id: string;
  product_type: string | null;
  context_sources: unknown[];
  product_context: Record<string, unknown>;
  analytics: Record<string, unknown>;
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

function mapFeature(row: Record<string, unknown>): ProductFeatureRow {
  const rice = (row.rice ?? {}) as RiceScore;
  return {
    id: row.id as string,
    feature_code: row.feature_code as string,
    title: row.title as string,
    description: row.description as string,
    status: row.status as string,
    rice: {
      reach: rice.reach ?? 0,
      impact: rice.impact ?? 0,
      confidence: rice.confidence ?? 0,
      effort: rice.effort ?? 1,
      score: rice.score ?? 0,
    },
    horizon: row.horizon as ProductFeatureRow["horizon"],
    priority_rank: (row.priority_rank as number) ?? 100,
    linked_stakeholders: Array.isArray(row.linked_stakeholders)
      ? (row.linked_stakeholders as string[])
      : [],
  };
}

export async function getPmProductContext(
  projectId: string,
): Promise<PmProductContext | null> {
  const { supabase } = await getOrgContext();
  const { data } = await supabase
    .from("pm_product_context")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();
  return data as PmProductContext | null;
}

export async function upsertPmProductContext(input: {
  projectId: string;
  productType?: string;
  contextSources?: unknown[];
  productContext?: Record<string, unknown>;
  analytics?: Record<string, unknown>;
  extractionStatus?: string;
}): Promise<PmProductContext> {
  const { supabase, orgId } = await getOrgContext();
  const existing = await getPmProductContext(input.projectId);

  const payload = {
    product_type: input.productType ?? existing?.product_type,
    context_sources: input.contextSources ?? existing?.context_sources ?? [],
    product_context: input.productContext ?? existing?.product_context ?? {},
    analytics: input.analytics ?? existing?.analytics ?? {},
    extraction_status: input.extractionStatus ?? existing?.extraction_status ?? "pending",
  };

  if (existing) {
    const { data, error } = await supabase
      .from("pm_product_context")
      .update(payload)
      .eq("project_id", input.projectId)
      .select("*")
      .single();
    if (error) throw error;
    return data as PmProductContext;
  }

  const { data, error } = await supabase
    .from("pm_product_context")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      ...payload,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as PmProductContext;
}

export async function listProductFeatures(projectId: string): Promise<ProductFeatureRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("product_features")
    .select("*")
    .eq("project_id", projectId)
    .order("priority_rank", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapFeature);
}

export async function listCustomerInsights(projectId: string): Promise<CustomerInsightRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("customer_insights")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    theme: row.theme as string,
    insight_type: row.insight_type as string,
    content: row.content as string,
    sentiment: row.sentiment as string,
    priority: row.priority as string,
  }));
}

export async function listCustomerSegments(
  projectId?: string,
): Promise<CustomerSegmentRow[]> {
  const { supabase, orgId } = await getOrgContext();
  let query = supabase
    .from("customer_segments")
    .select("*")
    .eq("organisation_id", orgId)
    .order("revenue", { ascending: false });

  if (projectId) {
    query = query.or(`project_id.eq.${projectId},project_id.is.null`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    user_count: row.user_count as number,
    revenue: Number(row.revenue),
    notes: (row.notes as string | null) ?? null,
  }));
}

export async function bulkInsertFeatures(
  projectId: string,
  items: Array<{
    title: string;
    description: string;
    horizon: string;
    rice: RiceScore;
    linkedStakeholders?: string[];
    status?: string;
  }>,
  options?: { requireApproval?: boolean },
): Promise<{ count: number; ids: string[] }> {
  const { supabase, orgId } = await getOrgContext();
  const { count } = await supabase
    .from("product_features")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  let seq = (count ?? 0) + 1;
  const requireApproval = options?.requireApproval ?? false;
  const sorted = [...items].sort((a, b) => b.rice.score - a.rice.score);

  const rows = sorted.map((item, index) => ({
    organisation_id: orgId,
    project_id: projectId,
    feature_code: `FEAT-${String(seq++).padStart(3, "0")}`,
    title: item.title,
    description: item.description,
    status: item.status ?? "planned",
    rice: item.rice,
    horizon: item.horizon,
    priority_rank: index + 1,
    linked_stakeholders: item.linkedStakeholders ?? [],
    ai_generated: requireApproval,
    review_status: requireApproval ? "needs_review" : "draft",
  }));

  if (rows.length === 0) return { count: 0, ids: [] };
  const { data, error } = await supabase.from("product_features").insert(rows).select("id");
  if (error) throw error;
  return { count: rows.length, ids: (data ?? []).map((r) => r.id as string) };
}

export async function bulkInsertInsights(
  projectId: string,
  items: Array<{
    theme: string;
    type: string;
    content: string;
    sentiment: string;
    priority: string;
    source?: string;
  }>,
): Promise<number> {
  const { supabase, orgId } = await getOrgContext();
  const rows = items.map((item) => ({
    organisation_id: orgId,
    project_id: projectId,
    theme: item.theme,
    insight_type: item.type,
    content: item.content,
    sentiment: item.sentiment,
    priority: item.priority,
    source: item.source ?? "ai_extraction",
  }));
  if (rows.length === 0) return 0;
  const { error } = await supabase.from("customer_insights").insert(rows);
  if (error) throw error;
  return rows.length;
}

export async function bulkInsertSegments(
  projectId: string,
  items: Array<{ name: string; userCount: number; revenue: number; notes?: string }>,
): Promise<number> {
  const { supabase, orgId } = await getOrgContext();
  await supabase.from("customer_segments").delete().eq("project_id", projectId);

  const rows = items.map((item) => ({
    organisation_id: orgId,
    project_id: projectId,
    name: item.name,
    user_count: item.userCount,
    revenue: item.revenue,
    notes: item.notes ?? null,
  }));
  if (rows.length === 0) return 0;
  const { error } = await supabase.from("customer_segments").insert(rows);
  if (error) throw error;
  return rows.length;
}

export async function getProductStats(projectId: string) {
  const [features, insights, segments, context] = await Promise.all([
    listProductFeatures(projectId),
    listCustomerInsights(projectId),
    listCustomerSegments(projectId),
    getPmProductContext(projectId),
  ]);

  const now = features.filter((f) => f.horizon === "now");
  const next = features.filter((f) => f.horizon === "next");
  const later = features.filter((f) => f.horizon === "later");
  const shipped = features.filter((f) => f.status === "shipped");

  return { features, insights, segments, context, now, next, later, shipped };
}
