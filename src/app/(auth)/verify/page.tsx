type Search = Promise<{ email?: string }>;

export default async function VerifyPage({ searchParams }: { searchParams: Search }) {
  const { email } = await searchParams;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#0F766E]/10 text-[#0F766E]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </div>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Check your inbox
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        We&apos;ve sent a verification link to{" "}
        <span className="font-medium text-[#0F172A]">{email ?? "your email"}</span>
        . Click it to continue setting up your workspace.
      </p>
      <p className="mt-6 text-xs text-slate-500">
        Didn&apos;t get the email? Check your spam folder, or wait a minute and refresh.
      </p>
    </div>
  );
}
