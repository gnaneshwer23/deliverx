import { redirect } from "next/navigation";
import { RoleForm } from "./role-form";
import { ObCard } from "@/components/dx/ob-card";
import { resolveRoleHomePath } from "@/config/role-home-routing";
import { getOnboardingProfile, isSponsorGatewayComplete } from "@/lib/auth/onboarding";
import { parseSignupRoleParam } from "@/lib/marketing/role-signup";
import { formatSponsorGatewayObStep, resolveGatewayRedirect, getPostRoleSelectRedirect } from "@/services/gatewayOnboardingEngine";

type Search = Promise<{ role?: string }>;

export default async function RolePage({ searchParams }: { searchParams: Search }) {
  const { role: roleParam } = await searchParams;
  const preselectedRole = parseSignupRoleParam(roleParam);
  const { profile, gatewayStep, draftProjectId } = await getOnboardingProfile();

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
      draftProjectId,
    });
    redirect(next ?? getPostRoleSelectRedirect(profile.role));
  }

  return (
    <ObCard
      step={formatSponsorGatewayObStep("account")}
      title="What is your delivery role?"
      description="Sponsors set up the full gateway: project, Brief v2 business case, AI review, and team invites. PMs, BAs, and other delivery personas get a shorter path to their workspace."
    >
      <RoleForm initialRole={preselectedRole ?? undefined} />
    </ObCard>
  );
}
