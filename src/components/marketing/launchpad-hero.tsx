import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingContainer } from "@/components/marketing/marketing-layout";
import {
  MarketingHeroItem,
  MarketingHeroMotion,
} from "@/components/marketing/marketing-reveal";
import { mktClass } from "@/lib/marketing/landing-theme";
import type { ProductPageContent } from "@/lib/marketing/product-page";

const MODULES = [
  { label: "Career assessment", status: "Complete" },
  { label: "CV & portfolio", status: "In progress" },
  { label: "Interview prep", status: "Next" },
] as const;

function LaunchpadPreview() {
  return (
    <div className="mkt-hub-glow relative">
      <div
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(61,150,96,0.14),transparent_68%)] blur-2xl"
        aria-hidden
      />
      <div className="mkt-hub-panel overflow-hidden rounded-[1.35rem] border border-[var(--mkt-border)] bg-[var(--mkt-s1)] shadow-[0_24px_64px_-28px_rgba(13,13,11,0.28)]">
        <div className="border-b border-[var(--mkt-border)] bg-[var(--mkt-s2)]/70 px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p
                className={`${mktClass.mono} text-[0.6rem] uppercase tracking-[0.14em] text-[var(--mkt-green-l)]`}
              >
                Career readiness
              </p>
              <p className={`mt-1 truncate text-[0.95rem] tracking-tight text-[var(--mkt-text1)] ${mktClass.serif}`}>
                Launchpad
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-[rgba(61,150,96,0.22)] bg-[rgba(61,150,96,0.08)] px-2.5 py-1 text-[0.65rem] font-medium text-[var(--mkt-green)]">
              Readiness 78
            </span>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <p
                className={`${mktClass.mono} text-[0.6rem] uppercase tracking-[0.14em] text-[var(--mkt-text3)]`}
              >
                Career Twin
              </p>
              <p className="mt-1 text-[0.875rem] font-medium tracking-tight text-[var(--mkt-text1)]">
                Associate Product Manager
              </p>
              <p className="mt-0.5 text-[0.7rem] leading-snug text-[var(--mkt-text3)]">
                Prioritisation · stakeholder clarity · interview storytelling
              </p>
            </div>
            <div className="relative flex size-14 shrink-0 items-center justify-center">
              <span className="mkt-hub-score absolute inset-0 rounded-full" aria-hidden />
              <span className={`relative text-lg leading-none text-[var(--mkt-text1)] ${mktClass.serif}`}>
                78
              </span>
            </div>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--mkt-s3)]">
            <div className="mkt-hub-progress h-full rounded-full bg-[var(--mkt-green-l)]" />
          </div>

          <div className="rounded-xl border border-[var(--mkt-border)] bg-[var(--mkt-s2)]/50 p-3">
            <p
              className={`${mktClass.mono} text-[0.6rem] uppercase tracking-[0.14em] text-[var(--mkt-text3)]`}
            >
              Path to opportunity
            </p>
            <ul className="mt-2.5 space-y-2">
              {MODULES.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-3 text-[0.75rem] text-[var(--mkt-text2)]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${
                        item.status === "In progress"
                          ? "mkt-hub-pulse bg-[var(--mkt-accent-blue)]"
                          : item.status === "Complete"
                            ? "bg-[var(--mkt-green-l)]"
                            : "bg-[var(--mkt-border-l)]"
                      }`}
                      aria-hidden
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="shrink-0 text-[var(--mkt-text3)]">{item.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--mkt-border)] bg-white px-3 py-3 shadow-sm">
            <div className="min-w-0">
              <p className="text-[0.75rem] font-medium text-[var(--mkt-text1)]">Interview evidence</p>
              <p className="mt-0.5 truncate text-[0.65rem] text-[var(--mkt-text3)]">
                STAR stories · portfolio · mock interviews
              </p>
            </div>
            <span
              className="shrink-0 rounded-full bg-[var(--mkt-green)] px-3 py-1.5 text-[0.65rem] font-medium text-white"
              aria-hidden
            >
              Packaging
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LaunchpadHero({ content }: { content: ProductPageContent }) {
  const secondary = content.secondaryCta ?? { href: "/pricing", label: "Explore pricing" };

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-[var(--mkt-mist)] via-[var(--mkt-ink)] to-[var(--mkt-cream)] pt-[var(--mkt-navh)]"
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
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-14">
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
                  Stage two of the DeliverX journey · Land the opportunity
                </p>
              </MarketingHeroItem>
            </div>

            <MarketingHeroItem className="lg:pl-2">
              <div className="mkt-hero-float mx-auto w-full max-w-[420px] lg:ml-auto lg:max-w-none" aria-hidden>
                <LaunchpadPreview />
              </div>
              <span className="sr-only">
                Preview of Launchpad career readiness with Career Twin, module progress and interview
                evidence
              </span>
            </MarketingHeroItem>
          </div>
        </MarketingHeroMotion>
      </MarketingContainer>
    </section>
  );
}
