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
import { PRICING_TIERS } from "@/lib/marketing/landing-data";

export const metadata: Metadata = {
  title: "DeliverX — Delivery intelligence for every role",
  description:
    "AI suggests. Humans decide. DeliverX connects seven delivery roles in one signal graph so teams ship with clarity.",
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/xperience", label: "Xperience" },
  { href: "/launchpad", label: "Launchpad" },
  { href: "#pricing", label: "Pricing" },
] as const;

const PILLARS = [
  {
    title: "One signal graph",
    body: "Seven roles share the same delivery truth — no more reconciling Slack, Jira and decks.",
  },
  {
    title: "AI drafts. You approve.",
    body: "Updates, recommendations and artefacts are proposed by AI — nothing applies without human decision.",
  },
  {
    title: "From brief to delivery",
    body: "Onboard by role, structure the project, then run with RAID, decisions, standups and intelligence.",
  },
] as const;

export default function DeliverXProductPage() {
  const featuredTiers = PRICING_TIERS.slice(0, 2);

  return (
    <MarketingPageShell>
      <MarketingNav links={NAV} primaryCta={{ href: "/signup", label: "Start free trial" }} />

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
              AI suggests.
              <br />
              Humans decide.
              <br />
              <em className="not-italic text-[var(--mkt-green-l)]">Delivery happens.</em>
            </h1>
            <p className="mt-4 max-w-xl text-[clamp(1.0625rem,2vw,1.2rem)] font-light leading-relaxed text-[var(--mkt-text2)]">
              Delivery intelligence for every role on the team — once you are in a real company and
              need the work to stay on track.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <MarketingButtonLink href="/signup" variant="primaryLg">
                Start free trial
              </MarketingButtonLink>
              <MarketingButtonLink href="/" variant="ghostLg">
                Back to platform
              </MarketingButtonLink>
            </div>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="how" tone="white">
          <MarketingContainer>
            <MarketingSectionIntro
              label="Why DeliverX"
              title="Built for teams who already have the job"
              subtitle="Xperience and Launchpad build the professional. DeliverX strengthens them at work."
            />
            <ul className="mt-10 grid gap-8 md:grid-cols-3">
              {PILLARS.map((pillar) => (
                <li key={pillar.title}>
                  <h3 className={`text-xl tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}>
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                    {pillar.body}
                  </p>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="pricing" tone="cream">
          <MarketingContainer>
            <MarketingSectionIntro
              label="Pricing"
              title="Start with a free trial"
              subtitle="Workspace pricing is separate from Xperience and Launchpad."
            />
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {featuredTiers.map((tier) => (
                <div key={tier.name} className="border-t border-[var(--mkt-border)] pt-6">
                  <p className={mktClass.label}>{tier.name}</p>
                  <p
                    className={`mt-2 text-[clamp(1.75rem,3vw,2.25rem)] leading-none tracking-[-0.03em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                  >
                    {tier.price}
                    {tier.period ? (
                      <span className="ml-1 text-base font-sans font-normal text-[var(--mkt-text3)]">
                        {tier.period}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-3 text-[0.9375rem] text-[var(--mkt-text2)]">{tier.desc}</p>
                  <MarketingButtonLink
                    href={tier.ctaHref}
                    variant="primaryLg"
                    className="mt-6"
                  >
                    {tier.cta}
                  </MarketingButtonLink>
                </div>
              ))}
            </div>
          </MarketingContainer>
        </MarketingSection>
      </main>

      <MarketingFooter
        cta={{
          title: "Start your free trial",
          subtitle: "30-day trial, no credit card. First project live in 15 minutes.",
          href: "/signup",
          label: "Start free trial",
        }}
      />
    </MarketingPageShell>
  );
}
