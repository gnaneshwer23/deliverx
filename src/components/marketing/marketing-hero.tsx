import Link from "next/link";
import { Grain } from "@/components/marketing/grain";
import { MarketingNav } from "@/components/marketing/marketing-nav";

export function MarketingHero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-end overflow-hidden bg-[#0a0e14] px-6 pb-16 pt-28 md:px-10 md:pb-24">
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#1a2838] via-[#0a0e14] to-[#050608]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(110,231,199,0.08), transparent 60%)",
        }}
        aria-hidden
      />
      <Grain />

      <MarketingNav />

      <div className="relative z-10 max-w-3xl">
        <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[1.1] tracking-tight text-[#f8f6f2] md:text-6xl lg:text-7xl">
          The speed of delivery.
          <br />
          The strength of alignment.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[#9ca3af] md:text-lg">
          DeliverX is the delivery operating system for programs — charter alignment,
          governance, and AI-assisted execution in one workspace.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center rounded-full border border-[#f8f6f2]/40 px-8 text-[11px] font-medium uppercase tracking-[0.2em] text-[#f8f6f2] transition hover:border-[#6ee7c7] hover:text-[#6ee7c7]"
          >
            Start free trial
          </Link>
          <Link
            href="#platform"
            className="inline-flex h-12 items-center rounded-full border border-transparent px-8 text-[11px] font-medium uppercase tracking-[0.2em] text-[#9ca3af] transition hover:text-[#f8f6f2]"
          >
            Explore platform
          </Link>
        </div>
      </div>
    </section>
  );
}
