import { redirect } from "next/navigation";
import { RoleForm } from "./role-form";
import { ObCard } from "@/components/dx/ob-card";
import { resolveRoleHomePath } from "@/config/role-home-routing";
import { getOnboardingProfile, isSponsorGatewayComplete } from "@/lib/auth/onboarding";
import { formatSponsorGatewayObStep, resolveGatewayRedirect, getPostRoleSelectRedirect } from "@/services/gatewayOnboardingEngine";

export default async function RolePage() {
  const { profile, gatewayStep } = await getOnboardingProfile();

  if (isSponsorGatewayComplete(profile, gatewayStep)) {
    redirect(resolveRoleHomePath(profile?.role));
  }
  if (!profile?.organisation_id) {
    redirect("/onboarding/organisation");
  }
  if (profile.role) {
    const next = resolveGatewayRedirect({
      hasOrg: true,
      hasRole: true,
      gatewayStep,
      role: profile.role,
    });
    redirect(next ?? getPostRoleSelectRedirect(profile.role));
  }

  return (
    <ObCard
      step={formatSponsorGatewayObStep("account")}
      title="What's your role?"
      description="Choose Founder / Sponsor to set up your first project and reach Founder Mission Control. Other roles follow a shorter workspace setup."
    >
      <RoleForm />
    </ObCard>
  );
}
