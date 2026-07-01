"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateOrganisationFormInput } from "@/lib/onboarding/resolve-select-value";
import { appendRoleToPath, parseSignupRoleParam } from "@/lib/marketing/role-signup";

export type OrgState = { ok: boolean; error?: string };

export async function createOrganisationAction(
  _prev: OrgState,
  formData: FormData,
): Promise<OrgState> {
  const validation = validateOrganisationFormInput({
    name: String(formData.get("name") ?? ""),
    industry: String(formData.get("industry") ?? "").trim() || null,
    industryOther: String(formData.get("industry_other") ?? "").trim() || null,
    teamSize: String(formData.get("team_size") ?? "").trim() || null,
    deliveryType: String(formData.get("delivery_type") ?? "").trim() || null,
    deliveryTypeOther: String(formData.get("delivery_type_other") ?? "").trim() || null,
  });

  if (!validation.ok || !validation.resolved) {
    return { ok: false, error: validation.error ?? "Invalid organisation details." };
  }

  const { name, industry, teamSize, deliveryType } = validation.resolved;

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

  const preselectedRole = parseSignupRoleParam(String(formData.get("preselected_role") ?? ""));
  redirect(appendRoleToPath("/onboarding/role", preselectedRole));
}
