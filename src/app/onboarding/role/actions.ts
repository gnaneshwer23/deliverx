"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  completeGatewaySession,
  upsertGatewaySession,
} from "@/services/gatewayOnboarding";
import {
  getInitialGatewayStepForRole,
  getPostRoleSelectRedirect,
} from "@/services/gatewayOnboardingEngine";

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

  const { error } = await supabase
    .from("users")
    .update({ role: role as "pm" | "team_member" | "executive" | "ba" | "product_manager" | "engineer" | "scrum_master" | "qa" })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  try {
    const step = getInitialGatewayStepForRole(role);
    if (role === "team_member") {
      await upsertGatewaySession({ step: "complete", complete: true });
    } else {
      await upsertGatewaySession({ step });
    }
  } catch {
    /* optional until migration applied */
  }

  redirect(getPostRoleSelectRedirect(role));
}
