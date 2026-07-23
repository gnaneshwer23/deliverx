import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import {
  MarketingIdealFor,
  MarketingIncludes,
} from "@/components/marketing/marketing-includes";
import {
  MarketingContainer,
  MarketingPageShell,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import {
  MarketingHeroItem,
  MarketingHeroMotion,
  MarketingReveal,
} from "@/components/marketing/marketing-reveal";
import { mktClass } from "@/lib/marketing/landing-theme";
import {
  productPageNav,
  type ProductPageContent,
} from "@/lib/marketing/product-page";

export function ProductMarketingPage({ content }: { content: ProductPageContent }) {
  const nav = productPageNav(content.path);
  const multiTier = content.pricing.tiers.length > 1;

  return (
    <MarketingPageShell>
      <MarketingNav
        links={nav}
        primaryCta={{
          href: content.primaryCta.href,
          label: content.primaryCta.label,
        }}
      />

      <main id="main-content">
        {/* 1. Hero — product name as brand signal */}
        <section
          id="hero"
          className="relative overflow-hidden bg-gradient-to-b from-[#EEF5F1] via-[var(--mkt-ink)] to-[var(--mkt-ink)] pt-[calc(var(--mkt-navh)+56px)] pb-16 md:pt-[calc(var(--mkt-navh)+80px)] md:pb-20"
        >
          <div className="pointer-events-none absolute inset-0 z-0 mkt-hero-mesh" aria-hidden />
          <div
            className="pointer-events-none absolute -right-24 top-1/3 z-0 size-[360px] rounded-full bg-[radial-gradient(circle,rgba(61,150,96,0.12)_0%,transparent_70%)] blur-3xl"
            aria-hidden
          />
          <MarketingContainer className="relative z-[1]">
            <MarketingHeroMotion>
              <MarketingHeroItem>
                <p className={mktClass.label}>
                  {content.brandEyebrow ?? "DeliverX · Career progression"}
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <h1
                  className={`mt-4 max-w-3xl text-[clamp(2.75rem,7.5vw,4.25rem)] leading-[1.0] tracking-[-0.035em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                >
                  {content.name}
                </h1>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p className="mt-5 max-w-xl text-[clamp(1.125rem,2.2vw,1.35rem)] font-light leading-relaxed text-[var(--mkt-text1)]">
                  {content.promise}
                </p>
              </MarketingHeroItem>
              {content.support ? (
                <MarketingHeroItem>
                  <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                    {content.support}
                  </p>
                </MarketingHeroItem>
              ) : null}
              <MarketingHeroItem>
                <div className="mt-9 flex flex-wrap gap-3">
                  <MarketingButtonLink
                    href={content.primaryCta.href}
                    variant="primaryLg"
                    className="mkt-card-lift"
                  >
                    {content.primaryCta.label}
                  </MarketingButtonLink>
                  <MarketingButtonLink href="/pricing" variant="ghostLg">
                    View full pricing
                  </MarketingButtonLink>
                </div>
              </MarketingHeroItem>
            </MarketingHeroMotion>
          </MarketingContainer>
        </section>

        {/* 2. How it works */}
        <MarketingSection id="how" tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label={content.how.label ?? "How it works"}
                title={content.how.title}
                subtitle={content.how.subtitle}
              />
            </MarketingReveal>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-0">
              {content.how.steps.map((item, index) => (
                <li
                  key={item.step}
                  className="md:border-l md:border-[var(--mkt-border)] md:px-8 md:first:border-l-0 md:first:pl-0"
                >
                  <MarketingReveal delay={index * 0.07}>
                    <p className={`${mktClass.mono} text-[var(--mkt-green-l)]`}>{item.step}</p>
                    <h3
                      className={`mt-3 text-xl tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                    >
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                      {item.body}
                    </p>
                  </MarketingReveal>
                </li>
              ))}
            </ol>
          </MarketingContainer>
        </MarketingSection>

        {/* 3. Pricing */}
        <MarketingSection id="pricing" tone="cream">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label="Pricing"
                title={content.pricing.title}
                subtitle={content.pricing.subtitle}
              />
            </MarketingReveal>
            <div
              className={`mt-12 grid gap-12 ${multiTier ? "md:grid-cols-2" : "max-w-3xl"}`}
            >
              {content.pricing.tiers.map((tier, index) => (
                <MarketingReveal key={tier.name} delay={index * 0.06}>
                  <div className="border-t border-[var(--mkt-border)] pt-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <p className={mktClass.label}>{tier.name}</p>
                      {tier.cadence ? (
                        <p className="text-sm text-[var(--mkt-text3)]">{tier.cadence}</p>
                      ) : null}
                    </div>
                    <p
                      className={`mt-3 text-[clamp(2.25rem,4.5vw,3rem)] leading-none tracking-[-0.04em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                    >
                      {tier.price}
                    </p>
                    <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                      {tier.summary}
                    </p>

                    <div className="mt-8">
                      <MarketingIncludes items={tier.features} />
                    </div>

                    {(tier.idealFor ?? content.idealFor) ? (
                      <MarketingIdealFor>
                        {tier.idealFor ?? content.idealFor!}
                      </MarketingIdealFor>
                    ) : null}

                    <div className="mt-8 flex flex-wrap gap-3">
                      <MarketingButtonLink
                        href={tier.ctaHref}
                        variant={tier.featured || !multiTier ? "primaryLg" : "ghostLg"}
                        className="mkt-card-lift"
                      >
                        {tier.cta}
                      </MarketingButtonLink>
                      <MarketingButtonLink href="/pricing#bundle" variant="ghostLg">
                        See bundle
                      </MarketingButtonLink>
                    </div>
                  </div>
                </MarketingReveal>
              ))}
            </div>
          </MarketingContainer>
        </MarketingSection>

        {/* 4. Final CTA */}
        <MarketingSection tone="dark" className="mkt-cta-band !border-0">
          <MarketingContainer className="relative z-10 text-center">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.75rem,4vw,2.5rem)] tracking-[-0.02em] text-white ${mktClass.serif}`}
              >
                {content.finalCta.title}
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[0.9375rem] font-light leading-relaxed text-white/70">
                {content.finalCta.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <MarketingButtonLink href={content.finalCta.ctaHref} variant="ctaLight">
                  {content.finalCta.ctaLabel}
                </MarketingButtonLink>
                <MarketingButtonLink href="/pricing" variant="ctaOutline">
                  Full pricing
                </MarketingButtonLink>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>
      </main>

      <MarketingFooter cta={content.footerCta} />
    </MarketingPageShell>
  );
}
