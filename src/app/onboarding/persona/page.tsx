import { redirect } from "next/navigation";
import { ObCard } from "@/components/dx/ob-card";
import {
  getObConfigForDbRole,
  getPersonaIdForDbRole,
  usesPersonaOnboarding,
  usesSponsorGateway,
} from "@/config/persona-onboarding";
import { ROLE_PILL_LABELS } from "@/lib/marketing/landing-data";
import { getOnboardingProfile, isSponsorGatewayComplete } from "@/lib/auth/onboarding";
import { resolveGatewayRedirect } from "@/services/gatewayOnboardingEngine";
import { PersonaWizard } from "./persona-wizard";

export default async function PersonaPage() {
  const { profile, gatewayStep } = await getOnboardingProfile();

  if (isSponsorGatewayComplete(profile, gatewayStep)) {
    redirect("/workspace/dashboard");
  }
  if (!profile?.organisation_id) {
    redirect("/onboarding/organisation");
  }
  if (!profile.role) {
    redirect("/onboarding/role");
  }
  if (usesSponsorGateway(profile.role)) {
    redirect("/project/new");
  }
  if (!usesPersonaOnboarding(profile.role)) {
    redirect("/onboarding/complete");
  }

  const stuckElsewhere = resolveGatewayRedirect({
    hasOrg: true,
    hasRole: true,
    gatewayStep,
    role: profile.role,
  });
  if (stuckElsewhere && stuckElsewhere !== "/onboarding/persona") {
    redirect(stuckElsewhere);
  }

  const personaId = getPersonaIdForDbRole(profile.role);
  const config = getObConfigForDbRole(profile.role);
  if (!personaId || !config) {
    redirect("/onboarding/complete");
  }

  const roleLabel = ROLE_PILL_LABELS[personaId];
  const stepCount = config.steps.length;

  return (
    <ObCard
      wide
      step={`Step 2 of 3 · ${roleLabel} workspace`}
      title={`Set up your ${roleLabel.toLowerCase()} workspace`}
      description="A lighter onboarding path tailored to your role — no sponsor GO gate required."
    >
      <p className="mb-4 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.1em] text-[#6B6B64]">
        {stepCount} guided steps · join or quick-start your team project on completion
      </p>
      <PersonaWizard config={config} roleLabel={roleLabel} />
    </ObCard>
  );
}
