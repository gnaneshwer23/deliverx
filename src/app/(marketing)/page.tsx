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
import { mktClass } from "@/lib/marketing/landing-theme";
import { PRODUCT_NAV, SUITE_LIFECYCLE, SUITE_PRODUCTS } from "@/lib/marketing/suite-data";

export const metadata: Metadata = {
  title: "DeliverX — Build experience. Launch your role. Deliver with your team.",
  description:
    "DeliverX is the brand behind Xperience, Launchpad and Team Co-pilot. Build professional experience, launch into the role, then deliver with your team.",
};

export default function SuiteHomePage() {
  return (
    <MarketingPageShell>
      <MarketingNav links={PRODUCT_NAV} primaryCta={{ href: "/signup", label: "Get started" }} />

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
              Build experience. Launch your role. Deliver with your team.
            </h1>
            <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-[var(--mkt-text3)]">
              Three products. One brand. Choose where you start.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <MarketingButtonLink href="#products" variant="primaryLg">
                Explore products
              </MarketingButtonLink>
              <MarketingButtonLink href="/signup" variant="ghostLg">
                Get started
              </MarketingButtonLink>
            </div>
          </MarketingContainer>
        </section>

        {/* Three product links — detail lives on product pages */}
        <MarketingSection id="products" tone="white">
          <MarketingContainer>
            <p className={mktClass.label}>Products</p>
            <p
              className={`mt-3 max-w-xl text-[clamp(1.5rem,3vw,2rem)] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
            >
              Xperience · Launchpad · Team Co-pilot
            </p>
            <ul className="mt-12 grid gap-0 border-t border-[var(--mkt-border)] md:grid-cols-3 md:divide-x md:divide-[var(--mkt-border)]">
              {SUITE_PRODUCTS.map((product) => (
                <li key={product.id} className="border-b border-[var(--mkt-border)] md:border-b-0">
                  <Link
                    href={product.href}
                    className="group flex h-full flex-col px-0 py-8 no-underline transition md:px-8 md:first:pl-0 md:last:pr-0"
                  >
                    <h2
                      className={`text-2xl tracking-[-0.02em] text-[var(--mkt-text1)] transition group-hover:text-[var(--mkt-green)] ${mktClass.serif}`}
                    >
                      {product.name}
                    </h2>
                    <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                      {product.promise}
                    </p>
                    <span className="mt-6 text-[0.875rem] font-medium text-[var(--mkt-green)] underline-offset-4 group-hover:underline">
                      {product.cta} →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </MarketingSection>

        {/* Short path strip */}
        <MarketingSection tone="cream" className="!py-12 md:!py-14">
          <MarketingContainer>
            <ol className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              {SUITE_LIFECYCLE.map((step, index) => (
                <li key={step.name} className="flex items-center gap-3 sm:flex-1">
                  <span className={`${mktClass.mono} shrink-0 text-[var(--mkt-green-l)]`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.8125rem] font-medium text-[var(--mkt-text1)]">
                      {step.name}
                    </p>
                    <p className="text-[0.8125rem] text-[var(--mkt-text3)]">{step.line}</p>
                  </div>
                  {index < SUITE_LIFECYCLE.length - 1 ? (
                    <span
                      className="ml-auto hidden text-[var(--mkt-border-l)] sm:inline"
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
      </main>

      <MarketingFooter
        cta={{
          title: "Start with DeliverX",
          subtitle: "Open a product page for pricing and details — or create an account.",
          href: "#products",
          label: "View products",
        }}
      />
    </MarketingPageShell>
  );
}
