import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingContainer } from "@/components/marketing/marketing-layout";
import {
  MarketingHeroItem,
  MarketingHeroMotion,
} from "@/components/marketing/marketing-reveal";
import { ProductDashboardMock } from "@/components/marketing/product-dashboard-mock";
import { mktClass } from "@/lib/marketing/landing-theme";
import type { ProductPageContent } from "@/lib/marketing/product-page";

export function LaunchpadHero({ content }: { content: ProductPageContent }) {
  const secondary = content.secondaryCta ?? { href: "/how-it-works", label: "See how it works" };

  return (
    <section
      id="hero"
      className="mkt-product-hero relative overflow-hidden bg-gradient-to-b from-[var(--mkt-mist)] via-[var(--mkt-ink)] to-[var(--mkt-cream)] pt-[var(--mkt-navh)]"
    >
      <div className="pointer-events-none absolute inset-0 z-0 mkt-hero-mesh" aria-hidden />
      <div
        className="pointer-events-none absolute left-[6%] top-[16%] z-0 h-[44%] w-[min(440px,55%)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(61,150,96,0.11)_0%,transparent_70%)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[2%] top-[10%] z-0 h-[50%] w-[min(520px,60%)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.08)_0%,transparent_70%)] blur-3xl"
        aria-hidden
      />

      <MarketingContainer className="relative z-[1] !max-w-[1180px] py-14 md:py-20 lg:py-24">
        <MarketingHeroMotion>
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 xl:gap-14">
            <div className="max-w-xl">
              <MarketingHeroItem>
                <p className={mktClass.label}>
                  {content.brandEyebrow ?? `DeliverX · ${content.stage}`}
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p
                  className={`mt-5 text-[clamp(2.35rem,5.2vw,3.75rem)] leading-[1.02] tracking-[-0.04em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                >
                  {content.name}
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <h1 className="mt-4 max-w-lg text-[clamp(1.25rem,2.6vw,1.625rem)] font-medium leading-[1.35] tracking-[-0.02em] text-[var(--mkt-text1)]">
                  {content.heroTitle}
                </h1>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                  {content.promise}
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <MarketingButtonLink href={content.primaryCta.href} variant="primaryLg">
                    {content.primaryCta.label}
                  </MarketingButtonLink>
                  <MarketingButtonLink href={secondary.href} variant="ghostLg">
                    {secondary.label}
                  </MarketingButtonLink>
                </div>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p className="mt-6 text-[0.8125rem] text-[var(--mkt-text3)]">
                  When readiness uses evidence coverage rather than a capability assessment, Launchpad
                  says so. Verified claims require independent attestation.
                </p>
              </MarketingHeroItem>
            </div>

            <MarketingHeroItem className="lg:pl-2">
              <div className="mkt-hero-float mx-auto w-full max-w-[480px] lg:ml-auto lg:max-w-none" aria-hidden>
                <ProductDashboardMock variant="launchpad" />
              </div>
              <span className="sr-only">
                Preview of the Launchpad dashboard with readiness source, packaging and interview
                lab modules
              </span>
            </MarketingHeroItem>
          </div>
        </MarketingHeroMotion>
      </MarketingContainer>
    </section>
  );
}
