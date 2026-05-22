"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function ErrorFallback({
  error,
  reset,
  title = "Something went wrong",
  description = "An unexpected error occurred. You can try again or return to your workspace.",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#F8FAFC] px-6 py-16 text-center text-[#0F172A]">
      <AlertTriangle size={32} className="text-amber-500" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {process.env.NODE_ENV === "development" && error.message ? (
        <pre className="mt-4 max-w-lg overflow-x-auto rounded-lg bg-slate-100 px-4 py-3 text-left text-xs text-slate-700">
          {error.message}
        </pre>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
        >
          Try again
        </button>
        <Link
          href="/workspace/dashboard"
          className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
