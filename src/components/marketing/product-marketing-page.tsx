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
  MarketingHeroItem,
  MarketingHeroMotion,
  MarketingReveal,
} from "@/components/marketing/marketing-reveal";
import { LaunchpadHero } from "@/components/marketing/launchpad-hero";
import { WorkspaceHero } from "@/components/marketing/workspace-hero";
import { XperienceHero } from "@/components/marketing/xperience-hero";
import { mktClass } from "@/lib/marketing/landing-theme";
import {
  productPageNav,
  type ProductNarrativeSection,
  type ProductPageContent,
} from "@/lib/marketing/product-page";

function DefaultProductHero({ content }: { content: ProductPageContent }) {
  const secondary = content.secondaryCta ?? { href: "/how-it-works", label: "See how it works" };

  return (
    <section
      id="hero"
      className="relative flex min-h-[min(72svh,640px)] flex-col justify-end overflow-hidden bg-gradient-to-b from-[var(--mkt-mist)] via-[var(--mkt-ink)] to-[var(--mkt-cream)] pt-[calc(var(--mkt-navh)+48px)] pb-16 md:min-h-[min(78svh,720px)] md:pb-20"
    >
      <div className="pointer-events-none absolute inset-0 z-0 mkt-hero-mesh" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-0 h-[55%] w-[min(800px,100%)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(61,150,96,0.1)_0%,transparent_70%)] blur-2xl"
        aria-hidden
      />
      <MarketingContainer className="relative z-[1]">
        <MarketingHeroMotion>
          <MarketingHeroItem>
            <p className={mktClass.label}>
              {content.brandEyebrow ?? `DeliverX · ${content.stage}`}
            </p>
          </MarketingHeroItem>
          <MarketingHeroItem>
            <p
              className={`mt-5 text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.035em] text-[var(--mkt-text1)] ${mktClass.serif}`}
            >
              {content.name}
            </p>
          </MarketingHeroItem>
          <MarketingHeroItem>
            <h1 className="mt-4 max-w-3xl text-[clamp(1.35rem,3vw,1.875rem)] font-medium leading-[1.3] tracking-[-0.02em] text-[var(--mkt-text1)]">
              {content.heroTitle}
            </h1>
          </MarketingHeroItem>
          <MarketingHeroItem>
            <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
              {content.promise}
            </p>
          </MarketingHeroItem>
          <MarketingHeroItem>
            <div className="mt-10 flex flex-wrap gap-3">
              <MarketingButtonLink href={content.primaryCta.href} variant="primaryLg">
                {content.primaryCta.label}
              </MarketingButtonLink>
              <MarketingButtonLink href={secondary.href} variant="ghostLg">
                {secondary.label}
              </MarketingButtonLink>
            </div>
          </MarketingHeroItem>
        </MarketingHeroMotion>
      </MarketingContainer>
    </section>
  );
}

function NarrativeSection({
  section,
  index,
}: {
  section: ProductNarrativeSection;
  index: number;
}) {
  const tone = section.tone ?? (index % 2 === 0 ? "white" : "cream");

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

export function ProductMarketingPage({ content }: { content: ProductPageContent }) {
  const nav = productPageNav(content.path);
  const bundleHref = content.pricing.bundleHref ?? "/pricing#bundle";
  const bundleLabel = content.pricing.bundleLabel ?? "Or get the Complete Journey";
  const finalSecondary = {
    href: content.finalCta.secondaryHref ?? "/pricing#bundle",
    label: content.finalCta.secondaryLabel ?? "Get the Complete Journey",
  };
  const hero =
    content.path === "/experience" ? (
      <XperienceHero content={content} />
    ) : content.path === "/launchpad" ? (
      <LaunchpadHero content={content} />
    ) : content.path === "/professional-workspace" ? (
      <WorkspaceHero content={content} />
    ) : (
      <DefaultProductHero content={content} />
    );

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
        {hero}

        {content.sections.map((section, index) => (
          <NarrativeSection key={section.id} section={section} index={index} />
        ))}

        {content.faq && content.faq.items.length > 0 ? (
          <MarketingSection id="faq" tone="white">
            <MarketingContainer>
              <MarketingReveal>
                <MarketingSectionIntro
                  label={content.faq.label ?? "FAQ"}
                  title={content.faq.title ?? "Frequently asked questions"}
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
        ) : null}

        <MarketingSection id="pricing" tone="cream">
          <MarketingContainer>
            <MarketingReveal>
              <MarketingSectionIntro
                label={content.pricing.label ?? "Pricing"}
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
                  href={bundleHref}
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
                      {bundleLabel}
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
                <MarketingButtonLink href={finalSecondary.href} variant="ctaOutline">
                  {finalSecondary.label}
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
