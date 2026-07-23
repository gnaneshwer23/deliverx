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

function TierBlock({ tier, featured }: { tier: CareerTier; featured?: boolean }) {
  return (
    <article
      id={tier.id}
      className={`border-t pt-8 ${featured ? "border-[var(--mkt-green-l)]" : "border-[var(--mkt-border)]"}`}
    >
      <p className={mktClass.label}>{tier.stage}</p>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <h2
          className={`text-[clamp(1.75rem,3vw,2.25rem)] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
        >
          {tier.productName}
        </h2>
        <p
          className={`text-[clamp(2rem,4vw,2.75rem)] leading-none tracking-[-0.04em] text-[var(--mkt-text1)] ${mktClass.serif}`}
        >
          {tier.price}
        </p>
      </div>
      <p className="mt-1 text-sm text-[var(--mkt-text3)]">{tier.cadence}</p>
      <p
        className={`mt-4 max-w-2xl text-[clamp(1.05rem,2vw,1.2rem)] font-light text-[var(--mkt-text1)] ${mktClass.serif}`}
      >
        {tier.headline}
      </p>
      <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
        {tier.summary}
      </p>
      <p className="mt-8 text-[0.75rem] font-medium uppercase tracking-[0.08em] text-[var(--mkt-text3)]">
        What&apos;s included
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {tier.includes.map((item) => (
          <li key={item} className="flex gap-2 text-[0.875rem] text-[var(--mkt-text2)]">
            <span
              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--mkt-green-l)]"
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-6 max-w-2xl text-[0.875rem] leading-relaxed text-[var(--mkt-text3)]">
        <span className="font-medium text-[var(--mkt-text1)]">Ideal for </span>
        {tier.idealFor}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <MarketingButtonLink href={tier.ctaHref} variant={featured ? "primaryLg" : "primary"}>
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
        <MarketingSection
          tone="green-tint"
          className="pt-[calc(var(--mkt-navh)+48px)] md:pt-[calc(var(--mkt-navh)+72px)]"
        >
          <MarketingContainer>
            <p className={mktClass.label}>DeliverX · Pricing</p>
            <h1
              className={`mt-4 max-w-3xl text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.05] tracking-[-0.03em] text-[var(--mkt-text1)] ${mktClass.serif}`}
            >
              The Complete Career Intelligence Platform
            </h1>
            <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
              Everything you need to build professional experience, secure interviews, and succeed
              in your first Product Management role.
            </p>
            <p className="mt-3 max-w-xl text-[0.9375rem] text-[var(--mkt-text3)]">
              {CAREER_STORY_LINE}
            </p>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="white">
          <MarketingContainer className="space-y-16">
            {CAREER_TIERS.map((tier) => (
              <TierBlock key={tier.id} tier={tier} />
            ))}
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="bundle" tone="cream">
          <MarketingContainer>
            <MarketingSectionIntro
              label="Complete Career Bundle"
              title="Experience. Career. Delivery."
              subtitle="Everything included in Xperience, Launchpad and Team Co-pilot — with 12 months of continuous access."
            />
            <div className="mt-10">
              <TierBlock tier={CAREER_BUNDLE} featured />
            </div>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="promise" tone="white">
          <MarketingContainer className="max-w-3xl">
            <p className={mktClass.label}>Our promise</p>
            <h2
              className={`mt-4 text-[clamp(1.75rem,4vw,2.5rem)] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
            >
              {CAREER_PROMISE.title}
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
              {CAREER_PROMISE.body}
            </p>
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
              If you complete the programme, actively engage with the platform, and still do not
              gain:
            </p>
            <ul className="mt-4 space-y-2">
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
            <p className="mt-4 text-[0.9375rem] text-[var(--mkt-text2)]">we&apos;ll refund your money.</p>
            <h3
              className={`mt-10 text-xl tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
            >
              {CAREER_PROMISE.guaranteeTitle}
            </h3>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
              {CAREER_PROMISE.guaranteeBody}
            </p>
            <p className="mt-6 text-[0.8125rem] leading-relaxed text-[var(--mkt-text3)]">
              {CAREER_PROMISE.disclaimer}
            </p>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="dark">
          <MarketingContainer className="relative z-10 text-center">
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
