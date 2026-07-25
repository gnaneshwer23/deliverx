/**
 * Observation consent — default OFF. No silent Workspace observation.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkspaceProjectRef } from "@/lib/professional-workspace/project-context";
import {
  WORKSPACE_OBSERVATION_CONSENT_COPY,
  type ObservationConsentRecord,
  type ObservationConsentScope,
} from "@/lib/workspace-observation/types";

function mapConsentRow(row: Record<string, unknown>): ObservationConsentRecord {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    scope: row.scope as ObservationConsentScope,
    projectKind: (row.project_kind as "org" | "experience" | null) ?? null,
    projectId: (row.project_id as string | null) ?? null,
    source: "workspace",
    consented: Boolean(row.consented),
    plainLanguageVersion: String(row.plain_language_version ?? WORKSPACE_OBSERVATION_CONSENT_COPY.version),
    consentedAt: (row.consented_at as string | null) ?? null,
    revokedAt: (row.revoked_at as string | null) ?? null,
  };
}

export async function getWorkspaceObservationConsent(
  supabase: SupabaseClient,
  userId: string,
  project?: Pick<WorkspaceProjectRef, "kind" | "id"> | null,
): Promise<{
  allowed: boolean;
  global: ObservationConsentRecord | null;
  project: ObservationConsentRecord | null;
  effective: ObservationConsentRecord | null;
}> {
  const { data: globalRow } = await supabase
    .from("pi_observation_consent")
    .select("*")
    .eq("user_id", userId)
    .eq("source", "workspace")
    .eq("scope", "global")
    .maybeSingle();

  let projectRow: Record<string, unknown> | null = null;
  if (project?.kind && project?.id) {
    const { data } = await supabase
      .from("pi_observation_consent")
      .select("*")
      .eq("user_id", userId)
      .eq("source", "workspace")
      .eq("scope", "project")
      .eq("project_kind", project.kind)
      .eq("project_id", project.id)
      .maybeSingle();
    projectRow = (data as Record<string, unknown> | null) ?? null;
  }

  const global = globalRow ? mapConsentRow(globalRow as Record<string, unknown>) : null;
  const projectConsent = projectRow ? mapConsentRow(projectRow) : null;

  // Project override wins when present; otherwise global. No row = not consented.
  const effective = projectConsent ?? global;
  const allowed = Boolean(effective?.consented);

  return { allowed, global, project: projectConsent, effective };
}

export async function setWorkspaceObservationConsent(
  supabase: SupabaseClient,
  input: {
    userId: string;
    consented: boolean;
    scope?: ObservationConsentScope;
    project?: Pick<WorkspaceProjectRef, "kind" | "id"> | null;
  },
): Promise<ObservationConsentRecord> {
  const scope: ObservationConsentScope =
    input.scope ?? (input.project ? "project" : "global");
  const now = new Date().toISOString();

  if (scope === "project" && (!input.project?.kind || !input.project?.id)) {
    throw new Error("project scope requires project kind and id");
  }

  const base = {
    user_id: input.userId,
    scope,
    source: "workspace" as const,
    project_kind: scope === "project" ? input.project!.kind : null,
    project_id: scope === "project" ? input.project!.id : null,
    consented: input.consented,
    plain_language_version: WORKSPACE_OBSERVATION_CONSENT_COPY.version,
    consented_at: input.consented ? now : null,
    revoked_at: input.consented ? null : now,
    updated_at: now,
  };

  // Upsert by unique partial indexes via select-then-insert/update
  let existingQuery = supabase
    .from("pi_observation_consent")
    .select("id")
    .eq("user_id", input.userId)
    .eq("source", "workspace")
    .eq("scope", scope);

  if (scope === "project") {
    existingQuery = existingQuery
      .eq("project_kind", input.project!.kind)
      .eq("project_id", input.project!.id);
  }

  const { data: existing } = await existingQuery.maybeSingle();

  if (existing?.id) {
    const { data, error } = await supabase
      .from("pi_observation_consent")
      .update(base)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return mapConsentRow(data as Record<string, unknown>);
  }

  const { data, error } = await supabase
    .from("pi_observation_consent")
    .insert(base)
    .select("*")
    .single();
  if (error) throw error;
  return mapConsentRow(data as Record<string, unknown>);
}

/** Pure helper for tests — no row means not allowed. */
export function isObservationAllowedFromConsent(input: {
  globalConsented?: boolean | null;
  projectConsented?: boolean | null;
  hasProjectOverride?: boolean;
}): boolean {
  if (input.hasProjectOverride) {
    return Boolean(input.projectConsented);
  }
  return Boolean(input.globalConsented);
}
