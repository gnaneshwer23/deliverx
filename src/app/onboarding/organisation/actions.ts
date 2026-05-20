"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OrgState = { ok: boolean; error?: string };

export async function createOrganisationAction(
  _prev: OrgState,
  formData: FormData,
): Promise<OrgState> {
  const name = String(formData.get("name") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const teamSize = String(formData.get("team_size") ?? "").trim() || null;
  const deliveryType = String(formData.get("delivery_type") ?? "").trim() || null;

  if (!name) {
    return { ok: false, error: "Organisation name is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: org, error: orgError } = await supabase
    .from("organisations")
    .insert({
      name,
      industry,
      team_size: teamSize,
      delivery_type: deliveryType,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (orgError || !org) {
    return { ok: false, error: orgError?.message ?? "Failed to create organisation." };
  }

  const { error: linkError } = await supabase
    .from("users")
    .update({ organisation_id: org.id })
    .eq("id", user.id);

  if (linkError) {
    return { ok: false, error: linkError.message };
  }

  redirect("/onboarding/role");
}
