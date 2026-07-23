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
  CAREER_TIERS,
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

const FROM_PRICE = CAREER_TIERS.reduce(
  (lowest, tier) => {
    const n = Number.parseInt(tier.price.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) && n < lowest ? n : lowest;
  },
  Number.POSITIVE_INFINITY,
);

export default function SuiteHomePage() {
  return (
    <MarketingPageShell>
      <MarketingNav links={PRODUCT_NAV} primaryCta={{ href: "/pricing", label: "View pricing" }} />

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
                <p
                  className={`text-[clamp(3.5rem,10vw,6.5rem)] leading-[0.9] tracking-[-0.05em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                >
                  DeliverX
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <h1 className="mt-8 max-w-xl text-[clamp(1.25rem,2.6vw,1.625rem)] font-light leading-[1.45] tracking-[-0.015em] text-[var(--mkt-text1)]">
                  {CAREER_PROGRESSION_LINE}
                </h1>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-[var(--mkt-text3)]">
                  {CAREER_STORY_LINE}
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <div className="mt-11 flex flex-wrap items-center gap-3">
                  <MarketingButtonLink href="#path" variant="primaryLg">
                    Explore path
                  </MarketingButtonLink>
                  <MarketingButtonLink href="/pricing" variant="ghostLg">
                    View pricing
                  </MarketingButtonLink>
                </div>
              </MarketingHeroItem>
            </MarketingHeroMotion>
          </MarketingContainer>
        </section>

        {/* 2. How the path works — editorial, not a dashboard */}
        <MarketingSection id="path" tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <p className={mktClass.label}>How the path works</p>
              <p className={`mt-3.5 max-w-lg ${mktClass.sectionTitle}`}>
                Three stages. One continuous journey.
              </p>
              <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                Build capability, land the opportunity, then succeed once you are in the role —
                stage by stage, or as one bundle.
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

        {/* 3. Three products — short promise + link into full page */}
        <MarketingSection id="products" tone="cream">
          <MarketingContainer>
            <MarketingReveal>
              <p className={mktClass.label}>The products</p>
              <p className={`mt-3.5 max-w-lg ${mktClass.sectionTitle}`}>
                Read each stage. Buy when you are ready.
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

        {/* 4. Reference offer strip */}
        <section
          id="offer"
          className="mkt-offer-strip scroll-mt-[var(--mkt-navh)] border-y border-[var(--mkt-border)] bg-[var(--mkt-s1)]"
        >
          <MarketingContainer>
            <MarketingReveal>
              <Link
                href="/pricing"
                className="group flex flex-col items-start justify-between gap-4 py-10 no-underline sm:flex-row sm:items-center sm:py-12"
              >
                <div>
                  <p className={mktClass.label}>Reference pricing</p>
                  <p
                    className={`mt-3 text-[clamp(1.35rem,2.8vw,1.75rem)] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                  >
                    From £{Number.isFinite(FROM_PRICE) ? FROM_PRICE : 250}
                    <span className="mx-2.5 text-[var(--mkt-border-l)]" aria-hidden>
                      ·
                    </span>
                    Bundle {CAREER_BUNDLE.price}
                  </p>
                  <p className="mt-2 text-[0.8125rem] text-[var(--mkt-text3)]">
                    Individual stages or 12 months of the full path.
                  </p>
                </div>
                <span className="text-[0.875rem] font-medium text-[var(--mkt-green)] transition-transform duration-300 group-hover:translate-x-1">
                  View pricing →
                </span>
              </Link>
            </MarketingReveal>
          </MarketingContainer>
        </section>

        {/* 5. Soft final CTA */}
        <MarketingSection tone="dark" className="mkt-cta-band !border-0">
          <MarketingContainer className="relative z-10 text-center">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.875rem,4vw,2.75rem)] tracking-[-0.025em] text-white ${mktClass.serif}`}
              >
                Start when the path makes sense
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[0.9375rem] font-light leading-relaxed text-white/65">
                Explore a product page, then buy that stage — or take Xperience, Launchpad and Team
                Co-pilot together in the Complete Bundle.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
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
