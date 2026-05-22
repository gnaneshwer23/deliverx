import Link from "next/link";
import { LoginForm } from "./login-form";

type Search = Promise<{ next?: string; reset?: string; error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { next, reset, error } = await searchParams;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">
        Sign in to continue to your workspace.
      </p>

      {reset ? (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Password updated. Sign in with your new password.
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <LoginForm next={next} />

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href={next ? `/signup?invite=${encodeURIComponent(next.replace(/^\/invite\//, ""))}` : "/signup"}
          className="font-medium text-[#0F766E] hover:underline"
        >
          Start free trial
        </Link>
      </p>
    </div>
  );
}
