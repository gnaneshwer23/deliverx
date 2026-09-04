import Link from "next/link";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import {
  MarketingContainer,
  MarketingSection,
} from "@/components/marketing/marketing-layout";
import { MarketingReveal } from "@/components/marketing/marketing-reveal";
import type { MarketingGuide } from "@/lib/marketing/guides/types";
import { COMPANY_MISSION } from "@/lib/marketing/career-suite";
import { mktClass } from "@/lib/marketing/landing-theme";

export function MarketingGuideArticle({ guide }: { guide: MarketingGuide }) {
  return (
    <>
      <main id="main-content">
        <MarketingSection
          tone="cream"
          className="pt-[calc(var(--mkt-navh)+48px)] md:pt-[calc(var(--mkt-navh)+72px)]"
        >
          <MarketingContainer className="max-w-2xl">
            <MarketingReveal>
              <p className={mktClass.label}>{guide.eyebrow}</p>
              <h1 className={`mt-4 ${mktClass.sectionTitle}`}>{guide.title}</h1>
              <p className="mt-3 text-[0.8125rem] text-[var(--mkt-text3)]">{guide.updatedLabel}</p>
              <p className="mt-6 text-[1.0625rem] leading-[1.75] text-[var(--mkt-text1)]">
                {guide.lede}
              </p>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        {guide.sections.map((section, index) => (
          <MarketingSection
            key={section.id}
            id={section.id}
            tone={index % 2 === 0 ? "white" : "cream"}
          >
            <MarketingContainer className="max-w-2xl">
              <MarketingReveal>
                <h2
                  className={`text-[clamp(1.35rem,2.5vw,1.75rem)] tracking-[-0.025em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                >
                  {section.title}
                </h2>
                <div className="mt-6 space-y-5 text-[0.9375rem] leading-[1.75] text-[var(--mkt-text2)]">
                  {section.paragraphs.map((para) => (
                    <p key={para.slice(0, 48)}>{para}</p>
                  ))}
                </div>
                {section.bullets && section.bullets.length > 0 ? (
                  <ul className="mt-6 space-y-3">
                    {section.bullets.map((item) => (
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
                ) : null}
              </MarketingReveal>
            </MarketingContainer>
          </MarketingSection>
        ))}

        <MarketingSection tone="white">
          <MarketingContainer className="max-w-2xl">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.35rem,2.5vw,1.75rem)] tracking-[-0.025em] text-[var(--mkt-text1)] ${mktClass.serif}`}
              >
                Continue
              </h2>
              <div className="mt-8 flex flex-wrap gap-3">
                <MarketingButtonLink href={guide.primaryCta.href} variant="primary">
                  {guide.primaryCta.label}
                </MarketingButtonLink>
                <MarketingButtonLink href={guide.secondaryCta.href} variant="ghostLg">
                  {guide.secondaryCta.label}
                </MarketingButtonLink>
              </div>
              <ul className="mt-10 space-y-3">
                {guide.related.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[0.9375rem] font-medium text-[var(--mkt-green)] no-underline underline-offset-4 hover:underline"
                    >
                      {link.label} →
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-[0.875rem] leading-relaxed text-[var(--mkt-text3)]">
                Orientation only — not placement guarantees, not an employer marketplace, and not a
                claim that practice or learning equals verified capability.
              </p>
            </MarketingReveal>
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
