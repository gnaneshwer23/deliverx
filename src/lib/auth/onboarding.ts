import { createClient } from "@/lib/supabase/server";
import type { GatewayStep } from "@/services/gatewayOnboardingEngine";
import { getGatewaySession } from "@/services/gatewayOnboarding";

export type OnboardingProfile = {
  organisation_id: string | null;
  role: string | null;
};

export function isAccountSetupComplete(
  profile: OnboardingProfile | null | undefined,
): boolean {
  return Boolean(profile?.organisation_id && profile?.role);
}

/** Legacy alias — account org + role only. */
export function isOnboardingComplete(profile: OnboardingProfile | null | undefined): boolean {
  return isAccountSetupComplete(profile);
}

export function isGatewayJourneyComplete(gatewayStep: GatewayStep | null | undefined): boolean {
  return !gatewayStep || gatewayStep === "complete";
}

export function isSponsorGatewayComplete(
  profile: OnboardingProfile | null | undefined,
  gatewayStep: GatewayStep | null | undefined,
): boolean {
  return isAccountSetupComplete(profile) && isGatewayJourneyComplete(gatewayStep);
}

export async function getOnboardingProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null as OnboardingProfile | null,
      gatewayStep: null as GatewayStep | null,
    };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, role")
    .eq("id", user.id)
    .maybeSingle();

  let gatewayStep: GatewayStep | null = null;
  try {
    const session = await getGatewaySession();
    gatewayStep = session?.step ?? null;
  } catch {
    gatewayStep = null;
  }

  return {
    user,
    profile: (profile as OnboardingProfile | null) ?? null,
    gatewayStep,
  };
}
