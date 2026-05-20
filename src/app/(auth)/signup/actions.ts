"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignupState = {
  ok: boolean;
  error?: string;
  email?: string;
};

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const invite = String(formData.get("invite") ?? "").trim() || undefined;

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();

  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ??
    `https://${requestHeaders.get("host") ?? "localhost:3000"}`;

  const next = invite
    ? `/onboarding/invite?token=${encodeURIComponent(invite)}`
    : "/onboarding/organisation";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { ok: false, error: error.message, email };
  }

  redirect(`/verify?email=${encodeURIComponent(email)}`);
}
