"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { upsertGatewaySession } from "@/services/gatewayOnboarding";
import {
  buildPmOnboardMissionPath,
  getInitialGatewayStepForRole,
  getPostRoleSelectRedirect,
} from "@/services/gatewayOnboardingEngine";
import { ensurePmOnboardProject } from "@/services/pmOnboardProject";

export type RoleState = { ok: boolean; error?: string };

const ALLOWED = new Set(["pm", "team_member", "executive", "ba", "product_manager", "engineer", "scrum_master", "qa"]);

export async function setRoleAction(
  _prev: RoleState,
  formData: FormData,
): Promise<RoleState> {
  const role = String(formData.get("role") ?? "");
  if (!ALLOWED.has(role)) {
    return { ok: false, error: "Please select a role." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.organisation_id) {
    redirect("/onboarding/organisation");
  }

  const { error } = await supabase
    .from("users")
    .update({ role: role as "pm" | "team_member" | "executive" | "ba" | "product_manager" | "engineer" | "scrum_master" | "qa" })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  const step = getInitialGatewayStepForRole(role);
  let pmProjectId: string | null = null;
  let pmProjectError: string | null = null;

  if (role === "pm") {
    const ensured = await ensurePmOnboardProject(user.id, profile.organisation_id);
    if (ensured.ok) {
      pmProjectId = ensured.projectId;
    } else {
      pmProjectError = ensured.error;
    }
  }

  try {
    if (role === "team_member") {
      await upsertGatewaySession({ step: "complete", complete: true });
    } else if (role === "pm") {
      await upsertGatewaySession({
        step,
        draftProjectId: pmProjectId,
      });
    } else {
      await upsertGatewaySession({ step });
    }
  } catch (gatewayError) {
    if (role === "pm" && pmProjectError) {
      redirect(buildPmOnboardMissionPath(null, pmProjectError));
    }
    console.error("[setRoleAction] gateway session update failed:", gatewayError);
  }

  if (role === "pm") {
    redirect(buildPmOnboardMissionPath(pmProjectId, pmProjectError));
  }

  redirect(getPostRoleSelectRedirect(role));
}
