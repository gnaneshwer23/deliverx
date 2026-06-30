/**
 * Invite tokens — signed JWT links with hashed storage, validate, revoke.
 */

import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildJoinUrl } from "@/lib/invite-url";
import type { PersonaHomeRole } from "@/config/role-home-routing";

export type InviteViewMode = "full" | "read_only";

export type InviteTokenRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  role: PersonaHomeRole | "team_member";
  invited_by: string | null;
  token_hash: string;
  view_mode: InviteViewMode;
  expires_at: string;
  created_at: string;
  revoked_at: string | null;
};

export type InviteJwtPayload = {
  invite_id: string;
  project_id: string;
  project_name: string;
  role: string;
  invited_by: string;
  invited_by_name: string;
  view_mode: InviteViewMode;
  expires_at: string;
};

export type InviteValidationResult =
  | {
      ok: true;
      inviteId: string;
      projectId: string;
      projectName: string;
      role: string;
      invitedByName: string;
      viewMode: InviteViewMode;
      expiresAt: string;
    }
  | {
      ok: false;
      reason: "invalid" | "expired" | "revoked" | "missing";
      message: string;
    };

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function base64UrlEncode(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function getInviteJwtSecret(): string {
  const secret =
    process.env.INVITE_JWT_SECRET ??
    process.env.CRON_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("INVITE_JWT_SECRET is required for invite links.");
  }
  return secret;
}

export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function signInviteJwt(payload: InviteJwtPayload): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const signature = createHmac("sha256", getInviteJwtSecret()).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifyInviteJwt(token: string): InviteJwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  const data = `${headerB64}.${payloadB64}`;
  const expected = createHmac("sha256", getInviteJwtSecret()).update(data).digest("base64url");

  try {
    const a = Buffer.from(signatureB64);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as InviteJwtPayload;
    if (!payload.invite_id || !payload.project_id || !payload.expires_at) return null;
    return payload;
  } catch {
    return null;
  }
}

function isJwtExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

async function getInviteAuthorContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, name, role, organisation_id")
    .eq("id", user.id)
    .single();

  if (error || !profile?.organisation_id) throw new Error("No organisation");
  if (profile.role !== "pm" && profile.role !== "executive") {
    throw new Error("Only Project Managers and Sponsors can generate invite links.");
  }

  return {
    supabase,
    userId: user.id,
    userName: (profile.name as string | null) ?? user.email ?? "Project Manager",
    orgId: profile.organisation_id as string,
  };
}

export async function generateInviteToken(input: {
  projectId: string;
  role: PersonaHomeRole | "team_member";
  viewMode?: InviteViewMode;
}): Promise<{
  token: string;
  joinUrl: string;
  invite: InviteTokenRow;
}> {
  const { supabase, userId, userName, orgId } = await getInviteAuthorContext();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, organisation_id")
    .eq("id", input.projectId)
    .single();

  if (projectError || !project) throw new Error("Project not found.");
  if (project.organisation_id !== orgId) throw new Error("Project not found.");

  const viewMode =
    input.viewMode ?? (input.role === "executive" ? "read_only" : "full");
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();
  const placeholderHash = hashInviteToken(randomUUID());

  const { data: inserted, error: insertError } = await supabase
    .from("invite_tokens")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      role: input.role,
      invited_by: userId,
      token_hash: placeholderHash,
      view_mode: viewMode,
      expires_at: expiresAt,
    })
    .select(
      "id, organisation_id, project_id, role, invited_by, token_hash, view_mode, expires_at, created_at, revoked_at",
    )
    .single();

  if (insertError || !inserted) throw insertError ?? new Error("Failed to create invite.");

  const jwtPayload: InviteJwtPayload = {
    invite_id: inserted.id as string,
    project_id: project.id as string,
    project_name: project.name as string,
    role: input.role,
    invited_by: userId,
    invited_by_name: userName,
    view_mode: viewMode,
    expires_at: expiresAt,
  };

  const token = signInviteJwt(jwtPayload);
  const tokenHash = hashInviteToken(token);

  const { data: invite, error: updateError } = await supabase
    .from("invite_tokens")
    .update({ token_hash: tokenHash })
    .eq("id", inserted.id)
    .select(
      "id, organisation_id, project_id, role, invited_by, token_hash, view_mode, expires_at, created_at, revoked_at",
    )
    .single();

  if (updateError || !invite) throw updateError ?? new Error("Failed to finalize invite.");

  return {
    token,
    joinUrl: buildJoinUrl(token, viewMode === "read_only" ? "sponsor" : undefined),
    invite: invite as InviteTokenRow,
  };
}

