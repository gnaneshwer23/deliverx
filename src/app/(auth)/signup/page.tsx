import Link from "next/link";
import { AuthPanel, authLinkClass } from "@/components/marketing/auth-panel";
import { SignupForm } from "./signup-form";

type Search = Promise<{ invite?: string }>;

export default async function SignupPage({ searchParams }: { searchParams: Search }) {
  const { invite } = await searchParams;

  return (
    <AuthPanel>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-[#9ca3af]">
        Start your free trial. No credit card required.
      </p>

      {invite ? (
        <div className="mt-4 rounded-lg border border-[#6ee7c7]/30 bg-[#6ee7c7]/10 px-3 py-2 text-xs text-[#6ee7c7]">
          You&apos;ve been invited to join a DeliverX workspace.
        </div>
      ) : null}

      <SignupForm invite={invite} />

      <p className="mt-6 text-center text-sm text-[#9ca3af]">
        Already have an account?{" "}
        <Link
          href={
            invite
              ? `/login?next=${encodeURIComponent(`/invite/${invite}`)}`
              : "/login"
          }
          className={authLinkClass}
        >
          Sign in
        </Link>
      </p>
    </AuthPanel>
  );
}
