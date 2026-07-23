import Link from "next/link";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingIncludes } from "@/components/marketing/marketing-includes";
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
  const secondary = content.secondaryCta ?? { href: "/pricing", label: "See pricing" };
  const bundleHref = content.pricing.bundleHref ?? "/pricing#bundle";
  const bundleLabel = content.pricing.bundleLabel ?? "Or get the Complete Bundle";
  const finalSecondary = {
    href: content.finalCta.secondaryHref ?? "/pricing#bundle",
    label: content.finalCta.secondaryLabel ?? "Get the Complete Bundle",
  };

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
        {/* 1. Hero — product name + stage + promise + CTAs */}
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
                  {content.brandEyebrow ?? `DeliverX · ${content.stage}`}
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
                <p className="mt-3 text-[0.8125rem] font-medium tracking-wide text-[var(--mkt-green)]">
                  {content.stage}
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p className="mt-5 max-w-xl text-[clamp(1.125rem,2.2vw,1.375rem)] font-light leading-relaxed tracking-[-0.01em] text-[var(--mkt-text1)]">
                  {content.promise}
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <div className="mt-10 flex flex-wrap gap-3">
                  <MarketingButtonLink href={content.primaryCta.href} variant="primaryLg">
                    {content.primaryCta.label}
                  </MarketingButtonLink>
                  <MarketingButtonLink href={secondary.href} variant="ghostLg">
                    {secondary.label}
                  </MarketingButtonLink>
                </div>
              </MarketingHeroItem>
            </MarketingHeroMotion>
          </MarketingContainer>
        </section>

        {/* 2. Problem / why it matters */}
        <MarketingSection id="why" tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label={content.problem.label ?? "Why it matters"}
                title={content.problem.title}
                subtitle={content.problem.body}
              />
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        {/* 3. How it works */}
        <MarketingSection id="how" tone="cream">
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
          </MarketingContainer>
        </MarketingSection>

        {/* 4. What's included */}
        <MarketingSection id="includes" tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label={content.includes.label ?? "What's included"}
                title={content.includes.title}
                subtitle={content.includes.subtitle}
              />
            </MarketingReveal>
            <MarketingReveal delay={0.08}>
              <div className="mt-12 max-w-3xl">
                <MarketingIncludes
                  items={content.includes.items}
                  highlightCount={content.includes.highlightCount}
                  hideLabel
                />
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        {/* 5. Ideal for */}
        <MarketingSection id="ideal-for" tone="cream">
          <MarketingContainer>
            <MarketingReveal>
              <p className={mktClass.label}>{content.idealFor.label ?? "Ideal for"}</p>
              {content.idealFor.title ? (
                <h2 className={`mt-3.5 max-w-2xl ${mktClass.sectionTitle}`}>
                  {content.idealFor.title}
                </h2>
              ) : null}
              <p className="mt-5 max-w-2xl text-[1.0625rem] leading-[1.75] text-[var(--mkt-text2)]">
                {content.idealFor.body}
              </p>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        {/* 6. This product's pricing + bundle link */}
        <MarketingSection id="pricing" tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label={content.pricing.label ?? "Pricing"}
                title={content.pricing.title}
                subtitle={content.pricing.subtitle}
              />
            </MarketingReveal>
            <MarketingReveal delay={0.08}>
              <div className="mkt-product-price mt-14 max-w-xl">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <p
                    className={`text-[clamp(2.75rem,5.5vw,3.5rem)] leading-none tracking-[-0.045em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                  >
                    {content.pricing.price}
                  </p>
                  <p className="text-sm text-[var(--mkt-text3)]">{content.pricing.cadence}</p>
                </div>
                <p className="mt-6 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                  {content.pricing.summary}
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <MarketingButtonLink href={content.pricing.ctaHref} variant="primaryLg">
                    {content.pricing.cta}
                  </MarketingButtonLink>
                  <Link
                    href={bundleHref}
                    className="text-[0.875rem] font-medium text-[var(--mkt-green)] no-underline underline-offset-4 hover:underline"
                  >
                    {bundleLabel} →
                  </Link>
                </div>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        {/* 7. Final CTA */}
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
                <MarketingButtonLink href={finalSecondary.href} variant="ctaOutline">
                  {finalSecondary.label}
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
