import Link from "next/link";
import { SignupForm } from "./signup-form";

type Search = Promise<{ invite?: string }>;

export default async function SignupPage({ searchParams }: { searchParams: Search }) {
  const { invite } = await searchParams;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Start your free trial. No credit card required.
      </p>

      {invite ? (
        <div className="mt-4 rounded-md bg-[#0F766E]/10 px-3 py-2 text-xs text-[#0F766E]">
          You&apos;ve been invited to join a Deliverx workspace.
        </div>
      ) : null}

      <SignupForm invite={invite} />

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href={
            invite
              ? `/login?next=${encodeURIComponent(`/invite/${invite}`)}`
              : "/login"
          }
          className="font-medium text-[#0F766E] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
