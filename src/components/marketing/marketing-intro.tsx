import { marketing } from "@/lib/marketing-theme";

export function MarketingIntro() {
  return (
    <section id="platform" className="relative overflow-hidden bg-[#f5f2ed] px-6 py-24 md:px-10 md:py-32">
      <p
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 select-none font-[family-name:var(--font-display)] text-[12rem] leading-none text-[#1a1a1a]/[0.04] md:text-[16rem]"
      >
        DX
      </p>

      <div className="relative z-10 mx-auto max-w-4xl">
        <span
          className="inline-block rounded-full px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.25em] text-[#f8f6f2]"
          style={{ backgroundColor: marketing.maroon }}
        >
          What we bring
        </span>
        <h2 className="mt-8 font-[family-name:var(--font-display)] text-4xl leading-tight text-[#1a1a1a] md:text-5xl lg:text-6xl">
          Delivery intelligence is your unfair advantage
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#4b5563]">
          Any PM tool can track tasks. DeliverX grounds every decision in your charter,
          connects meetings to RAID and traceability, and uses AI with guardrails —
          preview, approve, then persist.
        </p>
      </div>
    </section>
  );
}
