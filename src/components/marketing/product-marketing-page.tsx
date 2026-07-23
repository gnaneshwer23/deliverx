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
        {/* Hero — product name as brand signal; tight budget */}
        <section
          id="hero"
          className="relative flex min-h-[min(72svh,640px)] flex-col justify-end overflow-hidden bg-gradient-to-b from-[#EEF5F1] via-[var(--mkt-ink)] to-[var(--mkt-cream)] pt-[calc(var(--mkt-navh)+48px)] pb-16 md:min-h-[min(78svh,720px)] md:pb-20"
        >
          <div className="pointer-events-none absolute inset-0 z-0 mkt-hero-mesh" aria-hidden />
          <div
            className="pointer-events-none absolute -right-28 top-1/4 z-0 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(61,150,96,0.1)_0%,transparent_70%)] blur-3xl"
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
                  className={`mt-5 max-w-3xl text-[clamp(3rem,9vw,5rem)] leading-[0.95] tracking-[-0.04em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                >
                  {content.name}
                </h1>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p className="mt-6 max-w-lg text-[clamp(1.125rem,2.2vw,1.375rem)] font-light leading-relaxed tracking-[-0.01em] text-[var(--mkt-text1)]">
                  {content.promise}
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <div className="mt-10 flex flex-wrap gap-3">
                  <MarketingButtonLink href={content.primaryCta.href} variant="primaryLg">
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

        {/* How it works — denser editorial steps */}
        <MarketingSection id="how" tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label={content.how.label ?? "How it works"}
                title={content.how.title}
                subtitle={content.how.subtitle}
              />
            </MarketingReveal>
            <ol className="mkt-how-steps mt-14">
              {content.how.steps.map((item, index) => (
                <li key={item.step} className="mkt-how-step">
                  <MarketingReveal delay={index * 0.07}>
                    <p className={`${mktClass.mono} text-[0.75rem] text-[var(--mkt-green-l)]`}>
                      {item.step}
                    </p>
                    <h3
                      className={`mt-4 text-[clamp(1.25rem,2vw,1.5rem)] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                    >
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-sm text-[0.9375rem] leading-[1.7] text-[var(--mkt-text2)]">
                      {item.body}
                    </p>
                  </MarketingReveal>
                </li>
              ))}
            </ol>
            {content.support ? (
              <MarketingReveal delay={0.12}>
                <p className="mt-14 max-w-2xl border-t border-[var(--mkt-border)] pt-8 text-[0.9375rem] leading-relaxed text-[var(--mkt-text3)]">
                  {content.support}
                </p>
              </MarketingReveal>
            ) : null}
          </MarketingContainer>
        </MarketingSection>

        {/* Pricing */}
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
              className={`mt-14 grid gap-14 ${multiTier ? "md:grid-cols-2 md:gap-16" : "max-w-2xl"}`}
            >
              {content.pricing.tiers.map((tier, index) => (
                <MarketingReveal key={tier.name} delay={index * 0.06}>
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <p className={mktClass.label}>{tier.name}</p>
                      {tier.cadence ? (
                        <p className="text-sm text-[var(--mkt-text3)]">{tier.cadence}</p>
                      ) : null}
                    </div>
                    <p
                      className={`mt-4 text-[clamp(2.5rem,5vw,3.25rem)] leading-none tracking-[-0.045em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                    >
                      {tier.price}
                    </p>
                    <p className="mt-5 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                      {tier.summary}
                    </p>

                    <div className="mt-9">
                      <MarketingIncludes items={tier.features} />
                    </div>

                    {(tier.idealFor ?? content.idealFor) ? (
                      <MarketingIdealFor>
                        {tier.idealFor ?? content.idealFor!}
                      </MarketingIdealFor>
                    ) : null}

                    <div className="mt-9 flex flex-wrap gap-3">
                      <MarketingButtonLink
                        href={tier.ctaHref}
                        variant={tier.featured || !multiTier ? "primaryLg" : "ghostLg"}
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

        {/* Final CTA */}
        <MarketingSection tone="dark" className="mkt-cta-band !border-0">
          <MarketingContainer className="relative z-10 text-center">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.875rem,4vw,2.75rem)] tracking-[-0.025em] text-white ${mktClass.serif}`}
              >
                {content.finalCta.title}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[0.9375rem] font-light leading-relaxed text-white/65">
                {content.finalCta.subtitle}
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
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
