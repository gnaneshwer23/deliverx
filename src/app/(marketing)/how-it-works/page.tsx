import type { Metadata } from "next";
import { HowItWorksPipeline, HowItWorksStepDiagram } from "@/components/marketing/how-it-works-diagrams";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import {
  MarketingContainer,
  MarketingPageShell,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingReveal } from "@/components/marketing/marketing-reveal";
import {
  HOW_IT_WORKS_FAQ,
  HOW_IT_WORKS_HANDOFFS,
  HOW_IT_WORKS_HERO,
  HOW_IT_WORKS_SOURCES,
  HOW_IT_WORKS_STEPS,
} from "@/lib/marketing/how-it-works-data";
import { mktClass } from "@/lib/marketing/landing-theme";

export const metadata: Metadata = {
  title: "How it works — DeliverX",
  description: HOW_IT_WORKS_HERO.support,
  openGraph: {
    title: "How DeliverX works",
    description: HOW_IT_WORKS_HERO.title,
  },
};

export default function HowItWorksPage() {
  return (
    <MarketingPageShell>
      <MarketingNav primaryCta={{ href: "/signup?product=xperience", label: "Start" }} />

      <main id="main-content">
        <MarketingSection
          tone="cream"
          className="pt-[calc(var(--mkt-navh)+48px)] md:pt-[calc(var(--mkt-navh)+72px)]"
        >
          <MarketingContainer className="max-w-3xl">
            <MarketingReveal>
              <p className={mktClass.label}>{HOW_IT_WORKS_HERO.label}</p>
              <h1 className={`mt-4 ${mktClass.sectionTitle}`}>{HOW_IT_WORKS_HERO.title}</h1>
              <p className="mt-5 text-[0.9375rem] leading-[1.75] text-[var(--mkt-text2)]">
                {HOW_IT_WORKS_HERO.support}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <MarketingButtonLink href={HOW_IT_WORKS_HERO.primaryCta.href} variant="primaryLg">
                  {HOW_IT_WORKS_HERO.primaryCta.label}
                </MarketingButtonLink>
                <MarketingButtonLink href={HOW_IT_WORKS_HERO.secondaryCta.href} variant="ghostLg">
                  {HOW_IT_WORKS_HERO.secondaryCta.label}
                </MarketingButtonLink>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="white" id="workflow">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label="End-to-end"
                title="Work becomes a record you can act on"
                subtitle="One connected flow — not a course playlist and a separate career tool."
              />
            </MarketingReveal>
            <MarketingReveal delay={0.06}>
              <div className="mt-10">
                <HowItWorksPipeline />
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="cream" id="steps">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label="Lifecycle"
                title="Start with direction. Build through work."
                subtitle="Five stages from onboarding through Professional Intelligence to Launchpad and Workspace."
              />
            </MarketingReveal>

            <ol className="mt-14 space-y-10 md:space-y-14">
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <li key={step.id}>
                  <MarketingReveal delay={index * 0.04}>
                    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
                      <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
                        <p className={`${mktClass.mono} text-[0.7rem] text-[var(--mkt-green-m)]`}>
                          Step {step.step}
                        </p>
                        <h2
                          className={`mt-3 text-[clamp(1.35rem,2.8vw,1.75rem)] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                        >
                          {step.title}
                        </h2>
                        <p className="mt-4 text-[0.9375rem] leading-[1.7] text-[var(--mkt-text2)]">
                          {step.body}
                        </p>
                      </div>
                      <div className={index % 2 === 1 ? "lg:order-1" : undefined}>
                        <HowItWorksStepDiagram id={step.diagram} />
                      </div>
                    </div>
                  </MarketingReveal>
                </li>
              ))}
            </ol>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="white" id="sources">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label="Evidence sources"
                title="The source matters."
                subtitle="Professional Intelligence keeps claims, evidence, judgements and attestations distinct."
              />
            </MarketingReveal>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {HOW_IT_WORKS_SOURCES.map((source, index) => (
                <li key={source.label}>
                  <MarketingReveal delay={index * 0.04}>
                    <div className={`${mktClass.softPanelLight} h-full p-5`}>
                      <p className={`text-[1.05rem] tracking-tight text-[var(--mkt-text1)] ${mktClass.serif}`}>
                        {source.label}
                      </p>
                      <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">
                        {source.body}
                      </p>
                    </div>
                  </MarketingReveal>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="cream" id="products">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label="Product hand-offs"
                title="Experience generates. Intelligence interprets. Products consume."
              />
            </MarketingReveal>
            <ul className="mt-10 grid gap-4 md:grid-cols-3">
              {HOW_IT_WORKS_HANDOFFS.map((handOff, index) => (
                <li key={`${handOff.from}-${handOff.to}`}>
                  <MarketingReveal delay={index * 0.05}>
                    <div className={`${mktClass.softPanelLight} h-full p-6`}>
                      <p className={`${mktClass.label}`}>
                        {handOff.from} → {handOff.to}
                      </p>
                      <p className="mt-4 text-[0.875rem] leading-relaxed text-[var(--mkt-text2)]">
                        {handOff.line}
                      </p>
                    </div>
                  </MarketingReveal>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="white" id="faq">
          <MarketingContainer className="max-w-2xl">
            <MarketingReveal>
              <MarketingSectionIntro label="FAQ" title="Clear boundaries" />
            </MarketingReveal>
            <ul className="mt-10 space-y-3">
              {HOW_IT_WORKS_FAQ.map((item, index) => (
                <li key={item.question} className={`${mktClass.softPanelLight} p-6`}>
                  <MarketingReveal delay={index * 0.04}>
                    <h3
                      className={`text-[1.05rem] tracking-[-0.015em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                    >
                      {item.question}
                    </h3>
                    <p className="mt-3 text-[0.875rem] leading-[1.7] text-[var(--mkt-text2)]">
                      {item.answer}
                    </p>
                  </MarketingReveal>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="dark" className="mkt-cta-band !border-0">
          <MarketingContainer className="relative z-10 text-center">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.875rem,4vw,2.75rem)] tracking-[-0.025em] text-white ${mktClass.serif}`}
              >
                Begin with a clear first step.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[0.9375rem] font-light leading-relaxed text-white/65">
                Map your direction, enter a realistic company and begin building evidence you can explain.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <MarketingButtonLink href="/signup?product=xperience" variant="ctaLight">
                  Start your experience
                </MarketingButtonLink>
                <MarketingButtonLink href="/experience" variant="ctaOutline">
                  Explore Experience
                </MarketingButtonLink>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>
      </main>

      <MarketingFooter cta={null} />
    </MarketingPageShell>
  );
}
