"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type ForgotState = { ok: boolean; error?: string };

export async function forgotPasswordAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { ok: false, error: "Email is required." };
  }

  const supabase = await createClient();
  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    `https://${requestHeaders.get("host") ?? "localhost:3000"}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/login/reset")}`,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
