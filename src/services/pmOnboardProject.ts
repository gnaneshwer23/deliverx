/**
 * Ensures PM onboarding has a workspace project to attach business case upload.
 */

import { createClient } from "@/lib/supabase/server";
import { upsertGatewaySession } from "@/services/gatewayOnboarding";

export type EnsurePmProjectResult =
  | { ok: true; projectId: string }
  | { ok: false; error: string };

export async function ensurePmOnboardProject(
  userId: string,
  organisationId: string,
): Promise<EnsurePmProjectResult> {
  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("projects")
    .select("id")
    .eq("organisation_id", organisationId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    return { ok: false, error: existingError.message };
  }

  if (existing?.id) return { ok: true, projectId: String(existing.id) };

  const { data: org } = await supabase
    .from("organisations")
    .select("name")
    .eq("id", organisationId)
    .maybeSingle();

  const orgName = org?.name ?? "Team";
  const { data: created, error } = await supabase
    .from("projects")
    .insert({
      organisation_id: organisationId,
      created_by: userId,
      name: `${orgName} workspace`,
      status: "active",
      bootstrap_status: "skipped",
    })
    .select("id")
    .single();

  if (error || !created) {
    return {
      ok: false,
      error: error?.message ?? "Could not create your workspace project. Try again or contact support.",
    };
  }

  const projectId = String(created.id);

  try {
    await upsertGatewaySession({
      step: "project",
      draftProjectId: projectId,
    });
  } catch {
    /* gateway_sessions optional in some envs */
  }

  return { ok: true, projectId };
}
