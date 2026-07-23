import type { Metadata } from "next";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import {
  MarketingContainer,
  MarketingPageShell,
  MarketingSection,
} from "@/components/marketing/marketing-layout";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingReveal } from "@/components/marketing/marketing-reveal";
import {
  CAREER_PROGRESSION_LINE,
  COMPANY_MISSION,
  COMPANY_POSITIONING,
} from "@/lib/marketing/career-suite";
import { mktClass } from "@/lib/marketing/landing-theme";
import { SUITE_PRODUCTS } from "@/lib/marketing/suite-data";

export const metadata: Metadata = {
  title: "Solutions — DeliverX",
  description:
    "How DeliverX supports professional growth — from first practical experience through successful product delivery.",
};

export default function SolutionsPage() {
  return (
    <MarketingPageShell>
      <MarketingNav />
      <main id="main-content">
        <MarketingSection
          tone="cream"
          className="pt-[calc(var(--mkt-navh)+48px)] md:pt-[calc(var(--mkt-navh)+72px)]"
        >
          <MarketingContainer className="max-w-2xl">
            <MarketingReveal>
              <p className={mktClass.label}>Solutions</p>
              <h1 className={`mt-4 ${mktClass.sectionTitle}`}>
                One journey. Three connected products.
              </h1>
              <p className="mt-5 text-[0.9375rem] leading-[1.75] text-[var(--mkt-text2)]">
                {COMPANY_MISSION}
              </p>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--mkt-text3)]">
                {CAREER_PROGRESSION_LINE}
              </p>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="white">
          <MarketingContainer>
            <ul className="max-w-2xl space-y-10">
              {SUITE_PRODUCTS.map((product) => (
                <li key={product.id}>
                  <MarketingReveal>
                    <p className={`${mktClass.label} text-[var(--mkt-green)]`}>{product.stage}</p>
                    <h2
                      className={`mt-2 text-[clamp(1.5rem,3vw,2rem)] tracking-[-0.025em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                    >
                      {product.name}
                    </h2>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                      {product.promise}
                    </p>
                    <MarketingButtonLink href={product.href} variant="ghost" className="mt-4">
                      Explore {product.name}
                    </MarketingButtonLink>
                  </MarketingReveal>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </MarketingSection>
      </main>
      <MarketingFooter
        cta={{
          title: "See how the products fit together",
          subtitle: COMPANY_POSITIONING,
          href: "/#products",
          label: "Explore Products",
        }}
      />
    </MarketingPageShell>
  );
}
