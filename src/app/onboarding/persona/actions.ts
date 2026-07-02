"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { usesPersonaOnboarding } from "@/config/persona-onboarding";
import { completeGatewaySession, upsertGatewaySession } from "@/services/gatewayOnboarding";
import { ensurePmOnboardProject } from "@/services/pmOnboardProject";

export type PersonaState = { ok: boolean; error?: string };

export async function completePersonaOnboardingAction(
  prev: PersonaState,
  formData: FormData,
): Promise<PersonaState> {
  void prev;
  void formData;
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

  const projectId = await ensurePmOnboardProject(user.id, profile.organisation_id);

  try {
    if (projectId.ok) {
      await upsertGatewaySession({
        step: "complete",
        draftProjectId: projectId.projectId,
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
