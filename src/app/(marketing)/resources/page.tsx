import type { Metadata } from "next";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import {
  MarketingContainer,
  MarketingSection,
} from "@/components/marketing/marketing-layout";
import { MarketingReveal } from "@/components/marketing/marketing-reveal";
import { COMPANY_MISSION } from "@/lib/marketing/career-suite";
import { mktClass } from "@/lib/marketing/landing-theme";

export const metadata: Metadata = {
  title: "Resources — DeliverX",
  description:
    "Guides and starting points for building product experience, landing opportunities and succeeding in the role.",
};

const RESOURCES = [
  {
    title: "Start with Experience",
    body: "Build practical Product Management experience inside an AI-powered company before you apply.",
    href: "/experience",
    label: "Explore Experience",
  },
  {
    title: "Prepare with Launchpad",
    body: "Turn experience into interviews — Career Intelligence, evidence CV packaging, portfolio and interview lab.",
    href: "/launchpad",
    label: "Explore Launchpad",
  },
  {
    title: "Deliver with Professional Workspace",
    body: "Work with role-based AI teammates on meetings, artefacts, decisions and evidence — AI drafts; you decide.",
    href: "/professional-workspace",
    label: "Explore Professional Workspace",
  },
  {
    title: "Pilot access & Complete Journey",
    body: "Open pilot access across stages — or explore the full connected path.",
    href: "/pricing",
    label: "See pilot access",
  },
] as const;

export default function ResourcesPage() {
  return (
    <>
      <main id="main-content">
        <MarketingSection
          tone="cream"
          className="pt-[calc(var(--mkt-navh)+48px)] md:pt-[calc(var(--mkt-navh)+72px)]"
        >
          <MarketingContainer className="max-w-2xl">
            <MarketingReveal>
              <p className={mktClass.label}>Resources</p>
              <h1 className={`mt-4 ${mktClass.sectionTitle}`}>Start where you are.</h1>
              <p className="mt-5 text-[0.9375rem] leading-[1.75] text-[var(--mkt-text2)]">
                Short paths into the DeliverX products. Deeper guides and content will land here as
                the platform grows.
              </p>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="white">
          <MarketingContainer>
            <ul className="grid gap-4 sm:grid-cols-2 md:gap-5">
              {RESOURCES.map((item, index) => (
                <li key={item.href}>
                  <MarketingReveal delay={index * 0.04}>
                    <div className={`${mktClass.softPanelLight} flex h-full flex-col p-7 md:p-8`}>
                      <h2
                        className={`text-[1.35rem] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                      >
                        {item.title}
                      </h2>
                      <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                        {item.body}
                      </p>
                      <MarketingButtonLink href={item.href} variant="ghost" className="mt-6 self-start">
                        {item.label}
                      </MarketingButtonLink>
                    </div>
                  </MarketingReveal>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </MarketingSection>
      </main>
      <MarketingFooter
        cta={{
          title: "Ready to begin?",
          subtitle: COMPANY_MISSION,
          href: "/signup",
          label: "Start Free",
        }}
      />
    </>
  );
}
