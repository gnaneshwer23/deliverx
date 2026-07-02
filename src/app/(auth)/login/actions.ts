"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatAuthError } from "@/lib/auth-errors";
import { AUTH_REQUEST_TIMEOUT_MS, withTimeout } from "@/lib/auth/timeout";
import { resolveAuthenticatedPath } from "@/lib/auth/redirect";
import { findSsoForEmail } from "@/services/orgSso";

export type LoginState = { ok: boolean; error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim();
  const ssoRequiredHint = String(formData.get("ssoRequired") ?? "") === "1";

  if (!email) {
    return { ok: false, error: "Email is required." };
  }

  if (ssoRequiredHint) {
    return {
      ok: false,
      error: "Password sign-in is disabled for your domain. Use SSO instead.",
    };
  }

  if (!password) {
    return { ok: false, error: "Email and password are required." };
  }

  const ssoMatch = await findSsoForEmail(email).catch(() => null);
  if (ssoMatch?.ssoRequired) {
    return {
      ok: false,
      error: "Password sign-in is disabled for your domain. Use SSO instead.",
    };
  }

  const supabase = await createClient();

  let signInResult: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;
  try {
    signInResult = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      AUTH_REQUEST_TIMEOUT_MS,
      "Sign-in timed out. Check your connection and try again.",
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign-in failed.";
    return { ok: false, error: formatAuthError(message) };
  }

  const { data, error } = signInResult;
  if (error) {
    return { ok: false, error: formatAuthError(error.message) };
  }

  redirect(
    await resolveAuthenticatedPath(supabase, next || null, data.user?.id),
  );
}
