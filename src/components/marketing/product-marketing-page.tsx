import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import {
  MarketingContainer,
  MarketingPageShell,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { MarketingNav } from "@/components/marketing/marketing-nav";
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
        {/* 1. Hero */}
        <MarketingSection
          tone="green-tint"
          className="pt-[calc(var(--mkt-navh)+48px)] md:pt-[calc(var(--mkt-navh)+72px)]"
        >
          <MarketingContainer>
            <p className={mktClass.label}>
              {content.brandEyebrow ?? "DeliverX · Career progression"}
            </p>
            <h1
              className={`mt-4 max-w-3xl text-[clamp(2.5rem,7vw,4rem)] leading-[1.02] tracking-[-0.03em] text-[var(--mkt-text1)] ${mktClass.serif}`}
            >
              {content.name}
            </h1>
            <p className="mt-4 max-w-xl text-[clamp(1.125rem,2.2vw,1.35rem)] font-light leading-relaxed text-[var(--mkt-text1)]">
              {content.promise}
            </p>
            {content.support ? (
              <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                {content.support}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <MarketingButtonLink href={content.primaryCta.href} variant="primaryLg">
                {content.primaryCta.label}
              </MarketingButtonLink>
              <MarketingButtonLink href="/pricing" variant="ghostLg">
                View full pricing
              </MarketingButtonLink>
            </div>
          </MarketingContainer>
        </MarketingSection>

        {/* 2. How it works */}
        <MarketingSection id="how" tone="white">
          <MarketingContainer>
            <MarketingSectionIntro
              label={content.how.label ?? "How it works"}
              title={content.how.title}
              subtitle={content.how.subtitle}
            />
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {content.how.steps.map((item) => (
                <li key={item.step}>
                  <p className={`${mktClass.mono} text-[var(--mkt-green-l)]`}>{item.step}</p>
                  <h3
                    className={`mt-2 text-xl tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </MarketingContainer>
        </MarketingSection>

        {/* 3. Pricing */}
        <MarketingSection id="pricing" tone="cream">
          <MarketingContainer>
            <MarketingSectionIntro
              label="Pricing"
              title={content.pricing.title}
              subtitle={content.pricing.subtitle}
            />
            <div
              className={`mt-10 grid gap-10 ${multiTier ? "md:grid-cols-2" : "max-w-3xl"}`}
            >
              {content.pricing.tiers.map((tier) => (
                <div key={tier.name} className="border-t border-[var(--mkt-border)] pt-6">
                  <p className={mktClass.label}>{tier.name}</p>
                  <p
                    className={`mt-2 text-[clamp(2rem,4vw,2.75rem)] leading-none tracking-[-0.04em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                  >
                    {tier.price}
                  </p>
                  {tier.cadence ? (
                    <p className="mt-2 text-sm text-[var(--mkt-text3)]">{tier.cadence}</p>
                  ) : null}
                  <p className="mt-3 text-[0.9375rem] text-[var(--mkt-text2)]">{tier.summary}</p>
                  <p className="mt-6 text-[0.75rem] font-medium uppercase tracking-[0.08em] text-[var(--mkt-text3)]">
                    What&apos;s included
                  </p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex gap-2 text-[0.875rem] text-[var(--mkt-text2)]"
                      >
                        <span
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--mkt-green-l)]"
                          aria-hidden
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {(tier.idealFor ?? content.idealFor) ? (
                    <p className="mt-6 text-[0.875rem] leading-relaxed text-[var(--mkt-text3)]">
                      <span className="font-medium text-[var(--mkt-text1)]">Ideal for </span>
                      {tier.idealFor ?? content.idealFor}
                    </p>
                  ) : null}
                  <div className="mt-6 flex flex-wrap gap-3">
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
              ))}
            </div>
          </MarketingContainer>
        </MarketingSection>

        {/* 4. Final CTA */}
        <MarketingSection tone="dark">
          <MarketingContainer className="relative z-10 text-center">
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
          </MarketingContainer>
        </MarketingSection>
      </main>

      <MarketingFooter cta={content.footerCta} />
    </MarketingPageShell>
  );
}
