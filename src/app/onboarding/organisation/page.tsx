import { redirect } from "next/navigation";
import { OrganisationForm } from "./organisation-form";
import { ObCard } from "@/components/dx/ob-card";
import { resolveRoleHomePath } from "@/config/role-home-routing";
import { getOnboardingProfile, isSponsorGatewayComplete } from "@/lib/auth/onboarding";
import { formatSponsorGatewayObStep, resolveGatewayRedirect } from "@/services/gatewayOnboardingEngine";

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
      step={formatSponsorGatewayObStep("account")}
      title="Tell us about your organisation"
      description="This is step 1 of founder setup: account and workspace context. Next you'll name your project, review your business case with AI, and invite your team — then your Founder Mission Control opens."
    >
      <OrganisationForm />
    </ObCard>
  );
}
