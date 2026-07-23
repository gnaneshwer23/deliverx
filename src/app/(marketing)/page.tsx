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
  CAREER_PROGRESSION_LINE,
  CAREER_STORY_LINE,
} from "@/lib/marketing/career-suite";
import { mktClass } from "@/lib/marketing/landing-theme";
import { PRODUCT_NAV, SUITE_LIFECYCLE, SUITE_PRODUCTS } from "@/lib/marketing/suite-data";

export const metadata: Metadata = {
  title: "DeliverX — Build the experience. Advance your career. Deliver with confidence.",
  description:
    "DeliverX is the complete career intelligence platform: Xperience, Launchpad and Team Co-pilot. Build the experience → Land the opportunity → Succeed in the role.",
  openGraph: {
    title: "DeliverX",
    description: CAREER_PROGRESSION_LINE,
  },
};

export default function SuiteHomePage() {
  return (
    <MarketingPageShell>
      <MarketingNav links={PRODUCT_NAV} primaryCta={{ href: "/pricing", label: "View pricing" }} />

      <main id="main-content">
        {/* Brand hero — DeliverX first, one composition */}
        <section
          id="hero"
          className="relative flex min-h-[calc(100svh-var(--mkt-navh))] flex-col justify-center overflow-hidden bg-gradient-to-b from-[#EEF5F1] via-[var(--mkt-ink)] to-[var(--mkt-ink)] pt-[var(--mkt-navh)] pb-20"
        >
          <div className="pointer-events-none absolute inset-0 z-0 mkt-hero-mesh" aria-hidden />
          <div
            className="pointer-events-none absolute -left-40 top-1/4 z-0 size-[480px] rounded-full bg-[radial-gradient(circle,rgba(61,150,96,0.14)_0%,transparent_70%)] blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-28 bottom-1/5 z-0 size-[380px] rounded-full bg-[radial-gradient(circle,rgba(28,74,46,0.1)_0%,transparent_70%)] blur-3xl"
            aria-hidden
          />

          <MarketingContainer className="relative z-[1]">
            <MarketingHeroMotion>
              <MarketingHeroItem>
                <p
                  className={`text-[clamp(3.25rem,9vw,6rem)] leading-[0.92] tracking-[-0.045em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                >
                  DeliverX
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <h1 className="mt-7 max-w-2xl text-[clamp(1.2rem,2.4vw,1.5rem)] font-light leading-relaxed text-[var(--mkt-text2)]">
                  {CAREER_PROGRESSION_LINE}
                </h1>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-[var(--mkt-text3)]">
                  {CAREER_STORY_LINE}
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <MarketingButtonLink href="#path" variant="primaryLg" className="mkt-card-lift">
                    See the path
                  </MarketingButtonLink>
                  <MarketingButtonLink href="/pricing" variant="ghostLg">
                    View pricing
                  </MarketingButtonLink>
                </div>
              </MarketingHeroItem>
            </MarketingHeroMotion>
          </MarketingContainer>
        </section>

        {/* Progression path — one job: show the three-stage arc */}
        <MarketingSection id="path" tone="cream" className="!py-14 md:!py-16">
          <MarketingContainer>
            <MarketingReveal>
              <p className={mktClass.label}>Career progression</p>
              <p
                className={`mt-3 max-w-xl text-[clamp(1.35rem,2.8vw,1.75rem)] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
              >
                Three stages. One continuous path.
              </p>
            </MarketingReveal>

            <MarketingReveal delay={0.08}>
              <ol className="mkt-progression mt-10 grid gap-0 md:grid-cols-3">
                {SUITE_LIFECYCLE.map((step, index) => (
                  <li
                    key={step.name}
                    className="relative border-t border-[var(--mkt-border)] py-6 md:border-t-0 md:border-l md:border-[var(--mkt-border)] md:px-8 md:py-2 md:first:border-l-0 md:first:pl-0"
                  >
                    <span className={`${mktClass.mono} text-[var(--mkt-green-l)]`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-3 text-[0.9375rem] font-medium text-[var(--mkt-text1)]">
                      {step.line}
                    </p>
                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--mkt-text3)]">
                      <span className="text-[var(--mkt-text2)]">{step.name}</span>
                      {" · "}
                      {step.outcome}
                    </p>
                  </li>
                ))}
              </ol>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        {/* Three stages — one job: explore each product */}
        <MarketingSection id="products" tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <p className={mktClass.label}>The complete path</p>
              <p
                className={`mt-3 max-w-xl text-[clamp(1.5rem,3vw,2.125rem)] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
              >
                One career journey. Three stages.
              </p>
            </MarketingReveal>

            <ul className="mt-12 space-y-0">
              {SUITE_PRODUCTS.map((product, index) => (
                <li key={product.id}>
                  <MarketingReveal delay={index * 0.06}>
                    <Link
                      href={product.href}
                      className="group grid gap-4 border-t border-[var(--mkt-border)] py-10 no-underline transition md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_auto] md:items-end md:gap-10 md:py-12"
                    >
                      <div>
                        <p className={`${mktClass.label} text-[var(--mkt-green-l)]`}>
                          {String(index + 1).padStart(2, "0")} · {product.stage}
                        </p>
                        <h2
                          className={`mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] tracking-[-0.025em] text-[var(--mkt-text1)] transition group-hover:text-[var(--mkt-green)] ${mktClass.serif}`}
                        >
                          {product.name}
                        </h2>
                      </div>
                      <div className="max-w-lg">
                        <p className="text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                          {product.promise}
                        </p>
                        <p className="mt-2 text-[0.8125rem] text-[var(--mkt-text3)]">
                          {product.detail}
                        </p>
                      </div>
                      <span className="text-[0.875rem] font-medium text-[var(--mkt-green)] underline-offset-4 transition group-hover:underline md:pb-1">
                        {product.cta} →
                      </span>
                    </Link>
                  </MarketingReveal>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </MarketingSection>

        {/* Closing CTA */}
        <MarketingSection tone="dark" className="mkt-cta-band !border-0">
          <MarketingContainer className="relative z-10 text-center">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.75rem,4vw,2.5rem)] tracking-[-0.02em] text-white ${mktClass.serif}`}
              >
                Start your career progression
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[0.9375rem] font-light leading-relaxed text-white/70">
                Choose a stage — or take Xperience, Launchpad and Team Co-pilot together in the
                Complete Bundle.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <MarketingButtonLink href="/pricing" variant="ctaLight">
                  View pricing
                </MarketingButtonLink>
                <MarketingButtonLink href="/pricing#bundle" variant="ctaOutline">
                  See the bundle
                </MarketingButtonLink>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>
      </main>

      <MarketingFooter
        cta={{
          title: "Start your career progression",
          subtitle:
            "Choose a stage, or get Xperience + Launchpad + Team Co-pilot in the Complete Bundle.",
          href: "/pricing",
          label: "View pricing",
        }}
      />
    </MarketingPageShell>
  );
}
