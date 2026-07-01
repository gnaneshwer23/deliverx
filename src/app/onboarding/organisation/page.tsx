import { redirect } from "next/navigation";
import { OrganisationForm } from "./organisation-form";
import { ObCard } from "@/components/dx/ob-card";
import { resolveRoleHomePath } from "@/config/role-home-routing";
import { getOnboardingProfile, isSponsorGatewayComplete } from "@/lib/auth/onboarding";
import { appendRoleToPath, parseSignupRoleParam } from "@/lib/marketing/role-signup";
import { formatSponsorGatewayObStep, resolveGatewayRedirect } from "@/services/gatewayOnboardingEngine";

type Search = Promise<{ role?: string }>;

export default async function OrganisationPage({ searchParams }: { searchParams: Search }) {
  const { role: roleParam } = await searchParams;
  const preselectedRole = parseSignupRoleParam(roleParam);
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
    redirect(next ?? appendRoleToPath("/onboarding/role", preselectedRole));
  }

  return (
    <ObCard
      step={formatSponsorGatewayObStep("account")}
      title="Set up your delivery workspace"
      description="Tell us about the organisation your PMs, BAs, and delivery leads work in. This context powers Delivery Brain playbooks, Brief v2 templates, and the AI Review Queue. Next you will name your project, submit a business case for human-approved AI review, and invite your team."
    >
      <OrganisationForm preselectedRole={preselectedRole} />
    </ObCard>
  );
}
