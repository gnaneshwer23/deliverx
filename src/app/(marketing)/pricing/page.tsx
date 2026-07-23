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
  title: "Pricing — Complete Journey | DeliverX",
  description:
    "Xperience £500, Launchpad £250, Team Co-pilot £500, or the Complete Journey at £800 for 12 months. Build the experience → Land the opportunity → Succeed in the role.",
  openGraph: {
    title: "DeliverX Pricing",
    description: CAREER_PROGRESSION_LINE,
  },
};

function ProgressionTable() {
  const rows = [...CAREER_TIERS, CAREER_BUNDLE];

  return (
    <div className="mkt-pricing-table overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--mkt-border)]">
            <th className={`${mktClass.label} pb-4 pr-6 font-medium`}>Plan</th>
            <th className={`${mktClass.label} pb-4 pr-6 font-medium`}>Designed for</th>
            <th className={`${mktClass.label} pb-4 font-medium`}>Price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((tier) => {
            const isBundle = tier.id === "bundle";
            return (
              <tr
                key={tier.id}
                id={tier.id}
                className={`border-b border-[var(--mkt-border)] align-top ${
                  isBundle ? "bg-[rgba(61,150,96,0.04)]" : ""
                }`}
              >
                <td className="py-6 pr-6">
                  <p
                    className={`text-[1.125rem] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                  >
                    {tier.productName}
                    {isBundle ? (
                      <span className="ml-2 text-[0.6875rem] font-sans font-medium uppercase tracking-[0.12em] text-[var(--mkt-green)]">
                        Recommended
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-[var(--mkt-text3)]">{tier.stage}</p>
                </td>
                <td className="py-6 pr-6">
                  <p className="max-w-sm text-[0.875rem] leading-relaxed text-[var(--mkt-text2)]">
                    {tier.designedFor}
                  </p>
                </td>
                <td className="py-6">
                  <p
                    className={`text-[1.5rem] leading-none tracking-[-0.03em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                  >
                    {tier.price}
                  </p>
                  <p className="mt-1.5 text-[0.75rem] text-[var(--mkt-text3)]">{tier.cadence}</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <MarketingButtonLink href={tier.ctaHref} variant="primary">
                      {isBundle ? "Start Complete Journey" : `Buy ${tier.productName}`}
                    </MarketingButtonLink>
                    {tier.href.startsWith("/") && !tier.href.includes("#") ? (
                      <Link
                        href={tier.href}
                        className="text-[0.8125rem] font-medium text-[var(--mkt-green)] no-underline underline-offset-4 hover:underline"
                      >
                        Read the full page →
                      </Link>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BundleBlock({ tier }: { tier: CareerTier }) {
  return (
    <article>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <p className={`${mktClass.label} text-[var(--mkt-green)]`}>Recommended</p>
          <h2
            className={`mt-3 text-[clamp(1.875rem,3.5vw,2.5rem)] tracking-[-0.03em] text-[var(--mkt-text1)] ${mktClass.serif}`}
          >
            {tier.productName}
          </h2>
          <p
            className={`mt-5 max-w-lg text-[clamp(1.05rem,2vw,1.25rem)] font-light leading-relaxed text-[var(--mkt-text1)] ${mktClass.serif}`}
          >
            {tier.headline}
          </p>
          <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
            {tier.summary}
          </p>
        </div>
        <div className="text-left md:text-right">
          <p
            className={`text-[clamp(2.75rem,5vw,3.75rem)] leading-none tracking-[-0.05em] text-[var(--mkt-text1)] ${mktClass.serif}`}
          >
            {tier.price}
          </p>
          <p className="mt-2 text-sm text-[var(--mkt-text3)]">{tier.cadence}</p>
          <p className="mt-1 text-[0.75rem] text-[var(--mkt-green)]">
            Best value across the full path
          </p>
        </div>
      </div>

      <div className="mt-10 max-w-3xl">
        <MarketingIncludes items={tier.includes} highlightCount={8} />
      </div>

      <MarketingIdealFor>{tier.idealFor}</MarketingIdealFor>

      <div className="mt-9 flex flex-wrap gap-3">
        <MarketingButtonLink href={tier.ctaHref} variant="primaryLg">
          Start the Complete Journey
        </MarketingButtonLink>
        <MarketingButtonLink href="/#products" variant="ghostLg">
          Compare products
        </MarketingButtonLink>
      </div>
    </article>
  );
}

export default function PricingPage() {
  return (
    <MarketingPageShell>
      <MarketingNav primaryCta={{ href: CAREER_BUNDLE.ctaHref, label: "Complete Journey" }} />

      <main id="main-content">
        <section
          id="hero"
          className="relative overflow-hidden bg-gradient-to-b from-[#EEF5F1] via-[var(--mkt-ink)] to-[var(--mkt-cream)] pt-[calc(var(--mkt-navh)+64px)] pb-16 md:pt-[calc(var(--mkt-navh)+88px)] md:pb-20"
        >
          <div className="pointer-events-none absolute inset-0 z-0 mkt-hero-mesh" aria-hidden />
          <MarketingContainer className="relative z-[1]">
            <MarketingHeroMotion>
              <MarketingHeroItem>
                <p className={mktClass.label}>DeliverX · Pricing</p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <h1
                  className={`mt-4 max-w-3xl text-[clamp(2.5rem,6.5vw,3.75rem)] leading-[1.02] tracking-[-0.035em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                >
                  Pricing that follows the journey.
                </h1>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p className="mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                  Buy the stage you need — or take the Complete Journey at £800 for 12 months across
                  Xperience, Launchpad and Team Co-pilot.
                </p>
              </MarketingHeroItem>
            </MarketingHeroMotion>
          </MarketingContainer>
        </section>

        <MarketingSection tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label="Progression"
                title="Plan · Designed for · Price"
                subtitle="Each product stands alone. The Complete Journey is the recommended path for the full career arc."
              />
            </MarketingReveal>
            <MarketingReveal delay={0.08}>
              <div className="mt-12">
                <ProgressionTable />
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="bundle" tone="green-tint">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label="Complete Journey"
                title="Experience. Opportunity. Delivery."
                subtitle="Everything in Xperience, Launchpad and Team Co-pilot — with 12 months of continuous access."
              />
            </MarketingReveal>
            <MarketingReveal delay={0.08}>
              <div className="mkt-bundle-panel mt-12 border-t border-[rgba(28,74,46,0.12)] pt-10">
                <BundleBlock tier={CAREER_BUNDLE} />
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="promise" tone="white">
          <MarketingContainer className="max-w-2xl">
            <MarketingReveal>
              <p className={mktClass.label}>Our promise</p>
              <h2 className={`mt-4 ${mktClass.sectionTitle}`}>{CAREER_PROMISE.title}</h2>
              <p className="mt-5 text-[0.9375rem] leading-[1.7] text-[var(--mkt-text2)]">
                {CAREER_PROMISE.body}
              </p>
              <p className="mt-8 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                If you complete the programme, actively engage with the platform, and still do not
                gain:
              </p>
              <ul className="mt-5 space-y-3">
                {CAREER_PROMISE.outcomes.map((outcome) => (
                  <li
                    key={outcome}
                    className="grid grid-cols-[auto_1fr] gap-3 text-[0.9375rem] text-[var(--mkt-text2)]"
                  >
                    <span
                      className="mt-[0.45rem] size-1 shrink-0 bg-[var(--mkt-green-l)]"
                      aria-hidden
                    />
                    {outcome}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[0.9375rem] font-medium text-[var(--mkt-text1)]">
                we&apos;ll refund your money.
              </p>
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
                Buy one product — or take the Complete Journey.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <MarketingButtonLink href={CAREER_BUNDLE.ctaHref} variant="ctaLight">
                  Start the Complete Journey
                </MarketingButtonLink>
                <MarketingButtonLink href="#xperience" variant="ctaOutline">
                  Buy a single product
                </MarketingButtonLink>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>
      </main>

      <MarketingFooter
        cta={{
          title: "Start your career journey",
          subtitle: "£800 Complete Journey · or choose Xperience, Launchpad or Team Co-pilot.",
          href: CAREER_BUNDLE.ctaHref,
          label: "Complete Journey",
        }}
      />
    </MarketingPageShell>
  );
}
