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
  LAUNCHPAD_AUDIENCES,
  LAUNCHPAD_PRICING,
  LAUNCHPAD_ROLES_HREF,
  LAUNCHPAD_TEAM,
} from "@/lib/marketing/launchpad-data";

export const metadata: Metadata = {
  title: "Launchpad | Build Professional Experience Before You Are Hired",
  description:
    "Join an AI-powered company, manage realistic products, work with stakeholders and build evidence-backed professional experience.",
  openGraph: {
    title: "Your experience starts here.",
    description:
      "Launchpad gives you a company, a role, a team and the responsibility to deliver.",
  },
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/xperience", label: "Xperience" },
  { href: "/team-copilot", label: "Team Co-pilot" },
  { href: "#pricing", label: "Pricing" },
] as const;

export default function LaunchpadPage() {
  return (
    <MarketingPageShell>
      <MarketingNav
        links={NAV}
        primaryCta={{ href: LAUNCHPAD_ROLES_HREF, label: "Explore Open Roles" }}
      />

      <main id="main-content">
        <MarketingSection
          tone="green-tint"
          className="pt-[calc(var(--mkt-navh)+48px)] md:pt-[calc(var(--mkt-navh)+72px)]"
        >
          <MarketingContainer>
            <p className={`${mktClass.label} text-[var(--mkt-green)]`}>Launchpad</p>
            <h1
              className={`mt-4 max-w-3xl text-[clamp(2.5rem,7vw,4rem)] leading-[1.02] tracking-[-0.03em] text-[var(--mkt-text1)] ${mktClass.serif}`}
            >
              Your experience starts here.
            </h1>
            <p className="mt-4 max-w-xl text-[clamp(1.0625rem,2vw,1.2rem)] font-light leading-relaxed text-[var(--mkt-text2)]">
              Join an AI-powered company. Work with realistic teams, manage live product challenges
              and build evidence of what you can do — before an employer gives you the title.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <MarketingButtonLink href={LAUNCHPAD_ROLES_HREF} variant="primaryLg">
                Explore Open Roles
              </MarketingButtonLink>
              <MarketingButtonLink href="/" variant="ghostLg">
                Back to DeliverX
              </MarketingButtonLink>
            </div>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="experience" tone="white">
          <MarketingContainer>
            <MarketingSectionIntro
              label="The experience"
              title={
                <>
                  You are not joining a course.
                  <br />
                  <em>You are joining a company.</em>
                </>
              }
              subtitle="Inherit a product, customers, constraints and commercial pressure. Every decision has a consequence. Your Career Record grows from authentic work."
            />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {LAUNCHPAD_TEAM.slice(0, 6).map((member) => (
                <li key={member.name}>
                  <p className={`text-lg tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}>
                    {member.name}
                  </p>
                  <p className={`${mktClass.label} mt-1`}>{member.role}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-2xl text-[0.875rem] text-[var(--mkt-text3)]">
              For {LAUNCHPAD_AUDIENCES.slice(0, 3).map((a) => a.title.toLowerCase()).join(", ")}{" "}
              and more.
            </p>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="pricing" tone="cream">
          <MarketingContainer>
            <MarketingSectionIntro
              label="Pricing"
              title="Start your first company experience"
              subtitle="No hidden course fees. Role and access shown before payment."
            />
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {LAUNCHPAD_PRICING.map((tier) => (
                <div key={tier.name} className="border-t border-[var(--mkt-border)] pt-6">
                  <p className={mktClass.label}>{tier.name}</p>
                  <p
                    className={`mt-2 text-[clamp(2rem,4vw,2.75rem)] leading-none tracking-[-0.04em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                  >
                    {tier.price}
                  </p>
                  <p className="mt-3 text-[0.9375rem] text-[var(--mkt-text2)]">{tier.summary}</p>
                  <ul className="mt-4 space-y-2">
                    {tier.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="text-[0.875rem] text-[var(--mkt-text2)]">
                        · {feature}
                      </li>
                    ))}
                  </ul>
                  <MarketingButtonLink
                    href={tier.ctaHref}
                    variant={tier.featured ? "primaryLg" : "ghostLg"}
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
          title: "Your experience starts here.",
          subtitle: "Free preview or Full Company Experience from £49.",
          href: LAUNCHPAD_ROLES_HREF,
          label: "Explore Open Roles",
        }}
      />
    </MarketingPageShell>
  );
}
