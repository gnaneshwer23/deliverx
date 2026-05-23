/**
 * Governance approval workflow — sponsor / steering sign-off.
 */

import { createClient } from "@/lib/supabase/server";

export type ApprovalLevel = "pm" | "sponsor" | "steering";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApprovalEntityType = "decision" | "change" | "risk";

export type GovernanceApprovalRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  entity_type: ApprovalEntityType;
  entity_id: string;
  approval_level: ApprovalLevel;
  status: ApprovalStatus;
  notes: string | null;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
};

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, role")
    .single();
  if (!profile?.organisation_id) throw new Error("No organisation");
  return {
    supabase,
    userId: user.id,
    orgId: profile.organisation_id as string,
    role: profile.role as string | null,
  };
}

export async function listPendingApprovals(limit = 50): Promise<
  (GovernanceApprovalRow & { project_name: string })[]
> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("governance_approvals")
    .select("*, projects!inner(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data ?? []).map((row) => {
    const r = row as GovernanceApprovalRow & { projects: { name: string } };
    return { ...r, project_name: r.projects.name };
  });
}

export async function requestApproval(input: {
  projectId: string;
  entityType: ApprovalEntityType;
  entityId: string;
  approvalLevel?: ApprovalLevel;
  notes?: string;
}): Promise<GovernanceApprovalRow> {
  const { supabase, orgId, userId } = await getOrgContext();

  const { data, error } = await supabase
    .from("governance_approvals")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      entity_type: input.entityType,
      entity_id: input.entityId,
      approval_level: input.approvalLevel ?? "steering",
      notes: input.notes?.trim() || null,
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as GovernanceApprovalRow;
}

export async function resolveApproval(
  id: string,
  status: "approved" | "rejected",
  notes?: string,
): Promise<GovernanceApprovalRow> {
  const { supabase, userId, role } = await getOrgContext();

  if (role !== "executive" && role !== "pm") {
    throw new Error("Only PMs and executives can resolve steering approvals.");
  }

  const { data, error } = await supabase
    .from("governance_approvals")
    .update({
      status,
      notes: notes?.trim() || null,
      decided_by: userId,
      decided_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as GovernanceApprovalRow;
}
