"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { usesPersonaOnboarding } from "@/config/persona-onboarding";
import { completeGatewaySession, upsertGatewaySession } from "@/services/gatewayOnboarding";

export type PersonaState = { ok: boolean; error?: string };

async function ensureOrgProject(userId: string, organisationId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("organisation_id", organisationId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing?.id) return String(existing.id);

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

  if (error || !created) return null;
  return String(created.id);
}

export async function completePersonaOnboardingAction(
  _prev: PersonaState,
  _formData: FormData,
): Promise<PersonaState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organisation_id || !profile.role) {
    return { ok: false, error: "Complete account setup first." };
  }

  if (!usesPersonaOnboarding(profile.role)) {
    return { ok: false, error: "This onboarding path is not available for your role." };
  }

  const projectId = await ensureOrgProject(user.id, profile.organisation_id);

  try {
    if (projectId) {
      await upsertGatewaySession({
        step: "complete",
        draftProjectId: projectId,
        complete: true,
      });
    } else {
      await completeGatewaySession();
    }
  } catch {
    /* optional until migration applied */
  }

  redirect("/onboarding/complete");
}
