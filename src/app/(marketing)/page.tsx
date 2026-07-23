import type { Metadata } from "next";
import Link from "next/link";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import {
  MarketingContainer,
  MarketingPageShell,
  MarketingSection,
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
  CAREER_STORY_LINE,
  COMPANY_MISSION,
  COMPANY_POSITIONING,
} from "@/lib/marketing/career-suite";
import { mktClass } from "@/lib/marketing/landing-theme";
import {
  SUITE_DIFFERENCE,
  SUITE_LIFECYCLE,
  SUITE_PRODUCTS,
} from "@/lib/marketing/suite-data";

export const metadata: Metadata = {
  title: "DeliverX — AI Product Experience Company",
  description: COMPANY_MISSION,
  openGraph: {
    title: "DeliverX — AI Product Experience Company",
    description: CAREER_PROGRESSION_LINE,
  },
};

export default function SuiteHomePage() {
  return (
    <MarketingPageShell>
      <MarketingNav primaryCta={{ href: "/signup", label: "Start Free" }} />

      <main id="main-content">
        {/* 1. Brand hero — DeliverX first, one composition */}
        <section
          id="hero"
          className="relative flex min-h-[calc(100svh-var(--mkt-navh))] flex-col justify-center overflow-hidden bg-gradient-to-b from-[#EEF5F1] via-[var(--mkt-ink)] to-[var(--mkt-cream)] pt-[var(--mkt-navh)] pb-24"
        >
          <div className="pointer-events-none absolute inset-0 z-0 mkt-hero-mesh" aria-hidden />
          <div
            className="pointer-events-none absolute -left-40 top-1/4 z-0 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(61,150,96,0.12)_0%,transparent_70%)] blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-32 bottom-[12%] z-0 size-[400px] rounded-full bg-[radial-gradient(circle,rgba(28,74,46,0.08)_0%,transparent_70%)] blur-3xl"
            aria-hidden
          />

          <MarketingContainer className="relative z-[1]">
            <MarketingHeroMotion>
              <MarketingHeroItem>
                <p className={mktClass.label}>{COMPANY_POSITIONING}</p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p
                  className={`mt-5 text-[clamp(3.5rem,10vw,6.5rem)] leading-[0.9] tracking-[-0.05em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                >
                  DeliverX
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <h1 className="mt-8 max-w-2xl text-[clamp(1.35rem,2.8vw,1.75rem)] font-light leading-[1.4] tracking-[-0.015em] text-[var(--mkt-text1)]">
                  The complete journey to becoming a successful Product Manager.
                </h1>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-[var(--mkt-text3)]">
                  {CAREER_STORY_LINE}
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <div className="mt-11 flex flex-wrap items-center gap-3">
                  <MarketingButtonLink href="#products" variant="primaryLg">
                    Explore Products
                  </MarketingButtonLink>
                  <MarketingButtonLink href="/signup" variant="ghostLg">
                    Start Your Journey
                  </MarketingButtonLink>
                </div>
              </MarketingHeroItem>
            </MarketingHeroMotion>
          </MarketingContainer>
        </section>

        {/* 2. Three products — editorial journey */}
        <MarketingSection id="products" tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <p className={mktClass.label}>Three products. One career journey.</p>
              <p className={`mt-3.5 max-w-lg ${mktClass.sectionTitle}`}>
                Build the experience → Land the opportunity → Succeed in the role.
              </p>
              <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                Start at any stage — or move through the full path as one continuous journey.
              </p>
            </MarketingReveal>

            <ul className="mt-14">
              {SUITE_PRODUCTS.map((product, index) => (
                <li key={product.id}>
                  <MarketingReveal delay={index * 0.05}>
                    <Link
                      href={product.href}
                      className="mkt-product-row group grid gap-5 border-t border-[var(--mkt-border)] py-11 no-underline md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)_auto] md:items-end md:gap-12 md:py-14"
                    >
                      <div>
                        <p className={`${mktClass.label} text-[var(--mkt-green)]`}>
                          {String(index + 1).padStart(2, "0")} · {product.stage}
                        </p>
                        <h2
                          className={`mt-3 text-[clamp(1.875rem,3.8vw,2.75rem)] tracking-[-0.03em] text-[var(--mkt-text1)] transition-colors duration-300 group-hover:text-[var(--mkt-green)] ${mktClass.serif}`}
                        >
                          {product.name}
                        </h2>
                      </div>
                      <div className="max-w-md">
                        <p className="text-[1rem] leading-relaxed text-[var(--mkt-text1)]">
                          {product.promise}
                        </p>
                        <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-[var(--mkt-text3)]">
                          {product.detail}
                        </p>
                      </div>
                      <span className="text-[0.875rem] font-medium text-[var(--mkt-green)] transition-transform duration-300 group-hover:translate-x-1 md:pb-1">
                        {product.cta} →
                      </span>
                    </Link>
                  </MarketingReveal>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </MarketingSection>

        {/* 3. Journey strip */}
        <MarketingSection id="journey" tone="cream">
          <MarketingContainer>
            <MarketingReveal>
              <p className={mktClass.label}>The journey</p>
              <p className={`mt-3.5 max-w-lg ${mktClass.sectionTitle}`}>
                One progression. Three connected products.
              </p>
            </MarketingReveal>

            <MarketingReveal delay={0.08}>
              <ol className="mkt-progression mt-14">
                {SUITE_LIFECYCLE.map((step, index) => (
                  <li key={step.name} className="mkt-progression-item">
                    <span className={`${mktClass.mono} text-[0.75rem] text-[var(--mkt-green-l)]`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p
                      className={`mt-4 text-[clamp(1.35rem,2.4vw,1.75rem)] tracking-[-0.025em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                    >
                      {step.line}
                    </p>
                    <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--mkt-text3)]">
                      <span className="text-[var(--mkt-text2)]">{step.name}</span>
                      <span className="mx-1.5 text-[var(--mkt-border-l)]" aria-hidden>
                        ·
                      </span>
                      {step.outcome}
                    </p>
                  </li>
                ))}
              </ol>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        {/* 4. The DeliverX Difference */}
        <MarketingSection id="difference" tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <p className={mktClass.label}>The DeliverX Difference</p>
              <p className={`mt-3.5 max-w-lg ${mktClass.sectionTitle}`}>
                Why the journey works as one platform.
              </p>
            </MarketingReveal>

            <ul className="mt-14 grid gap-10 sm:grid-cols-2">
              {SUITE_DIFFERENCE.map((point, index) => (
                <li key={point.title}>
                  <MarketingReveal delay={index * 0.05}>
                    <p className={`${mktClass.mono} text-[0.75rem] text-[var(--mkt-green-l)]`}>
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3
                      className={`mt-3 text-[clamp(1.25rem,2vw,1.5rem)] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                    >
                      {point.title}
                    </h3>
                    <p className="mt-3 max-w-sm text-[0.9375rem] leading-[1.7] text-[var(--mkt-text2)]">
                      {point.body}
                    </p>
                  </MarketingReveal>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </MarketingSection>

        {/* 5. Mission + Complete Journey offer */}
        <section
          id="offer"
          className="mkt-offer-strip scroll-mt-[var(--mkt-navh)] border-y border-[var(--mkt-border)] bg-[var(--mkt-s1)]"
        >
          <MarketingContainer>
            <MarketingReveal>
              <div className="flex flex-col items-start justify-between gap-8 py-12 md:flex-row md:items-end md:py-14">
                <div className="max-w-xl">
                  <p className={mktClass.label}>Our mission</p>
                  <p className="mt-4 text-[0.9375rem] leading-[1.75] text-[var(--mkt-text2)]">
                    {COMPANY_MISSION}
                  </p>
                </div>
                <Link
                  href="/pricing#bundle"
                  className="group shrink-0 no-underline"
                >
                  <p className={mktClass.label}>Recommended</p>
                  <p
                    className={`mt-2 text-[clamp(1.35rem,2.8vw,1.75rem)] tracking-[-0.02em] text-[var(--mkt-text1)] transition-colors group-hover:text-[var(--mkt-green)] ${mktClass.serif}`}
                  >
                    Complete Journey · {CAREER_BUNDLE.price}
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-[var(--mkt-text3)]">
                    12 months across all three products →
                  </p>
                </Link>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </section>

        {/* 6. Soft final CTA */}
        <MarketingSection tone="dark" className="mkt-cta-band !border-0">
          <MarketingContainer className="relative z-10 text-center">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.875rem,4vw,2.75rem)] tracking-[-0.025em] text-white ${mktClass.serif}`}
              >
                Start your journey
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[0.9375rem] font-light leading-relaxed text-white/65">
                Explore the products, then buy a stage — or take Xperience, Launchpad and Team
                Co-pilot together in the Complete Journey.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <MarketingButtonLink href="/signup" variant="ctaLight">
                  Start Your Journey
                </MarketingButtonLink>
                <MarketingButtonLink href="/pricing" variant="ctaOutline">
                  View pricing
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
            "Choose a stage, or get Xperience + Launchpad + Team Co-pilot in the Complete Journey.",
          href: "/signup",
          label: "Start Free",
        }}
      />
    </MarketingPageShell>
  );
}
