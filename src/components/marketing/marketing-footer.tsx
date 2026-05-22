import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0e14] px-6 py-12 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:justify-between">
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl text-[#f8f6f2]">DeliverX</p>
          <p className="mt-2 max-w-xs text-sm text-[#6b7280]">
            Delivery intelligence for programs — charter alignment, governance, and AI-assisted
            execution.
          </p>
          <p className="mt-6 text-xs text-[#4b5563]" suppressHydrationWarning>
            © {new Date().getFullYear()} DeliverX
          </p>
        </div>
        <div className="flex flex-wrap gap-12 text-sm">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#6ee7c7]">Platform</p>
            <ul className="space-y-2 text-[#9ca3af]">
              <li><a href="#platform" className="hover:text-[#f8f6f2]">Overview</a></li>
              <li><a href="#capabilities" className="hover:text-[#f8f6f2]">Capabilities</a></li>
              <li><Link href="/login" className="hover:text-[#f8f6f2]">Log in</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#6ee7c7]">Connect</p>
            <ul className="space-y-2 text-[#9ca3af]">
              <li><Link href="/signup" className="hover:text-[#f8f6f2]">Start free trial</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
