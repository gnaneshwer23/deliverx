import { redirect } from "next/navigation";
import { RoleForm } from "./role-form";
import { ObCard } from "@/components/dx/ob-card";
import { getOnboardingProfile, isOnboardingComplete } from "@/lib/auth/onboarding";

export default async function RolePage() {
  const { profile } = await getOnboardingProfile();

  if (isOnboardingComplete(profile)) {
    redirect("/workspace/dashboard");
  }
  if (!profile?.organisation_id) {
    redirect("/onboarding/organisation");
  }
  if (profile.role) {
    redirect("/onboarding/invite");
  }

  return (
    <ObCard
      step="Step 2 of 4"
      title="What's your role?"
      description="We'll tailor dashboards, shortcuts, and intelligence to how you deliver."
    >
      <RoleForm />
    </ObCard>
  );
}
