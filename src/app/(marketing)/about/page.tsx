import type { Metadata } from "next";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import {
  MarketingContainer,
  MarketingSection,
} from "@/components/marketing/marketing-layout";
import { MarketingReveal } from "@/components/marketing/marketing-reveal";
import {
  CAREER_PROGRESSION_LINE,
  COMPANY_MISSION,
  COMPANY_POSITIONING,
} from "@/lib/marketing/career-suite";
import { mktClass } from "@/lib/marketing/landing-theme";

export const metadata: Metadata = {
  title: "About — DeliverX",
  description: COMPANY_MISSION,
};

export default function AboutPage() {
  return (
    <>
      <main id="main-content">
        <MarketingSection
          tone="cream"
          className="pt-[calc(var(--mkt-navh)+48px)] md:pt-[calc(var(--mkt-navh)+72px)]"
        >
          <MarketingContainer className="max-w-2xl">
            <MarketingReveal>
              <div className={`${mktClass.softPanelLight} p-8 md:p-10`}>
                <p className={mktClass.label}>About</p>
                <h1 className={`mt-4 ${mktClass.sectionTitle}`}>DeliverX</h1>
                <p className="mt-3 text-[0.875rem] font-medium text-[var(--mkt-green)]">
                  {COMPANY_POSITIONING}
                </p>
                <p className="mt-6 text-[1.0625rem] leading-[1.75] text-[var(--mkt-text1)]">
                  {COMPANY_MISSION}
                </p>
                <p className="mt-5 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                  We start with Product Managers — and keep room to expand the same growth model to
                  neighbouring professional roles over time.
                </p>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--mkt-text3)]">
                  {CAREER_PROGRESSION_LINE}
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <MarketingButtonLink href="/#products" variant="primary">
                    Explore Products
                  </MarketingButtonLink>
                  <MarketingButtonLink href="/pricing" variant="ghostLg">
                    See pilot access
                  </MarketingButtonLink>
                </div>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>
      </main>
      <MarketingFooter
        cta={{
          title: "Start your journey",
          subtitle: "Experience, Launchpad and Professional Workspace — one professional growth platform.",
          href: "/signup",
          label: "Start Free",
        }}
      />
    </>
  );
}
