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
import { mktClass } from "@/lib/marketing/landing-theme";
import { PRODUCT_NAV, SUITE_LIFECYCLE, SUITE_PRODUCTS } from "@/lib/marketing/suite-data";

export const metadata: Metadata = {
  title: "DeliverX — Build experience. Win the role. Deliver with intelligence.",
  description:
    "DeliverX is the brand behind Xperience, Launchpad and Team Co-pilot — build professional experience, earn the role, then deliver with AI-assisted intelligence.",
};

export default function SuiteHomePage() {
  return (
    <MarketingPageShell>
      <MarketingNav links={PRODUCT_NAV} primaryCta={{ href: "/signup", label: "Get started" }} />

      <main id="main-content">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#EEF5F1] via-[var(--mkt-ink)] to-[var(--mkt-ink)] pt-[calc(var(--mkt-navh)+48px)] pb-16 md:pt-[calc(var(--mkt-navh)+72px)] md:pb-24">
          <MarketingContainer>
            <p className={`${mktClass.label} text-[var(--mkt-green)]`}>DeliverX</p>
            <h1
              className={`mt-4 max-w-3xl text-[clamp(2.75rem,7vw,4.5rem)] leading-[1.02] tracking-[-0.03em] text-[var(--mkt-text1)] ${mktClass.serif}`}
            >
              Build experience.
              <br />
              Win the role.
              <br />
              <em className="not-italic text-[var(--mkt-green-l)]">Deliver with intelligence.</em>
            </h1>
            <p className="mt-5 max-w-xl text-[clamp(1.0625rem,2vw,1.2rem)] font-light leading-relaxed text-[var(--mkt-text2)]">
              One brand. Three products — Xperience, Launchpad and Team Co-pilot.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <MarketingButtonLink href="#products" variant="primaryLg">
                Explore products
              </MarketingButtonLink>
              <MarketingButtonLink href="/signup" variant="ghostLg">
                Get started
              </MarketingButtonLink>
            </div>
          </MarketingContainer>
        </section>

        <MarketingSection id="products" tone="white">
          <MarketingContainer>
            <MarketingSectionIntro
              label="Products"
              title="Three ways in. One DeliverX brand."
              subtitle="Each product has its own page, pricing and path. Start where you are."
            />
            <ul className="mt-12 grid gap-10 md:grid-cols-3">
              {SUITE_PRODUCTS.map((product, index) => (
                <li key={product.id} className="flex flex-col border-t border-[var(--mkt-border)] pt-6">
                  <p className={`${mktClass.mono} text-[var(--mkt-green-l)]`}>
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3
                    className={`mt-3 text-2xl tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                  >
                    {product.name}
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                    {product.promise}
                  </p>
                  <p className="mt-2 text-[0.8125rem] text-[var(--mkt-text3)]">{product.detail}</p>
                  <Link
                    href={product.href}
                    className="mt-6 inline-flex text-[0.875rem] font-medium text-[var(--mkt-green)] no-underline underline-offset-4 transition hover:underline"
                  >
                    {product.cta} →
                  </Link>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="cream">
          <MarketingContainer>
            <MarketingSectionIntro
              label="The path"
              title="How the suite fits together"
              subtitle="Build the professional. Earn the opportunity. Perform once hired."
            />
            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {SUITE_LIFECYCLE.map((step, index) => (
                <li key={step.name} className="flex items-start gap-4">
                  <span className={`${mktClass.mono} shrink-0 text-[var(--mkt-green-l)]`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className={`text-xl tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}>
                      {step.name}
                    </p>
                    <p className="mt-1 text-[0.9375rem] text-[var(--mkt-text2)]">{step.line}</p>
                  </div>
                </li>
              ))}
            </ol>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="dark">
          <MarketingContainer className="relative z-10 text-center">
            <h2 className={`text-[clamp(1.75rem,4vw,2.5rem)] tracking-[-0.02em] text-white ${mktClass.serif}`}>
              Start with the product that fits you
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[0.9375rem] font-light text-white/70">
              Or create an account and we&apos;ll guide you to the right path.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {SUITE_PRODUCTS.map((product) => (
                <MarketingButtonLink
                  key={product.id}
                  href={product.href}
                  variant={product.id === "team-copilot" ? "ctaLight" : "ctaOutline"}
                >
                  {product.name}
                </MarketingButtonLink>
              ))}
            </div>
          </MarketingContainer>
        </MarketingSection>
      </main>

      <MarketingFooter
        cta={{
          title: "Ready when you are",
          subtitle: "Xperience, Launchpad or Team Co-pilot — open a product page for details.",
          href: "#products",
          label: "View products",
        }}
      />
    </MarketingPageShell>
  );
}
