import { createClient } from "@/lib/supabase/server";

export type OnboardingProfile = {
  organisation_id: string | null;
  role: string | null;
};

export function isOnboardingComplete(profile: OnboardingProfile | null | undefined): boolean {
  return Boolean(profile?.organisation_id && profile?.role);
}

export async function getOnboardingProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null as OnboardingProfile | null };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: (profile as OnboardingProfile | null) ?? null,
  };
}
