import type { SupabaseClient } from "@supabase/supabase-js";
import { isOrgAdmin } from "@/lib/org-admin";
import { isPilotAdminEnabled } from "@/lib/pilot-admin/flag";
import {
  PILOT_ADMIN_INVARIANTS,
  PilotAdminValidationError,
  normalizeOrgConfigPatch,
  normalizeProjectConfigPatch,
  type OrgConfigPatch,
  type OrgConfigSnapshot,
  type ProjectConfigPatch,
  type ProjectConfigSnapshot,
} from "@/lib/pilot-admin/types";

type Db = SupabaseClient;

export type PilotAdminActor = {
  userId: string;
  organisationId: string;
  role: string | null;
};

export class PilotAdminError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = "PilotAdminError";
  }
}

export function assertPilotAdminGate(
  actor: PilotAdminActor,
  env: Parameters<typeof isPilotAdminEnabled>[0] = process.env,
): void {
  if (!isPilotAdminEnabled(env)) {
    throw new PilotAdminError("Pilot admin is disabled", 404);
  }
  if (!isOrgAdmin(actor.role)) {
    throw new PilotAdminError("Organisation admin access required", 403);
  }
}

/** Explicit export for tests — config mutations never touch these rails. */
export function pilotAdminTrustRails() {
  return { ...PILOT_ADMIN_INVARIANTS };
}

export async function resolvePilotAdminActor(
  supabase: Db,
  userId: string,
): Promise<PilotAdminActor | null> {
  const { data, error } = await supabase
    .from("users")
    .select("organisation_id, role")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data?.organisation_id) return null;
  return {
    userId,
    organisationId: data.organisation_id as string,
    role: (data.role as string | null) ?? null,
  };
}

export function mapOrgConfig(row: Record<string, unknown>): OrgConfigSnapshot {
  return {
    id: String(row.id),
    name: String(row.name),
    industry: (row.industry as string | null) ?? null,
    teamSize: (row.team_size as string | null) ?? null,
    deliveryType: (row.delivery_type as string | null) ?? null,
  };
}

export function mapProjectConfig(row: Record<string, unknown>): ProjectConfigSnapshot {
  return {
    id: String(row.id),
    organisationId: String(row.organisation_id),
    name: String(row.name),
    goal: (row.goal as string | null) ?? null,
    deliveryType: (row.delivery_type as string | null) ?? null,
    status: row.status as ProjectConfigSnapshot["status"],
    updatedAt: String(row.updated_at),
  };
}

export async function loadOrgConfig(
  supabase: Db,
  organisationId: string,
): Promise<OrgConfigSnapshot | null> {
  const { data, error } = await supabase
    .from("organisations")
    .select("id, name, industry, team_size, delivery_type")
    .eq("id", organisationId)
    .maybeSingle();
  if (error) throw new PilotAdminError(error.message, 500);
  if (!data) return null;
  return mapOrgConfig(data as Record<string, unknown>);
}

export async function listOrgProjectConfigs(
  supabase: Db,
  organisationId: string,
): Promise<ProjectConfigSnapshot[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, organisation_id, name, goal, delivery_type, status, updated_at")
    .eq("organisation_id", organisationId)
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw new PilotAdminError(error.message, 500);
  return (data ?? []).map((row) => mapProjectConfig(row as Record<string, unknown>));
}

export type ConfigAuditWriter = (input: {
  projectId?: string | null;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
}) => Promise<void>;

async function defaultAuditWriter(
  supabase: Db,
  actor: PilotAdminActor,
  input: {
    projectId?: string | null;
    entityType: string;
    entityId: string;
    metadata: Record<string, unknown>;
  },
): Promise<void> {
  const { error } = await supabase.from("audit_events").insert({
    organisation_id: actor.organisationId,
    project_id: input.projectId ?? null,
    actor_id: actor.userId,
    event_type: "updated",
    entity_type: input.entityType,
    entity_id: input.entityId,
    metadata: {
      ...input.metadata,
      source: "pilot_admin",
      writesEvidence: false,
      writesScoreRuns: false,
      lightsVerified: false,
    },
  });
  // Table may be absent in some local fixtures — ignore undefined relation.
  if (error && error.code !== "42P01") {
    throw new PilotAdminError(error.message, 500);
  }
}

