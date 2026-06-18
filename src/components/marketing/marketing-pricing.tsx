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
      className="mt-0.5 size-[13px] shrink-0 fill-none stroke-[#3D9660] stroke-2 [stroke-linecap:round]"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function MarketingPricingSection() {
  return (
    <MarketingSection id="pricing">
      <MarketingContainer>
        <MarketingSectionIntro
          label="Pricing"
          title={
            <>
              Simple plans. <em>Serious delivery.</em>
            </>
          }
          subtitle="30-day free trial on all plans. No credit card required."
        />

        <div className="mt-12 grid gap-4 max-[900px]:grid-cols-1 min-[901px]:grid-cols-3">
          {(PRICING_TIERS as readonly PricingTier[]).map((tier) => (
            <div
              key={tier.tier}
              className={`relative rounded-2xl border bg-[#111110] p-8 transition hover:border-[#3A3A3C] hover:shadow-[0_4px_16px_rgba(0,0,0,.5)] ${
                tier.featured
                  ? "border-[#3D9660] shadow-[0_0_0_1px_rgba(61,150,96,.18),0_8px_32px_rgba(61,150,96,.12)]"
                  : "border-[#2E2E30]"
              }`}
            >
              {tier.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#3D9660] px-3.5 py-0.5 text-[0.6875rem] font-semibold text-white whitespace-nowrap">
                  {tier.badge}
                </span>
              ) : null}
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-[#7A7874]">
                {tier.tier}
              </p>
              <p className="mt-1.5 text-lg font-semibold text-[#F0EDE8]">{tier.name}</p>
              <div className="mt-4 flex items-baseline gap-1">
                {!tier.customPrice ? (
                  <span className="text-base font-light text-[#B8B5AF]">£</span>
                ) : null}
                <span
                  className={`font-[family-name:var(--font-dx-display)] tracking-[-0.03em] text-[#F0EDE8] leading-none ${
                    tier.customPrice ? "text-[2rem]" : "text-[2.75rem]"
                  }`}
                >
                  {tier.price}
                </span>
                {tier.period ? (
                  <span className="text-[0.8125rem] text-[#7A7874]">{tier.period}</span>
                ) : null}
              </div>
              <p className="mt-2 text-[0.8125rem] leading-snug text-[#7A7874]">{tier.desc}</p>
              <div className="my-5 h-px bg-[#2E2E30]" />
              <ul className="space-y-1">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-[0.8125rem] leading-snug text-[#B8B5AF]"
                  >
                    <CheckIcon />
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
              </div>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
