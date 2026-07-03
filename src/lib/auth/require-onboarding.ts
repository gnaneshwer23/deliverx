import { redirect } from "next/navigation";
import {
  getOnboardingProfile,
  isAccountSetupComplete,
  isSponsorGatewayComplete,
} from "@/lib/auth/onboarding";
import { getRequestPathFromHeaders } from "@/lib/auth/request-path";
import { isGatewayRedirectDestination } from "@/lib/auth/route-guards";
import { resolveGatewayRedirect } from "@/services/gatewayOnboardingEngine";

async function redirectIfNotAtGatewayDestination(redirectPath: string) {
  const currentPath = await getRequestPathFromHeaders();

  if (!currentPath) {
    // Proxy path headers are sometimes missing on Vercel. Re-redirecting here
    // strips ?project= from PM onboard URLs and breaks the upload panel.
    if (redirectPath.startsWith("/workspace/pm-mission")) return;
    redirect(redirectPath);
    return;
  }

  if (!isGatewayRedirectDestination(currentPath, redirectPath)) {
    redirect(redirectPath);
  }
}

/** Redirect unauthenticated or incomplete sponsor gateway users away from app shells. */
export async function requireCompleteOnboarding() {
  const { user, profile, gatewayStep, draftProjectId } = await getOnboardingProfile();
  if (!user) redirect("/login");
  if (!profile?.organisation_id) redirect("/onboarding/organisation");
  if (!profile?.role) redirect("/onboarding/role");

  const gatewayRedirect = resolveGatewayRedirect({
    hasOrg: Boolean(profile.organisation_id),
    hasRole: Boolean(profile.role),
    gatewayStep,
    role: profile.role,
    draftProjectId,
  });
  if (gatewayRedirect) {
    await redirectIfNotAtGatewayDestination(gatewayRedirect);
  }

  return { user, profile };
}

export async function getOnboardingRedirectIfIncomplete(): Promise<string | null> {
  const { user, profile, gatewayStep, draftProjectId } = await getOnboardingProfile();
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
      draftProjectId,
    });
  }
  return null;
}
