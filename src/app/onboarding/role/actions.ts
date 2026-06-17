"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type RoleState = { ok: boolean; error?: string };

const ALLOWED = new Set(["pm", "team_member", "executive", "ba"]);

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
    .update({ role: role as "pm" | "team_member" | "executive" | "ba" })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  redirect("/onboarding/invite");
}
