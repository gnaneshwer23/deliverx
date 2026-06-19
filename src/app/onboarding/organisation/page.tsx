import { redirect } from "next/navigation";
import { OrganisationForm } from "./organisation-form";
import { ObCard } from "@/components/dx/ob-card";
import { resolveRoleHomePath } from "@/config/role-home-routing";
import { getOnboardingProfile, isSponsorGatewayComplete } from "@/lib/auth/onboarding";
import { resolveGatewayRedirect } from "@/services/gatewayOnboardingEngine";

export default async function OrganisationPage() {
  const { profile, gatewayStep } = await getOnboardingProfile();

  if (isSponsorGatewayComplete(profile, gatewayStep)) {
    redirect(resolveRoleHomePath(profile?.role));
  }
  if (profile?.organisation_id) {
    const next = resolveGatewayRedirect({
      hasOrg: true,
      hasRole: Boolean(profile.role),
      gatewayStep,
      role: profile.role,
    });
    redirect(next ?? "/onboarding/role");
  }

  return (
    <ObCard
      step="Step 1 of 5 · Account"
      title="Tell us about your organisation"
      description="We'll use this to set up your workspace and tailor delivery intelligence to your context."
    >
      <OrganisationForm />
    </ObCard>
  );
}
