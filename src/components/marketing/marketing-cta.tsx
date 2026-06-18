import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingContainer, TrustChecklist } from "@/components/marketing/marketing-layout";

export function MarketingCtaSection() {
  return (
    <section
      id="cta"
      className="border-t border-white/8 bg-[var(--mkt-green)] px-5 py-20 text-center md:px-10 md:py-[clamp(80px,10vw,120px)] lg:px-12"
    >
      <MarketingContainer>
        <h2 className="font-[family-name:var(--font-dx-display)] text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.02em] text-white [&_em]:not-italic [&_em]:text-[var(--mkt-green-bright)]">
          Ready to run delivery with <em>shared intelligence?</em>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[clamp(0.9375rem,1.5vw,1.0625rem)] font-light text-white/75">
          30-day free trial · No credit card · First project live in 15 minutes
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <MarketingButtonLink href="/signup" variant="ctaLight">
            Start free trial
          </MarketingButtonLink>
          <MarketingButtonLink href="/login" variant="ctaOutline">
            Sign in
          </MarketingButtonLink>
        </div>
        <div className="mt-6 flex justify-center">
          <TrustChecklist
            light
            items={[
              "GDPR-ready infrastructure",
              "EU data practices",
              "Human approval on every AI change",
            ]}
          />
        </div>
      </MarketingContainer>
    </section>
  );
}
