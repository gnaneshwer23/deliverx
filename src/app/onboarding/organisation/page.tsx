import { redirect } from "next/navigation";
import { OrganisationForm } from "./organisation-form";
import { ObCard } from "@/components/dx/ob-card";
import { getOnboardingProfile, isOnboardingComplete } from "@/lib/auth/onboarding";

export default async function OrganisationPage() {
  const { profile } = await getOnboardingProfile();

  if (isOnboardingComplete(profile)) {
    redirect("/workspace/dashboard");
  }
  if (profile?.organisation_id) {
    redirect("/onboarding/role");
  }

  return (
    <ObCard
      step="Step 1 of 4"
      title="Tell us about your organisation"
      description="We'll use this to set up your workspace and tailor delivery intelligence to your context."
    >
      <OrganisationForm />
    </ObCard>
  );
}
