/**
 * Estimation packs — role-native duration breakdowns with approval workflow.
 */

import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";
import {
  normalizeLineItems,
  sumLineItemDays,
  type EstimationLineItem,
  type EstimationPackRole,
  type EstimationPackStatus,
} from "./estimationEngine";

export type EstimationPackRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  role: EstimationPackRole;
  line_items: EstimationLineItem[];
  total_days: number;
  confidence: number;
  rationale: string;
  status: EstimationPackStatus;
  reviewer_notes: string | null;
  decided_by: string | null;
  decided_at: string | null;
  created_by: string | null;
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
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.organisation_id) throw new Error("No organisation");
  return {
    supabase,
    userId: user.id,
    orgId: profile.organisation_id as string,
  };
}

function mapRow(row: Record<string, unknown>): EstimationPackRow {
  const lineItems = normalizeLineItems(row.line_items);
  return {
    id: String(row.id),
    organisation_id: String(row.organisation_id),
    project_id: String(row.project_id),
    role: row.role as EstimationPackRole,
    line_items: lineItems,
    total_days: Number(row.total_days ?? sumLineItemDays(lineItems)),
    confidence: Number(row.confidence ?? 70),
    rationale: String(row.rationale ?? ""),
    status: row.status as EstimationPackStatus,
    reviewer_notes: row.reviewer_notes ? String(row.reviewer_notes) : null,
    decided_by: row.decided_by ? String(row.decided_by) : null,
    decided_at: row.decided_at ? String(row.decided_at) : null,
    created_by: row.created_by ? String(row.created_by) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function listEstimationPacks(
  projectId: string,
): Promise<EstimationPackRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("estimation_packs")
    .select("*")
    .eq("project_id", projectId)
    .order("role", { ascending: true });

  if (error) {
    throwIfMissingTable(error, "estimation_packs");
    throw error;
  }

  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function upsertEstimationPack(input: {
  projectId: string;
  role: EstimationPackRole;
  lineItems: EstimationLineItem[];
  confidence: number;
  rationale: string;
  status?: EstimationPackStatus;
}): Promise<EstimationPackRow> {
  const { supabase, orgId, userId } = await getOrgContext();
  const totalDays = sumLineItemDays(input.lineItems);

  const { data, error } = await supabase
    .from("estimation_packs")
    .upsert(
      {
        organisation_id: orgId,
        project_id: input.projectId,
        role: input.role,
        line_items: input.lineItems,
        total_days: totalDays,
        confidence: input.confidence,
        rationale: input.rationale.trim(),
        status: input.status ?? "draft",
        created_by: userId,
      },
      { onConflict: "project_id,role" },
    )
    .select("*")
    .single();

  if (error) {
    throwIfMissingTable(error, "estimation_packs");
    throw error;
  }

  return mapRow(data as Record<string, unknown>);
}

export async function submitEstimationPack(id: string): Promise<EstimationPackRow> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("estimation_packs")
    .update({ status: "pending", reviewer_notes: null })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

export async function resolveEstimationPack(
  id: string,
  status: "approved" | "rejected",
  reviewerNotes?: string,
): Promise<EstimationPackRow> {
  const { supabase, userId } = await getOrgContext();
  const { data, error } = await supabase
    .from("estimation_packs")
    .update({
      status,
      reviewer_notes: reviewerNotes?.trim() || null,
      decided_by: userId,
      decided_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

export async function updateEstimationPackItems(
  id: string,
  lineItems: EstimationLineItem[],
  confidence?: number,
  rationale?: string,
): Promise<EstimationPackRow> {
  const { supabase } = await getOrgContext();
  const patch: Record<string, unknown> = {
    line_items: lineItems,
    total_days: sumLineItemDays(lineItems),
    status: "pending",
    reviewer_notes: null,
    decided_by: null,
    decided_at: null,
  };
  if (confidence != null) patch.confidence = confidence;
  if (rationale != null) patch.rationale = rationale.trim();

  const { data, error } = await supabase
    .from("estimation_packs")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

export function approvedEstimationSummary(
  packs: EstimationPackRow[],
): { totalDays: number; avgConfidence: number | null } {
  const approved = packs.filter((p) => p.status === "approved");
  if (approved.length === 0) {
    return { totalDays: 0, avgConfidence: null };
  }
  const totalDays = approved.reduce((sum, p) => sum + p.total_days, 0);
  const avgConfidence = Math.round(
    approved.reduce((sum, p) => sum + p.confidence, 0) / approved.length,
  );
  return { totalDays, avgConfidence };
}
