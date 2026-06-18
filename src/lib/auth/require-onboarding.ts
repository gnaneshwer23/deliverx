import { redirect } from "next/navigation";
import {
  getOnboardingProfile,
  isAccountSetupComplete,
  isSponsorGatewayComplete,
} from "@/lib/auth/onboarding";
import { resolveGatewayRedirect } from "@/services/gatewayOnboardingEngine";

/** Redirect unauthenticated or incomplete sponsor gateway users away from app shells. */
export async function requireCompleteOnboarding() {
  const { user, profile, gatewayStep } = await getOnboardingProfile();
  if (!user) redirect("/login");
  if (!profile?.organisation_id) redirect("/onboarding/organisation");
  if (!profile?.role) redirect("/onboarding/role");

  const gatewayRedirect = resolveGatewayRedirect({
    hasOrg: Boolean(profile.organisation_id),
    hasRole: Boolean(profile.role),
    gatewayStep,
    role: profile.role,
  });
  if (gatewayRedirect) redirect(gatewayRedirect);

  return { user, profile };
}

export async function getOnboardingRedirectIfIncomplete(): Promise<string | null> {
  const { user, profile, gatewayStep } = await getOnboardingProfile();
  if (!user) return "/login";
  if (!isAccountSetupComplete(profile)) {
    if (!profile?.organisation_id) return "/onboarding/organisation";
    return "/onboarding/role";
  }
  if (!isSponsorGatewayComplete(profile, gatewayStep)) {
    return resolveGatewayRedirect({
      hasOrg: Boolean(profile?.organisation_id),
      hasRole: Boolean(profile?.role),
      gatewayStep,
      role: profile?.role,
    });
  }
  return null;
}
