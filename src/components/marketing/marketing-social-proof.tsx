import { MarketingContainer, MarketingSection } from "@/components/marketing/marketing-layout";
import { mktClass } from "@/lib/marketing/landing-theme";
import { PILOT_QUOTE } from "@/lib/marketing/landing-data";

export function MarketingSocialProofSection() {
  if (!PILOT_QUOTE.enabled || !PILOT_QUOTE.quote.trim()) {
    return null;
  }

  return (
    <MarketingSection id="social-proof" tone="white">
      <MarketingContainer>
        <figure className="marketing-social-proof-quote mkt-card mkt-card-gradient mx-auto max-w-3xl border-l-4 border-[var(--mkt-green-l)] px-8 py-8 md:px-10 md:py-10">
          <blockquote
            className={`${mktClass.serif} text-[clamp(1.25rem,2.2vw,1.5rem)] leading-[1.55] tracking-[-0.015em] text-[var(--mkt-text1)]`}
          >
            &ldquo;{PILOT_QUOTE.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-6 border-t border-[var(--mkt-border)] pt-5">
            <p className="text-sm font-semibold text-[var(--mkt-text1)]">{PILOT_QUOTE.name}</p>
            <p className="mt-0.5 text-sm text-[var(--mkt-text2)]">
              {PILOT_QUOTE.title}
              {PILOT_QUOTE.org ? ` · ${PILOT_QUOTE.org}` : null}
            </p>
          </figcaption>
        </figure>
      </MarketingContainer>
    </MarketingSection>
  );
}
