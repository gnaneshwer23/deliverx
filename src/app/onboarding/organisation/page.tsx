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
      title="Set up your delivery workspace"
      description="Tell us about the organisation your PMs, BAs, and delivery leads work in. This context powers Delivery Brain playbooks, Brief v2 templates, and the AI Review Queue. Next you will name your project, submit a business case for human-approved AI review, and invite your team."
    >
      <OrganisationForm />
    </ObCard>
  );
}
