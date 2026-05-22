"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SettingsState = { ok: boolean; error?: string };

export async function updateOrganisationAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const name = String(formData.get("name") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const teamSize = String(formData.get("team_size") ?? "").trim() || null;
  const deliveryType = String(formData.get("delivery_type") ?? "").trim() || null;

  if (!name) return { ok: false, error: "Organisation name is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .single();
  if (!profile?.organisation_id) {
    return { ok: false, error: "No organisation linked to your account." };
  }

  const { error } = await supabase
    .from("organisations")
    .update({
      name,
      industry,
      team_size: teamSize,
      delivery_type: deliveryType,
    })
    .eq("id", profile.organisation_id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/workspace/settings");
  revalidatePath("/workspace/dashboard");
  return { ok: true };
}

export async function updateProfileAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const name = String(formData.get("name") ?? "").trim() || null;
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { error } = await supabase
    .from("users")
    .update({
      name,
      avatar_url: avatarUrl,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/workspace/settings");
  revalidatePath("/workspace/dashboard");
  return { ok: true };
}
