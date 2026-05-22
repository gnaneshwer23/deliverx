import Link from "next/link";
import { AuthPanel, authLinkClass } from "@/components/marketing/auth-panel";
import { LoginForm } from "./login-form";

type Search = Promise<{ next?: string; reset?: string; error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { next, reset, error } = await searchParams;

  return (
    <AuthPanel>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-[#9ca3af]">Sign in to continue to your workspace.</p>

      {reset ? (
        <div className="mt-4 rounded-lg border border-[#6ee7c7]/30 bg-[#6ee7c7]/10 px-3 py-2 text-sm text-[#6ee7c7]">
          Password updated. Sign in with your new password.
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <LoginForm next={next} />

      <p className="mt-6 text-center text-sm text-[#9ca3af]">
        Don&apos;t have an account?{" "}
        <Link
          href={
            next
              ? `/signup?invite=${encodeURIComponent(next.replace(/^\/invite\//, ""))}`
              : "/signup"
          }
          className={authLinkClass}
        >
          Start free trial
        </Link>
      </p>
    </AuthPanel>
  );
}
