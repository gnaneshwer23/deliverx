import Link from "next/link";

export default function InvitePage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Invite your team</h1>
      <p className="mt-1 text-sm text-slate-500">
        Coming soon. You&apos;ll be able to invite teammates by email and assign
        roles.
      </p>

      <div className="mt-6 rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        Team invitations land in Day 4 of the build plan.
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/onboarding/complete"
          className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
        >
          Skip for now
        </Link>
      </div>
    </div>
  );
}
