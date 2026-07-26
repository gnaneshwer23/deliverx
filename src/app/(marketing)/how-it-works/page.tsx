import type { Metadata } from "next";
import Link from "next/link";
import { HowItWorksHero } from "@/components/marketing/how-it-works-hero";
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
import { ProductDashboardMock } from "@/components/marketing/product-dashboard-mock";
import { HOW_IT_WORKS_PAGE } from "@/lib/marketing/how-it-works-data";
import { mktClass } from "@/lib/marketing/landing-theme";
import { productPageNav } from "@/lib/marketing/product-page";

export const metadata: Metadata = {
  title: "How it works — DeliverX",
  description: HOW_IT_WORKS_PAGE.promise,
  openGraph: {
    title: "How DeliverX works",
    description: HOW_IT_WORKS_PAGE.heroTitle,
  },
};

function NarrativeBlock({
  section,
}: {
  section: (typeof HOW_IT_WORKS_PAGE)["intro"];
}) {
  const tone = section.tone ?? "white";

  return (
    <MarketingSection id={section.id} tone={tone}>
      <MarketingContainer>
        <MarketingReveal>
          <MarketingSectionIntro
            label={section.label ?? "Overview"}
            title={section.title}
            subtitle={section.body}
          />
        </MarketingReveal>
        {section.items && section.items.length > 0 ? (
          <MarketingReveal delay={0.08}>
            <ul className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
              {section.items.map((item) => (
                <li
                  key={item}
                  className={`${mktClass.softPanelLight} grid grid-cols-[auto_1fr] gap-3 p-4 text-[0.9375rem] leading-snug text-[var(--mkt-text1)]`}
                >
                  <span
                    className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-[var(--mkt-green-l)]"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </MarketingReveal>
        ) : null}
      </MarketingContainer>
    </MarketingSection>
  );
}

export default function HowItWorksPage() {
  const content = HOW_IT_WORKS_PAGE;
  const nav = productPageNav(content.path);

  return (
    <MarketingPageShell>
      <MarketingNav
        links={nav}
        primaryCta={{
          href: content.primaryCta.href,
          label: content.primaryCta.label,
        }}
      />

      <main id="main-content">
        <HowItWorksHero content={content} />

        <NarrativeBlock section={content.intro} />
        <NarrativeBlock section={content.firstStep} />

        <MarketingSection id="workflow" tone="white">
          {/* Legacy /solutions#journey anchors */}
          <span id="journey" className="sr-only">
            DeliverX workflow
          </span>
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label={content.pipeline.label}
                title={content.pipeline.title}
                subtitle={content.pipeline.subtitle}
              />
            </MarketingReveal>
            <MarketingReveal delay={0.06}>
              <ol
                className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                aria-label="End-to-end workflow"
              >
                {content.pipeline.nodes.map((node, index) => (
                  <li key={node.id} className="relative">
                    <div className={`${mktClass.softPanelLight} flex h-full flex-col p-5`}>
                      <span className={`${mktClass.mono} text-[0.65rem] text-[var(--mkt-green-m)]`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p
                        className={`mt-3 text-[1.15rem] tracking-tight text-[var(--mkt-text1)] ${mktClass.serif}`}
                      >
                        {node.label}
                      </p>
                      <p className="mt-1 text-[0.8125rem] text-[var(--mkt-text3)]">{node.detail}</p>
                    </div>
                    {index < content.pipeline.nodes.length - 1 ? (
                      <span
                        className="pointer-events-none absolute -right-2 top-1/2 z-[1] hidden size-4 -translate-y-1/2 text-[var(--mkt-green-l)] lg:block"
                        aria-hidden
                      >
                        →
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="steps" tone="cream">
          <MarketingContainer className="!max-w-[1180px]">
            <MarketingReveal>
              <MarketingSectionIntro
                label={content.stepsIntro.label}
                title={content.stepsIntro.title}
                subtitle={content.stepsIntro.subtitle}
              />
            </MarketingReveal>

            <ol className="mt-14 space-y-16 md:space-y-20">
              {content.steps.map((step, index) => (
                <li key={step.id} id={step.id}>
                  <MarketingReveal delay={index * 0.03}>
                    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 xl:gap-16">
                      <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
                        <p className={`${mktClass.mono} text-[0.7rem] text-[var(--mkt-green-m)]`}>
                          Step {step.step}
                        </p>
                        <h2
                          className={`mt-3 text-[clamp(1.5rem,3vw,2rem)] tracking-[-0.025em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                        >
                          {step.title}
                        </h2>
                        <p className="mt-4 max-w-md text-[0.9375rem] leading-[1.7] text-[var(--mkt-text2)]">
                          {step.body}
                        </p>
                      </div>
                      <div className={index % 2 === 1 ? "lg:order-1" : undefined}>
                        <div className="mx-auto w-full max-w-[440px] lg:max-w-none" aria-hidden>
                          <ProductDashboardMock variant={step.mock} />
                        </div>
                        <span className="sr-only">{step.mockCaption}</span>
                      </div>
                    </div>
                  </MarketingReveal>
                </li>
              ))}
            </ol>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="sources" tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label={content.sources.label}
                title={content.sources.title}
                subtitle={content.sources.subtitle}
              />
            </MarketingReveal>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {content.sources.items.map((source, index) => (
                <li key={source.label}>
                  <MarketingReveal delay={index * 0.04}>
                    <div className={`${mktClass.softPanelLight} h-full p-5 md:p-6`}>
                      <p
                        className={`text-[1.05rem] tracking-tight text-[var(--mkt-text1)] ${mktClass.serif}`}
                      >
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

        <MarketingSection id="products" tone="cream">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label={content.handoffs.label}
                title={content.handoffs.title}
                subtitle={content.handoffs.subtitle}
              />
            </MarketingReveal>
            <ul className="mt-10 grid gap-4 md:grid-cols-3">
              {content.handoffs.items.map((handOff, index) => (
                <li key={`${handOff.from}-${handOff.to}`}>
                  <MarketingReveal delay={index * 0.05}>
                    <Link
                      href={handOff.href}
                      className={`${mktClass.softPanelLight} flex h-full flex-col p-6 no-underline transition hover:border-[var(--mkt-border-l)]`}
                    >
                      <p className={mktClass.label}>
                        {handOff.from} → {handOff.to}
                      </p>
                      <p className="mt-4 flex-1 text-[0.875rem] leading-relaxed text-[var(--mkt-text2)]">
                        {handOff.line}
                      </p>
                      <span className="mt-5 text-[0.8125rem] font-medium text-[var(--mkt-green-m)]">
                        Explore →
                      </span>
                    </Link>
                  </MarketingReveal>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="faq" tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label={content.faq.label}
                title={content.faq.title}
              />
            </MarketingReveal>
            <ul className="mt-12 max-w-2xl space-y-3">
              {content.faq.items.map((item, index) => (
                <li key={item.question} className={`${mktClass.softPanelLight} p-6 md:p-7`}>
                  <MarketingReveal delay={index * 0.04}>
                    <h3
                      className={`text-[1.125rem] tracking-[-0.015em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                    >
                      {item.question}
                    </h3>
                    <p className="mt-3 text-[0.9375rem] leading-[1.7] text-[var(--mkt-text2)]">
                      {item.answer}
                    </p>
                  </MarketingReveal>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection id="pricing" tone="cream">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label={content.pricing.label}
                title={content.pricing.title}
                subtitle={content.pricing.subtitle}
              />
            </MarketingReveal>
            <MarketingReveal delay={0.08}>
              <div className="mt-14 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className={`${mktClass.softPanelLight} p-8 md:p-10`}>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <p
                      className={`text-[clamp(2.75rem,5.5vw,3.5rem)] leading-none tracking-[-0.045em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                    >
                      {content.pricing.price}
                    </p>
                    <p className="text-sm text-[var(--mkt-text3)]">{content.pricing.cadence}</p>
                  </div>
                  <p className="mt-6 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                    {content.pricing.summary}
                  </p>
                  <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <MarketingButtonLink href={content.pricing.ctaHref} variant="primaryLg">
                      {content.pricing.cta}
                    </MarketingButtonLink>
                  </div>
                </div>
                <Link
                  href={content.pricing.bundleHref}
                  className="mkt-soft-panel-highlight group flex flex-col justify-between p-8 no-underline md:p-10"
                >
                  <div>
                    <p className={`${mktClass.label} !text-white/55`}>Recommended</p>
                    <p
                      className={`mt-4 text-[clamp(1.35rem,2.5vw,1.625rem)] tracking-[-0.02em] text-white ${mktClass.serif}`}
                    >
                      Complete Journey
                    </p>
                    <p className="mt-3 text-[0.875rem] leading-relaxed text-white/65">
                      {content.pricing.bundleLabel}
                    </p>
                  </div>
                  <span className="mt-8 text-[0.875rem] font-medium text-white transition-transform duration-300 group-hover:translate-x-1">
                    See pilot access →
                  </span>
                </Link>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="dark" className="mkt-cta-band !border-0">
          <MarketingContainer className="relative z-10 text-center">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.875rem,4vw,2.75rem)] tracking-[-0.025em] text-white ${mktClass.serif}`}
              >
                {content.finalCta.title}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[0.9375rem] font-light leading-relaxed text-white/65">
                {content.finalCta.subtitle}
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <MarketingButtonLink href={content.finalCta.ctaHref} variant="ctaLight">
                  {content.finalCta.ctaLabel}
                </MarketingButtonLink>
                <MarketingButtonLink href={content.finalCta.secondaryHref} variant="ctaOutline">
                  {content.finalCta.secondaryLabel}
                </MarketingButtonLink>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>
      </main>

      <MarketingFooter cta={content.footerCta} />
    </MarketingPageShell>
  );
}
