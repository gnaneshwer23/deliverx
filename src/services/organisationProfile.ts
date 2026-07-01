import { createClient } from "@/lib/supabase/server";

export type OrganisationProfile = {
  industry: string | null;
  deliveryType: string | null;
};

/** Current user's organisation industry + delivery type from onboarding. */
export async function getCurrentOrganisationProfile(): Promise<OrganisationProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { industry: null, deliveryType: null };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, organisations(industry, delivery_type)")
    .eq("id", user.id)
    .maybeSingle();

  const org = profile?.organisations as {
    industry?: string | null;
    delivery_type?: string | null;
  } | null;

  return {
    industry: org?.industry ?? null,
    deliveryType: org?.delivery_type ?? null,
  };
}
