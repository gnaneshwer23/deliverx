import Link from "next/link";
import { listPendingInvitations } from "@/services/invitations";
import { InviteForm } from "./invite-form";
import { SovereignCard } from "@/components/sovereign/sovereign-card";
import { sovereignClass } from "@/lib/sovereign-theme";

export default async function InvitePage() {
  let pending: Awaited<ReturnType<typeof listPendingInvitations>> = [];
  try {
    pending = await listPendingInvitations();
  } catch {
    pending = [];
  }

  return (
    <SovereignCard
      title="Invite your team"
      description="Add teammates by email. Share the invite link so they can create an account."
    >
      <InviteForm pending={pending} />

      <div className="mt-8 flex gap-3 border-t border-[#1a1a1a]/8 pt-6">
        <Link
          href="/onboarding/complete"
          className={`${sovereignClass.pillGhost} h-11 flex-1`}
        >
          Skip for now
        </Link>
        <Link
          href="/onboarding/complete"
          className={`${sovereignClass.pillPrimary} h-11 flex-1`}
        >
          Continue
        </Link>
      </div>
    </SovereignCard>
  );
}
