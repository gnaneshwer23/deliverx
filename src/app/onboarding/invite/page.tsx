import { redirect } from "next/navigation";
import { listPendingInvitations } from "@/services/invitations";
import { InviteForm } from "./invite-form";
import { ObCard } from "@/components/dx/ob-card";
import { DxButtonLink } from "@/components/dx/dx-button";
import { getOnboardingProfile, isOnboardingComplete } from "@/lib/auth/onboarding";

export default async function InvitePage() {
  const { profile } = await getOnboardingProfile();

  if (isOnboardingComplete(profile)) {
    redirect("/workspace/dashboard");
  }
  if (!profile?.organisation_id) {
    redirect("/onboarding/organisation");
  }
  if (!profile.role) {
    redirect("/onboarding/role");
  }

  let pending: Awaited<ReturnType<typeof listPendingInvitations>> = [];
  try {
    pending = await listPendingInvitations();
  } catch {
    pending = [];
  }

  return (
    <ObCard
      step="Step 3 of 4"
      title="Invite your team"
      description="Add teammates by email. Share the invite link so they can create an account."
    >
      <InviteForm pending={pending} />
      <div className="mt-8 flex gap-3 border-t border-[#E4E4DC] pt-6">
        <DxButtonLink href="/onboarding/complete" variant="ghost" className="flex-1">
          Skip for now
        </DxButtonLink>
        <DxButtonLink href="/onboarding/complete" className="flex-1">
          Continue →
        </DxButtonLink>
      </div>
    </ObCard>
  );
}
