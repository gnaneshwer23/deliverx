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
  title: "Xperience — Build a career before you have one",
  description:
    "Xperience is DeliverX’s professional simulation product. Enter a realistic workplace, do the work, and leave with inspectable evidence — then get login access after checkout.",
};

const XPERIENCE_NAV = [
  { href: "#journey", label: "Journey" },
  { href: "#pricing", label: "Pricing" },
  { href: "/", label: "DeliverX" },
] as const;

export default function XperiencePage() {
  return (
    <MarketingPageShell>
      <MarketingNav
        links={XPERIENCE_NAV}
        primaryCta={{ href: XPERIENCE_SIGNUP_HREF, label: "Get access" }}
      />

      <main id="main-content">
        <MarketingSection tone="green-tint" className="pt-[calc(var(--mkt-navh)+48px)] md:pt-[calc(var(--mkt-navh)+72px)]">
          <MarketingContainer>
            <p className={mktClass.label}>DeliverX · Product</p>
            <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-dx-display)] text-[clamp(2.5rem,7vw,4.25rem)] leading-[1.02] tracking-[-0.03em] text-[var(--mkt-text1)]">
              Xperience
            </h1>
            <p className="mt-5 max-w-xl text-[clamp(1.0625rem,2vw,1.25rem)] font-light leading-relaxed text-[var(--mkt-text2)]">
              Build a career before you have one. Work inside a realistic company simulation,
              create evidence employers can inspect, then unlock access after payment.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <MarketingButtonLink href={XPERIENCE_SIGNUP_HREF} variant="primaryLg">
                Get access — {XPERIENCE_PRICING.price}
              </MarketingButtonLink>
              <MarketingButtonLink href="#pricing" variant="ghostLg">
                View pricing
              </MarketingButtonLink>
            </div>
            <p className="mt-4 text-sm text-[var(--mkt-text3)]">
              Pay once · Receive login credentials · Start your simulation
            </p>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="journey" tone="white">
          <MarketingContainer>
            <MarketingSectionIntro
              label="How it works"
              title={
                <>
                  Work, not learning. <em>Evidence</em>, not certificates.
                </>
              }
              subtitle="One journey from application to portfolio — designed to feel like employment, not a course."
            />
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {XPERIENCE_JOURNEY.map((item) => (
                <li
                  key={item.step}
                  className="mkt-card rounded-2xl border border-[var(--mkt-border)] bg-[var(--mkt-s1)] p-6"
                >
                  <p className={`${mktClass.mono} text-[var(--mkt-green-l)]`}>{item.step}</p>
                  <h3 className={`mt-3 text-xl tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}>
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
              subtitle="Separate from DeliverX workspace pricing. Pay for Xperience, then receive login credentials to start."
            />
            <div className="mkt-card mt-10 max-w-2xl rounded-2xl border border-[var(--mkt-border)] bg-[var(--mkt-s1)] p-8 shadow-[var(--dx-shadow-sm)] md:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className={mktClass.label}>{XPERIENCE_PRICING.name}</p>
                  <p className={`mt-3 text-[clamp(2.75rem,6vw,3.75rem)] leading-none tracking-[-0.04em] text-[var(--mkt-text1)] ${mktClass.serif}`}>
                    {XPERIENCE_PRICING.price}
                  </p>
                  <p className="mt-3 text-[0.9375rem] text-[var(--mkt-text2)]">
                    {XPERIENCE_PRICING.cadence}. {XPERIENCE_PRICING.summary}
                  </p>
                </div>
                <MarketingButtonLink
                  href={XPERIENCE_PRICING.ctaHref}
                  variant="primaryLg"
                  className="shrink-0"
                >
                  {XPERIENCE_PRICING.cta}
                </MarketingButtonLink>
              </div>
              <ul className="mt-8 grid gap-3 border-t border-[var(--mkt-border)] pt-8 text-[0.9375rem] text-[var(--mkt-text2)] sm:grid-cols-2">
                {XPERIENCE_INCLUDES.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--mkt-green-l)]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="dark">
          <MarketingContainer className="relative z-10 text-center">
            <p className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-white/50">
              Next step
            </p>
            <h2 className={`mt-3 text-[clamp(1.75rem,4vw,2.5rem)] tracking-[-0.02em] text-white ${mktClass.serif}`}>
              Ready to start your simulation?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[0.9375rem] font-light leading-relaxed text-white/70">
              Create your account, complete payment, and we issue login credentials for Xperience.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MarketingButtonLink href={XPERIENCE_SIGNUP_HREF} variant="ctaLight">
                Get access — {XPERIENCE_PRICING.price}
              </MarketingButtonLink>
              <MarketingButtonLink href="/login" variant="ctaOutline">
                Already have credentials? Sign in
              </MarketingButtonLink>
            </div>
          </MarketingContainer>
        </MarketingSection>
      </main>

      <MarketingFooter
        cta={{
          title: "Get Xperience access",
          subtitle: "£49 one-time. Login credentials after checkout.",
          href: XPERIENCE_SIGNUP_HREF,
          label: "Get access",
        }}
      />
    </MarketingPageShell>
  );
}
