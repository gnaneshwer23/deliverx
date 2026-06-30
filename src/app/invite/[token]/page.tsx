import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getInvitationByToken } from "@/services/invitations";
import { AcceptInviteForm } from "./accept-invite-form";
import { StatusBadge } from "@/components/shared/status-badge";

type Params = Promise<{ token: string }>;

export default async function InviteAcceptPage({ params }: { params: Params }) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loginHref = `/login?next=${encodeURIComponent(`/invite/${token}`)}`;
  const signupHref = `/signup?invite=${encodeURIComponent(token)}`;

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#0F172A]">
        <header className="border-b bg-white px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            DeliverX
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight">
              You&apos;re invited
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in or create an account with the email address that received
              this invitation.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={loginHref}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
              >
                Sign in
              </Link>
              <Link
                href={signupHref}
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Create account
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  let invitation: Awaited<ReturnType<typeof getInvitationByToken>> = null;
  let errorMessage: string | null = null;

  try {
    invitation = await getInvitationByToken(token);
  } catch (err) {
    errorMessage =
      err instanceof Error ? err.message : "Unable to load invitation.";
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold">Invitation unavailable</h1>
          <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
          <Link
            href="/workspace/dashboard"
            className="mt-6 inline-flex text-sm font-medium text-[#0F766E] hover:underline"
          >
            Go to workspace
          </Link>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold">Invitation not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            This link may be invalid or already used.
          </p>
          <Link
            href="/workspace/dashboard"
            className="mt-6 inline-flex text-sm font-medium text-[#0F766E] hover:underline"
          >
            Go to workspace
          </Link>
        </div>
      </div>
    );
  }

  const expired = new Date(invitation.expires_at) < new Date();
  const inactive = invitation.status !== "pending" || expired;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Join your team</h1>
        <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          This is an <span className="font-medium">organisation email invite</span>. Project-scoped
          delivery team invites use the{" "}
          <span className="font-medium text-slate-800">/join</span> link from your Project Manager.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          You&apos;ve been invited to join{" "}
          <span className="font-medium text-slate-700">
            {invitation.organisationName}
          </span>{" "}
          as{" "}
          <span className="font-medium text-slate-700">
            {invitation.role.replace(/_/g, " ")}
          </span>
          .
        </p>

        <div className="mt-4 flex items-center gap-2">
          <StatusBadge status={expired ? "expired" : invitation.status} />
          <span className="text-xs text-slate-500">
            Expires {new Date(invitation.expires_at).toLocaleDateString()}
          </span>
        </div>

        {inactive ? (
          <p className="mt-6 text-sm text-slate-500">
            This invitation is no longer active. Ask your admin to send a new
            invite.
          </p>
        ) : (
          <AcceptInviteForm token={token} />
        )}
      </div>
    </div>
  );
}
