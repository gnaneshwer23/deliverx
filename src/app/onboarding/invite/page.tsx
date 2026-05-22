import Link from "next/link";
import { listPendingInvitations } from "@/services/invitations";
import { InviteForm } from "./invite-form";

export default async function InvitePage() {
  let pending: Awaited<ReturnType<typeof listPendingInvitations>> = [];
  try {
    pending = await listPendingInvitations();
  } catch {
    pending = [];
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Invite your team</h1>
      <p className="mt-1 text-sm text-slate-500">
        Add teammates by email. Share the invite link so they can create an account.
      </p>

      <InviteForm pending={pending} />

      <div className="mt-8 flex gap-3 border-t border-slate-100 pt-6">
        <Link
          href="/onboarding/complete"
          className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Skip for now
        </Link>
        <Link
          href="/onboarding/complete"
          className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
