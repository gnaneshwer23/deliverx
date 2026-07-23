import type { Metadata } from "next";
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
import {
  XPERIENCE_INCLUDES,
  XPERIENCE_JOURNEY,
  XPERIENCE_PRICING,
  XPERIENCE_SIGNUP_HREF,
} from "@/lib/marketing/xperience-data";

export const metadata: Metadata = {
  title: "Xperience — Your first product role starts here",
  description:
    "Join a living AI-powered company, work with realistic teams, make consequential decisions and build evidence of how you perform.",
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/launchpad", label: "Launchpad" },
  { href: "/team-copilot", label: "Team Co-pilot" },
  { href: "#pricing", label: "Pricing" },
] as const;

export default function XperiencePage() {
  return (
    <MarketingPageShell>
      <MarketingNav
        links={NAV}
        primaryCta={{ href: XPERIENCE_SIGNUP_HREF, label: "Get access" }}
      />

      <main id="main-content">
        <MarketingSection
          tone="green-tint"
          className="pt-[calc(var(--mkt-navh)+48px)] md:pt-[calc(var(--mkt-navh)+72px)]"
        >
          <MarketingContainer>
            <p className={mktClass.label}>DeliverX · Product</p>
            <h1
              className={`mt-4 max-w-3xl text-[clamp(2.5rem,7vw,4rem)] leading-[1.02] tracking-[-0.03em] text-[var(--mkt-text1)] ${mktClass.serif}`}
            >
              Xperience
            </h1>
            <p className="mt-4 max-w-xl text-[clamp(1.0625rem,2vw,1.2rem)] font-light leading-relaxed text-[var(--mkt-text2)]">
              Your first product role starts here. Join an AI-powered company, inherit
              responsibility and build a record of how you think and deliver.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <MarketingButtonLink href={XPERIENCE_SIGNUP_HREF} variant="primaryLg">
                Get access — {XPERIENCE_PRICING.price}
              </MarketingButtonLink>
              <MarketingButtonLink href="/" variant="ghostLg">
                Back to DeliverX
              </MarketingButtonLink>
            </div>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="how" tone="white">
          <MarketingContainer>
            <MarketingSectionIntro
              label="How it works"
              title={
                <>
                  Work, not learning. <em>Evidence</em>, not certificates.
                </>
              }
              subtitle="You join a company — not a course. Decisions have consequences. Evidence comes from the work."
            />
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {XPERIENCE_JOURNEY.map((item) => (
                <li key={item.step}>
                  <p className={`${mktClass.mono} text-[var(--mkt-green-l)]`}>{item.step}</p>
                  <h3 className={`mt-2 text-xl tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}>
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="pricing" tone="cream">
          <MarketingContainer>
            <MarketingSectionIntro
              label="Pricing"
              title="One professional readiness experience"
              subtitle="Separate from DeliverX workspace pricing."
            />
            <div className="mt-8 max-w-xl border-t border-[var(--mkt-border)] pt-8">
              <p className={`text-[clamp(2.5rem,5vw,3.25rem)] leading-none tracking-[-0.04em] text-[var(--mkt-text1)] ${mktClass.serif}`}>
                {XPERIENCE_PRICING.price}
              </p>
              <p className="mt-3 text-[0.9375rem] text-[var(--mkt-text2)]">
                {XPERIENCE_PRICING.cadence}. {XPERIENCE_PRICING.summary}
              </p>
              <ul className="mt-6 space-y-2">
                {XPERIENCE_INCLUDES.slice(0, 5).map((item) => (
                  <li key={item} className="flex gap-2 text-[0.875rem] text-[var(--mkt-text2)]">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--mkt-green-l)]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <MarketingButtonLink href={XPERIENCE_SIGNUP_HREF} variant="primaryLg" className="mt-8">
                {XPERIENCE_PRICING.cta}
              </MarketingButtonLink>
            </div>
          </MarketingContainer>
        </MarketingSection>
      </main>

      <MarketingFooter
        cta={{
          title: "Get Xperience access",
          subtitle: `${XPERIENCE_PRICING.price} one-time. Login credentials after checkout.`,
          href: XPERIENCE_SIGNUP_HREF,
          label: "Get access",
        }}
      />
    </MarketingPageShell>
  );
}
