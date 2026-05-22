import Link from "next/link";
import { Grain } from "@/components/marketing/grain";

export function MarketingCta() {
  return (
    <section id="cta" className="relative overflow-hidden bg-[#0a0e14] px-6 py-28 md:px-10 md:py-36">
      <Grain />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="font-[family-name:var(--font-display)] text-4xl text-[#f8f6f2] md:text-6xl">
          Ready to build?
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-[#9ca3af]">
          Start with a charter, a team, and a business case. DeliverX structures the rest.
        </p>
        <Link
          href="/signup"
          className="mt-10 inline-flex h-14 items-center rounded-full border border-[#f8f6f2]/40 px-10 text-[11px] font-medium uppercase tracking-[0.25em] text-[#f8f6f2] transition hover:border-[#6ee7c7] hover:text-[#6ee7c7]"
        >
          Start free trial
        </Link>
      </div>
    </section>
  );
}
