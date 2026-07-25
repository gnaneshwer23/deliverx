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
  CAREER_TIERS,
  type CareerTier,
} from "@/lib/marketing/career-suite";
import { mktClass } from "@/lib/marketing/landing-theme";

export const metadata: Metadata = {
  title: "Pilot access — Complete Journey | DeliverX",
  description:
    "Open pilot access to Experience, Launchpad and Professional Workspace. Paid plans are not live yet — join the pilot to explore the connected career path.",
  openGraph: {
    title: "DeliverX Pilot Access",
    description: CAREER_PROGRESSION_LINE,
  },
};

function TierCard({ tier }: { tier: CareerTier }) {
  return (
    <article id={tier.id} className="mkt-pricing-tier flex h-full flex-col">
      <p className={`${mktClass.label} text-[var(--mkt-green)]`}>{tier.stage}</p>
      <h3
        className={`mt-4 text-[clamp(1.35rem,2.4vw,1.625rem)] tracking-[-0.025em] text-[var(--mkt-text1)] ${mktClass.serif}`}
      >
        {tier.productName}
      </h3>
      <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-[var(--mkt-text2)]">
        {tier.designedFor}
      </p>
      <div className="mt-8">
        <p
          className={`text-[clamp(1.5rem,2.5vw,1.875rem)] leading-none tracking-[-0.03em] text-[var(--mkt-text1)] ${mktClass.serif}`}
        >
          {tier.price}
        </p>
        <p className="mt-2 text-[0.75rem] text-[var(--mkt-text3)]">{tier.cadence}</p>
      </div>
      <div className="mt-7 flex flex-col gap-3">
        <MarketingButtonLink href={tier.ctaHref} variant="primary" className="w-full justify-center">
          {tier.cta}
        </MarketingButtonLink>
        {tier.href.startsWith("/") && !tier.href.includes("#") ? (
          <Link
            href={tier.href}
            className="text-center text-[0.8125rem] font-medium text-[var(--mkt-green)] no-underline underline-offset-4 hover:underline"
          >
            Read the full page →
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function BundleBlock({ tier }: { tier: CareerTier }) {
  return (
    <article className="mkt-bundle-panel">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <p className={`${mktClass.label} !text-white/55`}>Recommended</p>
          <h2
            className={`mt-3 text-[clamp(1.875rem,3.5vw,2.5rem)] tracking-[-0.03em] text-white ${mktClass.serif}`}
          >
            {tier.productName}
          </h2>
          <p
            className={`mt-5 max-w-lg text-[clamp(1.05rem,2vw,1.25rem)] font-light leading-relaxed text-white/90 ${mktClass.serif}`}
          >
            {tier.headline}
          </p>
          <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-white/65">
            {tier.summary}
          </p>
        </div>
        <div className="text-left md:text-right">
          <p
            className={`text-[clamp(1.75rem,3.5vw,2.25rem)] leading-none tracking-[-0.03em] text-white ${mktClass.serif}`}
          >
            {tier.price}
          </p>
          <p className="mt-2 text-sm text-white/55">{tier.cadence}</p>
          <p className="mt-1 text-[0.75rem] text-white/70">Connected path across all three products</p>
        </div>
      </div>

      <div className="mt-10 max-w-3xl">
        <MarketingIncludes items={tier.includes} highlightCount={8} tone="dark" />
      </div>

      <MarketingIdealFor tone="dark">{tier.idealFor}</MarketingIdealFor>

      <div className="mt-9 flex flex-wrap gap-3">
        <MarketingButtonLink href={tier.ctaHref} variant="ctaLight">
          Join the pilot
        </MarketingButtonLink>
        <MarketingButtonLink href="/#products" variant="ctaOutline">
          Compare products
        </MarketingButtonLink>
      </div>
    </article>
  );
}

export default function PricingPage() {
  return (
    <MarketingPageShell>
      <MarketingNav primaryCta={{ href: CAREER_BUNDLE.ctaHref, label: "Join the pilot" }} />

      <main id="main-content">
        <section
          id="hero"
          className="relative overflow-hidden bg-gradient-to-b from-[var(--mkt-mist)] via-[var(--mkt-ink)] to-[var(--mkt-cream)] pt-[calc(var(--mkt-navh)+72px)] pb-20 md:pt-[calc(var(--mkt-navh)+96px)] md:pb-24"
        >
          <div className="pointer-events-none absolute inset-0 z-0 mkt-hero-mesh" aria-hidden />
          <MarketingContainer className="relative z-[1]">
            <MarketingHeroMotion>
              <div className="mx-auto max-w-2xl text-center">
                <MarketingHeroItem>
                  <p className={mktClass.label}>DeliverX · Pilot access</p>
                </MarketingHeroItem>
                <MarketingHeroItem>
                  <h1
                    className={`mt-4 text-[clamp(2.5rem,6.5vw,3.75rem)] leading-[1.02] tracking-[-0.035em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                  >
                    Open pilot. Paid plans later.
                  </h1>
                </MarketingHeroItem>
                <MarketingHeroItem>
                  <p className="mx-auto mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                    Create an account and explore Experience, Launchpad and Professional Workspace.
                    There is no checkout and no money-back offer until commercial packaging ships.
                  </p>
                </MarketingHeroItem>
              </div>
            </MarketingHeroMotion>
          </MarketingContainer>
        </section>

        <MarketingSection tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                align="center"
                label="Progression"
                title="Choose a stage — or the full path."
                subtitle="Each product stands alone during the pilot. The Complete Journey is the recommended path for the full career arc."
              />
            </MarketingReveal>
            <MarketingReveal delay={0.08}>
              <div className="mt-14 grid gap-4 md:grid-cols-3 md:gap-5">
                {CAREER_TIERS.map((tier) => (
                  <TierCard key={tier.id} tier={tier} />
                ))}
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="bundle" tone="cream">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                align="center"
                label="Complete Journey"
                title="Experience. Opportunity. Delivery."
                subtitle="Everything in Experience, Launchpad and Professional Workspace — open pilot access across the connected path."
              />
            </MarketingReveal>
            <MarketingReveal delay={0.08}>
              <div className="mt-12">
                <BundleBlock tier={CAREER_BUNDLE} />
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="promise" tone="white">
          <MarketingContainer className="max-w-2xl">
            <MarketingReveal>
              <div className={`${mktClass.softPanelLight} p-8 md:p-10`}>
                <p className={mktClass.label}>Our promise</p>
                <h2 className={`mt-4 ${mktClass.sectionTitle}`}>{CAREER_PROMISE.title}</h2>
                <p className="mt-5 text-[0.9375rem] leading-[1.7] text-[var(--mkt-text2)]">
                  {CAREER_PROMISE.body}
                </p>
                <p className="mt-8 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                  What the pilot is designed to help you build:
                </p>
                <ul className="mt-5 space-y-3">
                  {CAREER_PROMISE.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="grid grid-cols-[auto_1fr] gap-3 text-[0.9375rem] text-[var(--mkt-text2)]"
                    >
                      <span
                        className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-[var(--mkt-green-l)]"
                        aria-hidden
                      />
                      {outcome}
                    </li>
                  ))}
                </ul>
                <div className="mt-12 border-t border-[var(--mkt-border)] pt-9">
                  <h3
                    className={`text-[1.35rem] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                  >
                    {CAREER_PROMISE.guaranteeTitle}
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-[1.7] text-[var(--mkt-text2)]">
                    {CAREER_PROMISE.guaranteeBody}
                  </p>
                  <p className="mt-6 text-[0.8125rem] leading-relaxed text-[var(--mkt-text3)]">
                    {CAREER_PROMISE.disclaimer}
                  </p>
                </div>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="dark" className="mkt-cta-band !border-0">
          <MarketingContainer className="relative z-10 text-center">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.75rem,4vw,2.5rem)] tracking-[-0.025em] text-white ${mktClass.serif}`}
              >
                {CAREER_PROGRESSION_LINE}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[0.9375rem] font-light leading-relaxed text-white/65">
                Join one product — or explore the Complete Journey. No payment required during the pilot.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <MarketingButtonLink href={CAREER_BUNDLE.ctaHref} variant="ctaLight">
                  Join the pilot
                </MarketingButtonLink>
                <MarketingButtonLink href="#xperience" variant="ctaOutline">
                  Explore a single product
                </MarketingButtonLink>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>
      </main>

      <MarketingFooter
        cta={{
          title: "Start your career journey",
          subtitle:
            "Open pilot access across Experience, Launchpad and Professional Workspace — paid plans not yet live.",
          href: CAREER_BUNDLE.ctaHref,
          label: "Join the pilot",
        }}
      />
    </MarketingPageShell>
  );
}
