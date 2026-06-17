/**
 * Invitations — org invite + accept flow.
 */

import { createClient } from "@/lib/supabase/server";
import { buildInviteUrl } from "@/lib/invite-url";

export { buildInviteUrl };

export type InvitationRow = {
  id: string;
  email: string;
  role: "pm" | "team_member" | "executive" | "ba";
  status: "pending" | "accepted" | "expired" | "revoked";
  token: string;
  created_at: string;
  expires_at: string;
};

export type InvitationPreview = {
  id: string;
  email: string;
  role: InvitationRow["role"];
  status: InvitationRow["status"];
  organisationName: string;
  expires_at: string;
};

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, role, organisations(name)")
    .single();

  if (!profile?.organisation_id) throw new Error("No organisation");

  return {
    supabase,
    userId: user.id,
    orgId: profile.organisation_id as string,
    userRole: profile.role as InvitationRow["role"] | null,
  };
}

export async function listPendingInvitations(): Promise<InvitationRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("invitations")
    .select("id, email, role, status, token, created_at, expires_at")
    .eq("status", "pending")
    .not("email", "is", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as InvitationRow[];
}

export async function createInvitation(input: {
  email: string;
  role: InvitationRow["role"];
}): Promise<{ invitation: InvitationRow; inviteUrl: string }> {
  const { supabase, userId, orgId, userRole } = await getOrgContext();

  if (userRole !== "pm" && userRole !== "executive") {
    throw new Error("Only PMs and executives can send invitations.");
  }

  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  const { data: existing } = await supabase
    .from("invitations")
    .select("id")
    .eq("organisation_id", orgId)
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    throw new Error("A pending invitation already exists for this email.");
  }

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      email,
      role: input.role,
      organisation_id: orgId,
      invited_by: userId,
      status: "pending",
    })
    .select("id, email, role, status, token, created_at, expires_at")
    .single();

  if (error) throw error;
  const invitation = data as InvitationRow;
  return { invitation, inviteUrl: buildInviteUrl(invitation.token) };
}

export async function revokeInvitation(id: string) {
  const { supabase } = await getOrgContext();
  const { error } = await supabase
    .from("invitations")
    .update({ status: "revoked" })
    .eq("id", id);
  if (error) throw error;
}

export async function getInvitationByToken(
  token: string,
): Promise<InvitationPreview | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("invitations")
    .select("id, email, role, status, expires_at, organisations(name)")
    .eq("token", token)
    .single();

  if (error || !data) return null;

  if (user.email && data.email.toLowerCase() !== user.email.toLowerCase()) {
    throw new Error("This invitation was sent to a different email address.");
  }

  return {
    id: data.id as string,
    email: data.email as string,
    role: data.role as InvitationRow["role"],
    status: data.status as InvitationRow["status"],
    organisationName:
      (data.organisations as { name?: string } | null)?.name ?? "Organisation",
    expires_at: data.expires_at as string,
  };
}

export async function acceptInvitation(token: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("id, email, role, status, organisation_id, expires_at")
    .eq("token", token)
    .single();

  if (error || !invitation) throw new Error("Invitation not found.");

  if (invitation.status !== "pending") {
    throw new Error(`Invitation is ${invitation.status}.`);
  }

  if (new Date(invitation.expires_at as string) < new Date()) {
    await supabase
      .from("invitations")
      .update({ status: "expired" })
      .eq("id", invitation.id);
    throw new Error("This invitation has expired.");
  }

  if (
    user.email &&
    (invitation.email as string).toLowerCase() !== user.email.toLowerCase()
  ) {
    throw new Error("Sign in with the email address that received this invite.");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .single();

  if (
    profile?.organisation_id &&
    profile.organisation_id !== invitation.organisation_id
  ) {
    throw new Error("You already belong to another organisation.");
  }

  const { error: userError } = await supabase
    .from("users")
    .update({
      organisation_id: invitation.organisation_id,
      role: invitation.role,
    })
    .eq("id", user.id);

  if (userError) throw userError;

  const { error: invError } = await supabase
    .from("invitations")
    .update({ status: "accepted" })
    .eq("id", invitation.id);

  if (invError) throw invError;

  return { organisationId: invitation.organisation_id as string };
}
