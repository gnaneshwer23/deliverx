"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatAuthError } from "@/lib/auth-errors";

export type ResetState = { ok: boolean; error?: string };

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!password || password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { ok: false, error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Open the reset link from your email first." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { ok: false, error: formatAuthError(error.message) };
  }

  redirect("/login?reset=1");
}
