import { redirect } from "next/navigation";
import { getOnboardingProfile, isOnboardingComplete } from "@/lib/auth/onboarding";

/** Redirect unauthenticated or incomplete onboarding users away from app shells. */
export async function requireCompleteOnboarding() {
  const { user, profile } = await getOnboardingProfile();
  if (!user) redirect("/login");
  if (!profile?.organisation_id) redirect("/onboarding/organisation");
  if (!profile?.role) redirect("/onboarding/role");
  return { user, profile };
}

export async function getOnboardingRedirectIfIncomplete(): Promise<string | null> {
  const { user, profile } = await getOnboardingProfile();
  if (!user) return "/login";
  if (!isOnboardingComplete(profile)) {
    if (!profile?.organisation_id) return "/onboarding/organisation";
    return "/onboarding/role";
  }
  return null;
}
