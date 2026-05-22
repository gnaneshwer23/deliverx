import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-6 text-center text-[#0F172A]">
      <p className="text-sm font-medium uppercase tracking-wide text-[#0F766E]">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        This route doesn&apos;t exist or you may not have access. Head back to your workspace to
        continue.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/workspace/dashboard"
          className="inline-flex h-10 items-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
        >
          Go to dashboard
        </Link>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
