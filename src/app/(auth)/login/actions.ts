"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatAuthError } from "@/lib/auth-errors";
import { findSsoForEmail } from "@/services/orgSso";

export type LoginState = { ok: boolean; error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim();

  if (!email) {
    return { ok: false, error: "Email is required." };
  }

  const ssoMatch = await findSsoForEmail(email).catch(() => null);
  if (ssoMatch?.ssoRequired) {
    return {
      ok: false,
      error: "Password sign-in is disabled for your domain. Use SSO instead.",
    };
  }

  if (!password) {
    return { ok: false, error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: formatAuthError(error.message) };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .single();

  const dest =
    next.startsWith("/") && !next.startsWith("//")
      ? next
      : profile?.organisation_id
        ? "/workspace/dashboard"
        : "/onboarding/organisation";

  redirect(dest);
}
