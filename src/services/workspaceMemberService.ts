/**
 * Workspace members — project-scoped membership created on invite accept.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { resolveRoleHomePath } from "@/config/role-home-routing";
import {
  validateInviteToken,
  type InviteViewMode,
} from "@/services/inviteTokenService";

export type WorkspaceMemberRow = {
  id: string;
  organisation_id: string;
  user_id: string;
  project_id: string;
  role: string;
  view_mode: InviteViewMode;
  invited_by: string | null;
  joined_at: string;
};

export type AcceptInviteResult = {
  member: WorkspaceMemberRow;
  redirectPath: string;
  projectId: string;
  projectName: string;
  role: string;
  viewMode: InviteViewMode;
};

export async function createWorkspaceMember(input: {
  userId: string;
  projectId: string;
  organisationId: string;
  role: string;
  viewMode: InviteViewMode;
  invitedBy: string | null;
}): Promise<WorkspaceMemberRow> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("workspace_members")
    .upsert(
      {
        user_id: input.userId,
        project_id: input.projectId,
        organisation_id: input.organisationId,
        role: input.role,
        view_mode: input.viewMode,
        invited_by: input.invitedBy,
      },
      { onConflict: "user_id,project_id" },
    )
    .select(
      "id, organisation_id, user_id, project_id, role, view_mode, invited_by, joined_at",
    )
    .single();

  if (error || !data) throw error ?? new Error("Failed to create workspace membership.");
  return data as WorkspaceMemberRow;
}

export async function acceptInviteToken(token: string): Promise<AcceptInviteResult> {
  const validation = await validateInviteToken(token);
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const admin = createAdminClient();
  const { data: inviteRow, error: inviteError } = await admin
    .from("invite_tokens")
    .select("organisation_id, invited_by")
    .eq("id", validation.inviteId)
    .single();

  if (inviteError || !inviteRow) throw new Error("Invite not found.");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profile?.organisation_id &&
    profile.organisation_id !== inviteRow.organisation_id
  ) {
    throw new Error("You already belong to another organisation.");
  }

  const { error: userError } = await admin
    .from("users")
    .update({
      organisation_id: inviteRow.organisation_id,
      role: validation.role,
    })
    .eq("id", user.id);

  if (userError) throw userError;

  const member = await createWorkspaceMember({
    userId: user.id,
    projectId: validation.projectId,
    organisationId: inviteRow.organisation_id as string,
    role: validation.role,
    viewMode: validation.viewMode,
    invitedBy: (inviteRow.invited_by as string | null) ?? null,
  });

  return {
    member,
    redirectPath: resolveRoleHomePath(validation.role),
    projectId: validation.projectId,
    projectName: validation.projectName,
    role: validation.role,
    viewMode: validation.viewMode,
  };
}

export type ProjectWorkspaceMember = WorkspaceMemberRow & {
  user_name: string | null;
  user_email: string | null;
};

export async function listProjectWorkspaceMembersByRole(
  projectId: string,
  role: string,
): Promise<ProjectWorkspaceMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("id, organisation_id, user_id, project_id, role, view_mode, invited_by, joined_at, users(name, email)")
    .eq("project_id", projectId)
    .eq("role", role)
    .order("joined_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const usersRaw = row.users as
      | { name: string | null; email: string | null }
      | { name: string | null; email: string | null }[]
      | null;
    const users = Array.isArray(usersRaw) ? usersRaw[0] ?? null : usersRaw;
    return {
      id: row.id as string,
      organisation_id: row.organisation_id as string,
      user_id: row.user_id as string,
      project_id: row.project_id as string,
      role: row.role as string,
      view_mode: row.view_mode as InviteViewMode,
      invited_by: row.invited_by as string | null,
      joined_at: row.joined_at as string,
      user_name: users?.name ?? null,
      user_email: users?.email ?? null,
    };
  });
}

export async function getWorkspaceMember(
  userId: string,
  projectId: string,
): Promise<WorkspaceMemberRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select(
      "id, organisation_id, user_id, project_id, role, view_mode, invited_by, joined_at",
    )
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  return (data as WorkspaceMemberRow | null) ?? null;
}