export async function updateOrgConfig(
  supabase: Db,
  actor: PilotAdminActor,
  raw: {
    name?: unknown;
    industry?: unknown;
    teamSize?: unknown;
    deliveryType?: unknown;
  },
  options?: { audit?: ConfigAuditWriter; env?: Parameters<typeof isPilotAdminEnabled>[0] },
): Promise<OrgConfigSnapshot> {
  assertPilotAdminGate(actor, options?.env);
  let patch: OrgConfigPatch;
  try {
    patch = normalizeOrgConfigPatch(raw);
  } catch (error) {
    if (error instanceof PilotAdminValidationError) {
      throw new PilotAdminError(error.message, 400);
    }
    throw error;
  }
  if (Object.keys(patch).length === 0) {
    throw new PilotAdminError("No organisation fields to update", 400);
  }

  const before = await loadOrgConfig(supabase, actor.organisationId);
  if (!before) throw new PilotAdminError("Organisation not found", 404);

  const { data, error } = await supabase
    .from("organisations")
    .update({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.industry !== undefined ? { industry: patch.industry } : {}),
      ...(patch.teamSize !== undefined ? { team_size: patch.teamSize } : {}),
      ...(patch.deliveryType !== undefined ? { delivery_type: patch.deliveryType } : {}),
    })
    .eq("id", actor.organisationId)
    .select("id, name, industry, team_size, delivery_type")
    .maybeSingle();

  if (error) {
    throw new PilotAdminError(error.message, 400);
  }
  if (!data) {
    // Usually RLS: only creator could update before 0100; org-admin policy required.
    throw new PilotAdminError(
      "Organisation update blocked by access policy (org admin required)",
      403,
    );
  }

  const after = mapOrgConfig(data as Record<string, unknown>);
  const writeAudit = options?.audit ?? ((input) => defaultAuditWriter(supabase, actor, input));
  await writeAudit({
    entityType: "organisation",
    entityId: after.id,
    metadata: {
      action: "org_config_update",
      before,
      after,
      note: "Pilot admin org config — not evidence rewrite",
    },
  });

  return after;
}

export async function updateProjectConfig(
  supabase: Db,
  actor: PilotAdminActor,
  projectId: string,
  raw: {
    name?: unknown;
    goal?: unknown;
    deliveryType?: unknown;
    status?: unknown;
  },
  options?: { audit?: ConfigAuditWriter; env?: Parameters<typeof isPilotAdminEnabled>[0] },
): Promise<ProjectConfigSnapshot> {
  assertPilotAdminGate(actor, options?.env);
  if (!projectId) throw new PilotAdminError("projectId required", 400);

  let patch: ProjectConfigPatch;
  try {
    patch = normalizeProjectConfigPatch(raw);
  } catch (error) {
    if (error instanceof PilotAdminValidationError) {
      throw new PilotAdminError(error.message, 400);
    }
    throw error;
  }
  if (Object.keys(patch).length === 0) {
    throw new PilotAdminError("No project fields to update", 400);
  }

  const { data: existing, error: loadError } = await supabase
    .from("projects")
    .select("id, organisation_id, name, goal, delivery_type, status, updated_at")
    .eq("id", projectId)
    .eq("organisation_id", actor.organisationId)
    .maybeSingle();

  if (loadError) throw new PilotAdminError(loadError.message, 500);
  if (!existing) throw new PilotAdminError("Project not found in this organisation", 404);

  const before = mapProjectConfig(existing as Record<string, unknown>);

  const { data, error } = await supabase
    .from("projects")
    .update({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.goal !== undefined ? { goal: patch.goal } : {}),
      ...(patch.deliveryType !== undefined ? { delivery_type: patch.deliveryType } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
    })
    .eq("id", projectId)
    .eq("organisation_id", actor.organisationId)
    .select("id, organisation_id, name, goal, delivery_type, status, updated_at")
    .single();

  if (error || !data) {
    throw new PilotAdminError(error?.message ?? "Could not update project", 400);
  }

  const after = mapProjectConfig(data as Record<string, unknown>);
  const writeAudit = options?.audit ?? ((input) => defaultAuditWriter(supabase, actor, input));
  await writeAudit({
    projectId: after.id,
    entityType: "project",
    entityId: after.id,
    metadata: {
      action: "project_config_update",
      before,
      after,
      note: "Pilot admin project config — not evidence rewrite",
    },
  });

  return after;
}
