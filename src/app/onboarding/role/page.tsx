import { redirect } from "next/navigation";
import { RoleForm } from "./role-form";
import { ObCard } from "@/components/dx/ob-card";
import { getOnboardingProfile, isSponsorGatewayComplete } from "@/lib/auth/onboarding";
import { resolveGatewayRedirect } from "@/services/gatewayOnboardingEngine";

export default async function RolePage() {
  const { profile, gatewayStep } = await getOnboardingProfile();

  if (isSponsorGatewayComplete(profile, gatewayStep)) {
    redirect("/workspace/dashboard");
  }
  if (!profile?.organisation_id) {
    redirect("/onboarding/organisation");
  }
  if (profile.role) {
    const next = resolveGatewayRedirect({
      hasOrg: true,
      hasRole: true,
      gatewayStep,
    });
    redirect(next ?? "/project/new");
  }

  return (
    <ObCard
      step="Step 1 of 5 · Account"
      title="What's your role?"
      description="We'll tailor dashboards, shortcuts, and intelligence to how you deliver."
    >
      <RoleForm />
    </ObCard>
  );
}
