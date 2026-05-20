"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { ok: boolean; error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: error.message };
  }

  // Decide destination: if the user has no organisation yet, send to onboarding.
  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .single();

  const dest = profile?.organisation_id ? "/workspace/dashboard" : "/onboarding/organisation";
  redirect(dest);
}
