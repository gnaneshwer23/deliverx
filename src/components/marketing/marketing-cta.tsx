import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingContainer, TrustChecklist } from "@/components/marketing/marketing-layout";

export function MarketingCtaSection() {
  return (
    <section
      id="cta"
      className="mkt-cta-band relative overflow-hidden px-5 py-12 text-center md:px-10 md:py-[clamp(56px,8vw,96px)] lg:px-12"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />
      <MarketingContainer className="relative">
        <p className="mb-4 font-[family-name:var(--font-mkt-mono)] text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-white/50">
          Start delivering with confidence
        </p>
        <h2 className="font-[family-name:var(--font-dx-display)] text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.04] tracking-[-0.03em] text-white [&_em]:not-italic [&_em]:text-[#6EE7B7]">
          Ready to run delivery with <em>shared intelligence?</em>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[clamp(0.9375rem,1.5vw,1.0625rem)] font-light leading-[1.65] text-white/80">
          30-day free trial · No credit card · First project live in 15 minutes
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <MarketingButtonLink href="/signup" variant="ctaLight" className="mkt-card-lift !px-8 !py-3.5 !text-base">
            Join the pilot
          </MarketingButtonLink>
          <MarketingButtonLink href="/login" variant="ctaOutline" className="!px-8 !py-3.5 !text-base">
            Sign in
          </MarketingButtonLink>
        </div>
        <div className="mt-8 flex justify-center">
          <TrustChecklist
            light
            pills
            items={[
              "GDPR-ready infrastructure",
              "EU data residency practices",
              "Human approval on every AI change",
            ]}
          />
        </div>
      </MarketingContainer>
    </section>
  );
}
