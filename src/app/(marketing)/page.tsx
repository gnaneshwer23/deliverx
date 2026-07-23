import type { Metadata } from "next";
import Link from "next/link";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
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
        {/* 1. Brand hero — DeliverX first, soft atmosphere, dual CTAs */}
        <section
          id="hero"
          className="relative flex min-h-[calc(100svh-var(--mkt-navh))] flex-col justify-center overflow-hidden bg-gradient-to-b from-[var(--mkt-mist)] via-[var(--mkt-ink)] to-[var(--mkt-cream)] pt-[var(--mkt-navh)] pb-28"
        >
          <div className="pointer-events-none absolute inset-0 z-0 mkt-hero-mesh" aria-hidden />
          <div
            className="pointer-events-none absolute left-1/2 top-0 z-0 h-[70%] w-[min(920px,100%)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(61,150,96,0.1)_0%,transparent_70%)] blur-2xl"
            aria-hidden
          />

          <MarketingContainer className="relative z-[1]">
            <MarketingHeroMotion>
              <div className="mx-auto max-w-3xl text-center">
                <MarketingHeroItem>
                  <p className={mktClass.label}>{COMPANY_POSITIONING}</p>
                </MarketingHeroItem>
                <MarketingHeroItem>
                  <p
                    className={`mt-6 text-[clamp(3.25rem,9vw,5.75rem)] leading-[0.92] tracking-[-0.05em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                  >
                    DeliverX
                  </p>
                </MarketingHeroItem>
                <MarketingHeroItem>
                  <h1 className="mx-auto mt-7 max-w-2xl text-[clamp(1.25rem,2.6vw,1.625rem)] font-medium leading-[1.35] tracking-[-0.02em] text-[var(--mkt-text1)]">
                    The complete journey to becoming a successful Product Manager.
                  </h1>
                </MarketingHeroItem>
                <MarketingHeroItem>
                  <p className="mx-auto mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-[var(--mkt-text3)]">
                    {CAREER_STORY_LINE}
                  </p>
                </MarketingHeroItem>
                <MarketingHeroItem>
                  <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
                    <MarketingButtonLink href="#products" variant="primaryLg">
                      Explore Products
                    </MarketingButtonLink>
                    <MarketingButtonLink href="/signup" variant="ghostLg">
                      Start Your Journey
                    </MarketingButtonLink>
                  </div>
                </MarketingHeroItem>
              </div>
            </MarketingHeroMotion>
          </MarketingContainer>
        </section>

        {/* 2. Three products — soft rounded panels */}
        <MarketingSection id="products" tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                align="center"
                label="Three products. One career journey."
                title="Build the experience → Land the opportunity → Succeed in the role."
                subtitle="Start at any stage — or move through the full path as one continuous journey."
              />
            </MarketingReveal>

            <ul className="mt-14 grid gap-4 md:grid-cols-3 md:gap-5">
              {SUITE_PRODUCTS.map((product, index) => {
                const emphasized = index === 1;
                return (
                  <li key={product.id}>
                    <MarketingReveal delay={index * 0.05}>
                      <Link
                        href={product.href}
                        className={`mkt-product-panel group flex h-full flex-col p-7 no-underline md:p-8 ${
                          emphasized ? "mkt-soft-panel-highlight" : "mkt-soft-panel"
                        }`}
                      >
                        <p
                          className={`${mktClass.label} ${
                            emphasized ? "!text-white/55" : "text-[var(--mkt-green)]"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")} · {product.stage}
                        </p>
                        <h2
                          className={`mt-5 text-[clamp(1.5rem,2.5vw,1.875rem)] tracking-[-0.03em] ${mktClass.serif} ${
                            emphasized
                              ? "text-white"
                              : "text-[var(--mkt-text1)] transition-colors duration-300 group-hover:text-[var(--mkt-green)]"
                          }`}
                        >
                          {product.name}
                        </h2>
                        <p
                          className={`mt-4 flex-1 text-[0.9375rem] leading-relaxed ${
                            emphasized ? "text-white/75" : "text-[var(--mkt-text2)]"
                          }`}
                        >
                          {product.promise}
                        </p>
                        <p
                          className={`mt-4 text-[0.8125rem] leading-relaxed ${
                            emphasized ? "text-white/50" : "text-[var(--mkt-text3)]"
                          }`}
                        >
                          {product.detail}
                        </p>
                        <span
                          className={`mt-8 text-[0.875rem] font-medium transition-transform duration-300 group-hover:translate-x-1 ${
                            emphasized ? "text-white" : "text-[var(--mkt-green)]"
                          }`}
                        >
                          {product.cta} →
                        </span>
                      </Link>
                    </MarketingReveal>
                  </li>
                );
              })}
            </ul>
          </MarketingContainer>
        </MarketingSection>

        {/* 3. Journey strip */}
        <MarketingSection id="journey" tone="cream">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                align="center"
                label="The journey"
                title="One progression. Three connected products."
              />
            </MarketingReveal>

            <MarketingReveal delay={0.08}>
              <ol className="mkt-progression mt-14">
                {SUITE_LIFECYCLE.map((step, index) => (
                  <li key={step.name} className="mkt-progression-item">
                    <span className={`${mktClass.mono} text-[0.75rem] text-[var(--mkt-green-l)]`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p
                      className={`mt-4 text-[clamp(1.25rem,2.2vw,1.5rem)] tracking-[-0.025em] text-[var(--mkt-text1)] ${mktClass.serif}`}
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

        {/* 4. The DeliverX Difference — soft cards, one highlighted */}
        <MarketingSection id="difference" tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                align="center"
                label="The DeliverX Difference"
                title="Why the journey works as one platform."
                subtitle="Practical experience, career intelligence and delivery support — connected end to end."
              />
            </MarketingReveal>

            <ul className="mt-14 grid gap-4 sm:grid-cols-2 md:gap-5">
              {SUITE_DIFFERENCE.map((point, index) => {
                const highlighted = index === 0;
                return (
                  <li key={point.title}>
                    <MarketingReveal delay={index * 0.05}>
                      <div
                        className={`h-full p-7 md:p-8 ${
                          highlighted ? "mkt-soft-panel-highlight" : "mkt-soft-panel-light"
                        }`}
                      >
                        <p
                          className={`${mktClass.mono} text-[0.75rem] ${
                            highlighted ? "text-white/50" : "text-[var(--mkt-green-l)]"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3
                          className={`mt-4 text-[clamp(1.2rem,2vw,1.4rem)] tracking-[-0.02em] ${mktClass.serif} ${
                            highlighted ? "text-white" : "text-[var(--mkt-text1)]"
                          }`}
                        >
                          {point.title}
                        </h3>
                        <p
                          className={`mt-3 max-w-sm text-[0.9375rem] leading-[1.7] ${
                            highlighted ? "text-white/70" : "text-[var(--mkt-text2)]"
                          }`}
                        >
                          {point.body}
                        </p>
                      </div>
                    </MarketingReveal>
                  </li>
                );
              })}
            </ul>
          </MarketingContainer>
        </MarketingSection>

        {/* 5. Mission + Complete Journey highlight band */}
        <MarketingSection id="offer" tone="cream" className="!pt-16 !pb-16 md:!py-20">
          <MarketingContainer>
            <MarketingReveal>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-stretch">
                <div className={`${mktClass.softPanelLight} flex flex-col justify-center p-8 md:p-10`}>
                  <p className={mktClass.label}>Our mission</p>
                  <p className="mt-5 text-[0.9375rem] leading-[1.75] text-[var(--mkt-text2)]">
                    {COMPANY_MISSION}
                  </p>
                </div>
                <Link
                  href="/pricing#bundle"
                  className="mkt-soft-panel-highlight group flex flex-col justify-between p-8 no-underline md:p-10"
                >
                  <div>
                    <p className={`${mktClass.label} !text-white/55`}>Recommended</p>
                    <p
                      className={`mt-4 text-[clamp(1.5rem,3vw,2rem)] tracking-[-0.025em] text-white ${mktClass.serif}`}
                    >
                      Complete Journey
                    </p>
                    <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-white/70">
                      12 months across Xperience, Launchpad and Team Co-pilot — the full career path
                      in one offer.
                    </p>
                  </div>
                  <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
                    <p
                      className={`text-[clamp(2rem,4vw,2.75rem)] leading-none tracking-[-0.04em] text-white ${mktClass.serif}`}
                    >
                      {CAREER_BUNDLE.price}
                    </p>
                    <span className="text-[0.875rem] font-medium text-white transition-transform duration-300 group-hover:translate-x-1">
                      View offer →
                    </span>
                  </div>
                </Link>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

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
