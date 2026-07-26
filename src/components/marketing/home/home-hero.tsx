"use client";

import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingContainer } from "@/components/marketing/marketing-layout";
import {
  MarketingHeroItem,
  MarketingHeroMotion,
} from "@/components/marketing/marketing-reveal";
import { ProductDashboardMock } from "@/components/marketing/product-dashboard-mock";
import { HOME_EYEBROW, HOME_SUPPORT } from "@/lib/marketing/homepage-data";
import { mktClass } from "@/lib/marketing/landing-theme";

export function HomeHero() {
  return (
    <section
      id="hero"
      className="mkt-product-hero relative overflow-hidden bg-gradient-to-b from-[var(--mkt-mist)] via-[var(--mkt-ink)] to-[var(--mkt-cream)] pt-[var(--mkt-navh)]"
    >
      <div className="pointer-events-none absolute inset-0 z-0 mkt-hero-mesh" aria-hidden />
      <MarketingContainer className="relative z-[1] !max-w-[1180px] py-14 md:py-20 lg:py-24">
        <MarketingHeroMotion>
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10 xl:gap-14">
            <div className="max-w-xl">
              <MarketingHeroItem>
                <p className={`${mktClass.label} !normal-case !tracking-[0.04em]`}>{HOME_EYEBROW}</p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <h1
                  className={`mt-5 text-[clamp(2.15rem,5vw,3.5rem)] leading-[1.08] tracking-[-0.04em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                >
                  Build the <span className="mkt-keyword-gradient">experience</span>
                  <br />
                  Land the <span className="mkt-keyword-gradient">opportunity</span>
                  <br />
                  Succeed in the <span className="mkt-keyword-gradient">role</span>
                </h1>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                  {HOME_SUPPORT}
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <MarketingButtonLink href="/signup?product=xperience" variant="primaryLg">
                    Start your experience
                  </MarketingButtonLink>
                  <MarketingButtonLink href="/how-it-works" variant="ghostLg">
                    See how it works
                  </MarketingButtonLink>
                </div>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p className="mt-6 text-[0.8125rem] text-[var(--mkt-text3)]">
                  Realistic companies. Meaningful product work. Evidence with a clear source.
                </p>
              </MarketingHeroItem>
            </div>

            <MarketingHeroItem className="lg:pl-2">
              <div className="mkt-hero-float" aria-hidden>
                <ProductDashboardMock variant="experience" />
              </div>
              <span className="sr-only">Preview of the DeliverX Experience product dashboard</span>
            </MarketingHeroItem>
          </div>
        </MarketingHeroMotion>
      </MarketingContainer>
    </section>
  );
}
