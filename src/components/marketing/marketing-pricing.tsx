import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { PRICING_TIERS, type PricingTier } from "@/lib/marketing/landing-data";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mt-0.5 size-[13px] shrink-0 fill-none stroke-[var(--mkt-green-l)] stroke-2 [stroke-linecap:round]"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ExcludedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mt-0.5 size-[13px] shrink-0 fill-none stroke-[var(--mkt-text3)] stroke-[1.5] [stroke-dasharray:3_2] [stroke-linecap:round]"
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function MarketingPricingSection() {
  return (
    <MarketingSection id="pricing" tone="cream">
      <MarketingContainer>
        <MarketingSectionIntro
          label="Pricing"
          title={
            <>
              Pricing <em>coming soon</em>
            </>
          }
          subtitle="Join the pilot today. No credit card required. Paid plans launch once billing is live."
        />

        <div className="mt-8 grid gap-4 max-[900px]:grid-cols-1 min-[901px]:grid-cols-3">
          {(PRICING_TIERS as readonly PricingTier[]).map((tier) => (
            <div
              key={tier.tier}
              className={`mkt-card mkt-card-lift relative p-8 ${
                tier.featured ? "mkt-card-gradient shadow-[0_0_0_1px_rgba(61,150,96,.18),0_12px_40px_rgba(61,150,96,.12)]" : ""
              }`}
            >
              {tier.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--mkt-green-l)] px-3.5 py-0.5 text-[0.6875rem] font-semibold text-white whitespace-nowrap shadow-[0_4px_12px_rgba(61,150,96,0.35)]">
                  {tier.badge}
                </span>
              ) : null}
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-[var(--mkt-text3)]">
                {tier.tier}
              </p>
              <p className="mt-1.5 text-lg font-semibold text-[var(--mkt-text1)]">{tier.name}</p>
              <div className="mt-4 flex items-baseline gap-1">
                {!tier.customPrice ? (
                  <span className="text-base font-light text-[var(--mkt-text2)]">£</span>
                ) : null}
                <span
                  className={`font-[family-name:var(--font-dx-display)] tracking-[-0.03em] text-[var(--mkt-text1)] leading-none ${
                    tier.customPrice ? "text-[2rem]" : "text-[2.75rem]"
                  }`}
                >
                  {tier.price}
                </span>
                {tier.period ? (
                  <span className="text-[0.8125rem] text-[var(--mkt-text3)]">{tier.period}</span>
                ) : null}
              </div>
              <p className="mt-2 text-[0.8125rem] leading-snug text-[var(--mkt-text2)]">{tier.desc}</p>
              <div className="my-5 h-px bg-[var(--mkt-border)]" />
              <ul className="space-y-1">
                {tier.features.map((feature) => {
                  const highlighted = tier.highlightFeatures?.includes(feature);
                  return (
                    <li
                      key={feature}
                      className={`flex items-start gap-2 text-[0.8125rem] leading-snug ${
                        highlighted
                          ? "font-semibold text-[var(--mkt-green-l)]"
                          : "text-[var(--mkt-text2)]"
                      }`}
                    >
                      <CheckIcon />
                      {feature}
                    </li>
                  );
                })}
                {tier.excludedFeatures?.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 border-b border-dashed border-[var(--mkt-border)] pb-1 text-[0.8125rem] leading-snug text-[var(--mkt-text3)] last:border-b-0 last:pb-0"
                  >
                    <ExcludedIcon />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <MarketingButtonLink
                  href={tier.ctaHref}
                  variant={tier.ghost ? "ghost" : "primary"}
                  className="w-full justify-center"
                >
                  {tier.cta}
                </MarketingButtonLink>
                {tier.upgradeNudge ? (
                  <p className="mt-3 text-center text-[0.75rem] leading-snug text-[var(--mkt-text3)]">
                    {tier.upgradeNudge}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
