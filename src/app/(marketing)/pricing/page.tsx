import type { Metadata } from "next";
import Link from "next/link";
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
import {
  CAREER_BUNDLE,
  CAREER_PROGRESSION_LINE,
  CAREER_PROMISE,
  CAREER_STORY_LINE,
  CAREER_TIERS,
  type CareerTier,
} from "@/lib/marketing/career-suite";
import { mktClass } from "@/lib/marketing/landing-theme";
import { PRODUCT_NAV } from "@/lib/marketing/suite-data";

export const metadata: Metadata = {
  title: "Pricing — Complete Career Intelligence Platform | DeliverX",
  description:
    "Xperience £500, Launchpad £250, Team Co-pilot £500, or the Complete Career Bundle at £800 for 12 months. Build the experience → Land the opportunity → Succeed in the role.",
  openGraph: {
    title: "DeliverX Pricing",
    description: CAREER_PROGRESSION_LINE,
  },
};

function TierBlock({
  tier,
  featured,
  compact,
}: {
  tier: CareerTier;
  featured?: boolean;
  /** Summary layout for the three-stage grid */
  compact?: boolean;
}) {
  if (compact) {
    return (
      <article
        id={tier.id}
        className="flex h-full flex-col border-t border-[var(--mkt-border)] pt-7 md:border-t-0 md:border-l md:border-[var(--mkt-border)] md:px-8 md:pt-2 md:first:border-l-0 md:first:pl-0"
      >
        <p className={`${mktClass.label} text-[var(--mkt-green-l)]`}>{tier.stage}</p>
        <h2
          className={`mt-3 text-[clamp(1.5rem,2.5vw,1.875rem)] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
        >
          {tier.productName}
        </h2>
        <p
          className={`mt-4 text-[clamp(2rem,3.5vw,2.5rem)] leading-none tracking-[-0.04em] text-[var(--mkt-text1)] ${mktClass.serif}`}
        >
          {tier.price}
        </p>
        <p className="mt-1.5 text-sm text-[var(--mkt-text3)]">{tier.cadence}</p>
        <p className="mt-4 flex-1 text-[0.875rem] leading-relaxed text-[var(--mkt-text2)]">
          {tier.headline}
        </p>
        <ul className="mt-5 space-y-1.5">
          {tier.includes.slice(0, 4).map((item) => (
            <li key={item} className="flex gap-2 text-[0.8125rem] text-[var(--mkt-text3)]">
              <span
                className="mt-1.5 size-1 shrink-0 rounded-full bg-[var(--mkt-green-l)]"
                aria-hidden
              />
              {item}
            </li>
          ))}
          {tier.includes.length > 4 ? (
            <li className="pt-1 text-[0.75rem] text-[var(--mkt-text3)]">
              +{tier.includes.length - 4} more on the product page
            </li>
          ) : null}
        </ul>
        <div className="mt-7 flex flex-col gap-3">
          <MarketingButtonLink href={tier.ctaHref} variant="primary" className="mkt-card-lift">
            {tier.cta}
          </MarketingButtonLink>
          {tier.href.startsWith("/") && !tier.href.includes("#") ? (
            <Link
              href={tier.href}
              className="text-[0.8125rem] font-medium text-[var(--mkt-green)] no-underline underline-offset-4 hover:underline"
            >
              Learn more →
            </Link>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article
      id={tier.id}
      className={`border-t pt-8 ${featured ? "border-[var(--mkt-green-l)]" : "border-[var(--mkt-border)]"}`}
    >
      <p className={`${mktClass.label} ${featured ? "text-[var(--mkt-green-l)]" : ""}`}>
        {tier.stage}
      </p>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <h2
          className={`text-[clamp(1.75rem,3vw,2.25rem)] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
        >
          {tier.productName}
        </h2>
        <p
          className={`text-[clamp(2.25rem,4vw,3rem)] leading-none tracking-[-0.04em] text-[var(--mkt-text1)] ${mktClass.serif}`}
        >
          {tier.price}
        </p>
      </div>
      <p className="mt-1.5 text-sm text-[var(--mkt-text3)]">{tier.cadence}</p>
      <p
        className={`mt-5 max-w-2xl text-[clamp(1.05rem,2vw,1.25rem)] font-light text-[var(--mkt-text1)] ${mktClass.serif}`}
      >
        {tier.headline}
      </p>
      <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
        {tier.summary}
      </p>

      <div className="mt-8 max-w-3xl">
        <MarketingIncludes items={tier.includes} highlightCount={featured ? 8 : 6} />
      </div>

      <MarketingIdealFor>{tier.idealFor}</MarketingIdealFor>

      <div className="mt-8 flex flex-wrap gap-3">
        <MarketingButtonLink
          href={tier.ctaHref}
          variant={featured ? "primaryLg" : "primary"}
          className="mkt-card-lift"
        >
          {tier.cta}
        </MarketingButtonLink>
        {tier.href.startsWith("/") && !tier.href.includes("#") ? (
          <Link
            href={tier.href}
            className="inline-flex items-center text-[0.875rem] font-medium text-[var(--mkt-green)] no-underline underline-offset-4 hover:underline"
          >
            Learn more →
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export default function PricingPage() {
  return (
    <MarketingPageShell>
      <MarketingNav
        links={PRODUCT_NAV}
        primaryCta={{ href: CAREER_BUNDLE.ctaHref, label: "Get the bundle" }}
      />

      <main id="main-content">
        <section
          id="hero"
          className="relative overflow-hidden bg-gradient-to-b from-[#EEF5F1] via-[var(--mkt-ink)] to-[var(--mkt-ink)] pt-[calc(var(--mkt-navh)+56px)] pb-16 md:pt-[calc(var(--mkt-navh)+80px)] md:pb-20"
        >
          <div className="pointer-events-none absolute inset-0 z-0 mkt-hero-mesh" aria-hidden />
          <MarketingContainer className="relative z-[1]">
            <MarketingHeroMotion>
              <MarketingHeroItem>
                <p className={mktClass.label}>DeliverX · Pricing</p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <h1
                  className={`mt-4 max-w-3xl text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.05] tracking-[-0.03em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                >
                  The Complete Career Intelligence Platform
                </h1>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                  Everything you need to build professional experience, secure interviews, and
                  succeed in your first Product Management role.
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p className="mt-3 max-w-lg text-[0.875rem] text-[var(--mkt-text3)]">
                  {CAREER_STORY_LINE}
                </p>
              </MarketingHeroItem>
            </MarketingHeroMotion>
          </MarketingContainer>
        </section>

        {/* Three stages — compact comparison */}
        <MarketingSection tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label="Individual stages"
                title="Choose your stage"
                subtitle="Start where you are — or continue through the full career path."
              />
            </MarketingReveal>
            <MarketingReveal delay={0.08}>
              <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-0">
                {CAREER_TIERS.map((tier) => (
                  <TierBlock key={tier.id} tier={tier} compact />
                ))}
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        {/* Bundle emphasis */}
        <MarketingSection id="bundle" tone="cream">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label="Complete Career Bundle"
                title="Experience. Career. Delivery."
                subtitle="Everything in Xperience, Launchpad and Team Co-pilot — with 12 months of continuous access."
              />
            </MarketingReveal>
            <MarketingReveal delay={0.08}>
              <div className="mkt-bundle-panel mt-10 rounded-2xl border border-[rgba(61,150,96,0.22)] bg-gradient-to-br from-[#EEF5F1] via-[var(--mkt-s1)] to-[var(--mkt-ink)] px-6 py-8 md:px-10 md:py-10">
                <TierBlock tier={CAREER_BUNDLE} featured />
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        {/* Promise */}
        <MarketingSection id="promise" tone="white">
          <MarketingContainer className="max-w-3xl">
            <MarketingReveal>
              <p className={mktClass.label}>Our promise</p>
              <h2
                className={`mt-4 text-[clamp(1.75rem,4vw,2.5rem)] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
              >
                {CAREER_PROMISE.title}
              </h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                {CAREER_PROMISE.body}
              </p>
              <p className="mt-8 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                If you complete the programme, actively engage with the platform, and still do not
                gain:
              </p>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {CAREER_PROMISE.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-2 text-[0.9375rem] text-[var(--mkt-text2)]">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--mkt-green-l)]"
                      aria-hidden
                    />
                    {outcome}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[0.9375rem] font-medium text-[var(--mkt-text1)]">
                we&apos;ll refund your money.
              </p>
              <div className="mt-10 border-t border-[var(--mkt-border)] pt-8">
                <h3
                  className={`text-xl tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                >
                  {CAREER_PROMISE.guaranteeTitle}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                  {CAREER_PROMISE.guaranteeBody}
                </p>
                <p className="mt-6 text-[0.8125rem] leading-relaxed text-[var(--mkt-text3)]">
                  {CAREER_PROMISE.disclaimer}
                </p>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="dark" className="mkt-cta-band !border-0">
          <MarketingContainer className="relative z-10 text-center">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.75rem,4vw,2.5rem)] tracking-[-0.02em] text-white ${mktClass.serif}`}
              >
                {CAREER_PROGRESSION_LINE}
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[0.9375rem] font-light leading-relaxed text-white/70">
                Start with one stage — or take the Complete Career Bundle.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <MarketingButtonLink href={CAREER_BUNDLE.ctaHref} variant="ctaLight">
                  Get the Complete Bundle
                </MarketingButtonLink>
                <MarketingButtonLink href="/signup" variant="ctaOutline">
                  Create account
                </MarketingButtonLink>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>
      </main>

      <MarketingFooter
        cta={{
          title: "Start your career progression",
          subtitle: "£800 Complete Bundle · or choose Xperience, Launchpad or Team Co-pilot.",
          href: CAREER_BUNDLE.ctaHref,
          label: "Get the bundle",
        }}
      />
    </MarketingPageShell>
  );
}