export async function validateInviteToken(token: string): Promise<InviteValidationResult> {
  const payload = verifyInviteJwt(token);
  if (!payload) {
    return { ok: false, reason: "invalid", message: "This invite link is not valid." };
  }

  if (isJwtExpired(payload.expires_at)) {
    return {
      ok: false,
      reason: "expired",
      message: "This invite has expired — ask your Project Manager for a new one.",
    };
  }

  const admin = createAdminClient();
  const tokenHash = hashInviteToken(token);
  const { data: row, error } = await admin
    .from("invite_tokens")
    .select("id, revoked_at, expires_at, view_mode")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !row) {
    return { ok: false, reason: "missing", message: "This invite link is not valid." };
  }

  if (row.revoked_at) {
    return {
      ok: false,
      reason: "revoked",
      message: "This invite link has been revoked — ask your Project Manager for a new one.",
    };
  }

  if (isJwtExpired(row.expires_at as string)) {
    return {
      ok: false,
      reason: "expired",
      message: "This invite has expired — ask your Project Manager for a new one.",
    };
  }

  return {
    ok: true,
    inviteId: row.id as string,
    projectId: payload.project_id,
    projectName: payload.project_name,
    role: payload.role,
    invitedByName: payload.invited_by_name,
    viewMode: (row.view_mode as InviteViewMode) ?? payload.view_mode,
    expiresAt: payload.expires_at,
  };
}

export async function revokeInviteToken(id: string): Promise<void> {
  const { supabase } = await getInviteAuthorContext();
  const { error } = await supabase
    .from("invite_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .is("revoked_at", null);

  if (error) throw error;
}

export async function listProjectInviteTokens(projectId: string): Promise<InviteTokenRow[]> {
  const { supabase } = await getInviteAuthorContext();
  const { data, error } = await supabase
    .from("invite_tokens")
    .select(
      "id, organisation_id, project_id, role, invited_by, token_hash, view_mode, expires_at, created_at, revoked_at",
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as InviteTokenRow[];
}

export type ActiveInviteLink = {
  inviteId: string;
  role: string;
  joinUrl: string;
  expiresAt: string;
  viewMode: InviteViewMode;
};

/** Reconstruct a stable JWT join URL from persisted invite row metadata. */
export async function buildJoinUrlFromInviteRow(row: {
  id: string;
  project_id: string;
  role: string;
  invited_by: string | null;
  view_mode: InviteViewMode;
  expires_at: string;
  projects?: { name: string } | { name: string }[] | null;
  users?: { name: string | null } | { name: string | null }[] | null;
}): Promise<string> {
  const projectRaw = row.projects;
  const project = Array.isArray(projectRaw) ? projectRaw[0] : projectRaw;
  const userRaw = row.users;
  const inviter = Array.isArray(userRaw) ? userRaw[0] : userRaw;

  const payload: InviteJwtPayload = {
    invite_id: row.id,
    project_id: row.project_id,
    project_name: project?.name ?? "Project workspace",
    role: row.role,
    invited_by: row.invited_by ?? "",
    invited_by_name: inviter?.name ?? "Project Manager",
    view_mode: row.view_mode,
    expires_at: row.expires_at,
  };

  const token = signInviteJwt(payload);
  return buildJoinUrl(token, row.view_mode === "read_only" ? "sponsor" : undefined);
}

export async function listActiveProjectInviteLinks(
  projectId: string,
): Promise<ActiveInviteLink[]> {
  const { supabase } = await getInviteAuthorContext();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("invite_tokens")
    .select("id, project_id, role, invited_by, view_mode, expires_at, revoked_at")
    .eq("project_id", projectId)
    .is("revoked_at", null)
    .gt("expires_at", now)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data?.length) return [];

  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .maybeSingle();

  const inviterIds = [
    ...new Set(
      data
        .map((row) => row.invited_by as string | null)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const inviterNames = new Map<string, string>();
  if (inviterIds.length > 0) {
    const { data: inviters } = await supabase
      .from("users")
      .select("id, name")
      .in("id", inviterIds);
    for (const inviter of inviters ?? []) {
      inviterNames.set(
        inviter.id as string,
        (inviter.name as string | null) ?? "Project Manager",
      );
    }
  }

  const byRole = new Map<string, ActiveInviteLink>();
  for (const row of data) {
    const role = row.role as string;
    if (byRole.has(role)) continue;
    const invitedBy = row.invited_by as string | null;
    const joinUrl = await buildJoinUrlFromInviteRow({
      id: row.id as string,
      project_id: row.project_id as string,
      role,
      invited_by: invitedBy,
      view_mode: row.view_mode as InviteViewMode,
      expires_at: row.expires_at as string,
      projects: project ? { name: project.name as string } : null,
      users: invitedBy ? { name: inviterNames.get(invitedBy) ?? null } : null,
    });
    byRole.set(role, {
      inviteId: row.id as string,
      role,
      joinUrl,
      expiresAt: row.expires_at as string,
      viewMode: row.view_mode as InviteViewMode,
    });
  }

  return [...byRole.values()];
}
