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
        <section className="relative flex min-h-[calc(100svh-var(--mkt-navh))] flex-col justify-center overflow-hidden bg-gradient-to-b from-[#EEF5F1] via-[var(--mkt-ink)] to-[var(--mkt-ink)] pt-[var(--mkt-navh)] pb-16">
          <MarketingContainer>
            <p
              className={`text-[clamp(3rem,8vw,5.5rem)] leading-[0.95] tracking-[-0.04em] text-[var(--mkt-text1)] ${mktClass.serif}`}
            >
              DeliverX
            </p>
            <h1 className="mt-6 max-w-2xl text-[clamp(1.25rem,2.5vw,1.5rem)] font-light leading-relaxed text-[var(--mkt-text2)]">
              {CAREER_PROGRESSION_LINE}
            </h1>
            <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-[var(--mkt-text3)]">
              {CAREER_STORY_LINE}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <MarketingButtonLink href="#path" variant="primaryLg">
                See the path
              </MarketingButtonLink>
              <MarketingButtonLink href="/pricing" variant="ghostLg">
                View pricing
              </MarketingButtonLink>
            </div>
          </MarketingContainer>
        </section>

        {/* Progression path */}
        <MarketingSection id="path" tone="cream" className="!py-12 md:!py-14">
          <MarketingContainer>
            <p className={mktClass.label}>Career progression</p>
            <ol className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-stretch sm:justify-between sm:gap-4">
              {SUITE_LIFECYCLE.map((step, index) => (
                <li key={step.name} className="flex items-start gap-3 sm:flex-1">
                  <span className={`${mktClass.mono} shrink-0 text-[var(--mkt-green-l)]`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.8125rem] font-medium text-[var(--mkt-text1)]">
                      {step.line}
                    </p>
                    <p className="mt-1 text-[0.8125rem] text-[var(--mkt-text3)]">
                      {step.name} · {step.outcome}
                    </p>
                  </div>
                  {index < SUITE_LIFECYCLE.length - 1 ? (
                    <span
                      className="ml-auto hidden pt-1 text-[var(--mkt-border-l)] sm:inline"
                      aria-hidden
                    >
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </MarketingContainer>
        </MarketingSection>

        {/* Three stages */}
        <MarketingSection id="products" tone="white">
          <MarketingContainer>
            <p className={mktClass.label}>The complete path</p>
            <p
              className={`mt-3 max-w-xl text-[clamp(1.5rem,3vw,2rem)] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
            >
              One career journey. Three stages.
            </p>
            <ul className="mt-12 grid gap-0 border-t border-[var(--mkt-border)] md:grid-cols-3 md:divide-x md:divide-[var(--mkt-border)]">
              {SUITE_PRODUCTS.map((product) => (
                <li key={product.id} className="border-b border-[var(--mkt-border)] md:border-b-0">
                  <Link
                    href={product.href}
                    className="group flex h-full flex-col px-0 py-8 no-underline transition md:px-8 md:first:pl-0 md:last:pr-0"
                  >
                    <p className={`${mktClass.label} text-[var(--mkt-green-l)]`}>{product.stage}</p>
                    <h2
                      className={`mt-3 text-2xl tracking-[-0.02em] text-[var(--mkt-text1)] transition group-hover:text-[var(--mkt-green)] ${mktClass.serif}`}
                    >
                      {product.name}
                    </h2>
                    <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                      {product.promise}
                    </p>
                    <p className="mt-3 text-[0.8125rem] text-[var(--mkt-text3)]">{product.detail}</p>
                    <span className="mt-6 text-[0.875rem] font-medium text-[var(--mkt-green)] underline-offset-4 group-hover:underline">
                      {product.cta} →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </MarketingSection>
      </main>

      <MarketingFooter
        cta={{
          title: "Start your career progression",
          subtitle: "Choose a stage, or get Xperience + Launchpad + Team Co-pilot in the Complete Bundle.",
          href: "/pricing",
          label: "View pricing",
        }}
      />
    </MarketingPageShell>
  );
}
