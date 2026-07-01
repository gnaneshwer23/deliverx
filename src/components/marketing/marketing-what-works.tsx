import { MarketingBadge } from "@/components/marketing/marketing-badge";
import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { COMING_SOON, LIVE_FEATURES } from "@/lib/marketing/landing-data";

export function MarketingWhatWorksSection() {
  return (
    <MarketingSection id="features-live" className="border-y border-[var(--mkt-border)] bg-[var(--mkt-s1)]">
      <MarketingContainer>
        <MarketingSectionIntro
          label="What works today"
          title={
            <>
              Shipped and <em>in production.</em>
            </>
          }
          subtitle="No vapourware. These are the capabilities live on main today — the same paths you get when you start a free trial."
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <ul className="space-y-0">
            {LIVE_FEATURES.map((feature, index) => (
              <li
                key={feature.title}
                className={`flex gap-4 border-b border-[var(--mkt-border)] py-5 first:pt-0 last:border-b-0 ${
                  index === LIVE_FEATURES.length - 1 ? "pb-0" : ""
                }`}
              >
                <span
                  className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-[rgba(61,150,96,0.25)] bg-[rgba(61,150,96,0.08)] font-[family-name:var(--font-mkt-mono)] text-[10px] font-semibold text-[var(--mkt-green-l)]"
                  aria-hidden
                >
                  ✓
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--mkt-text1)]">{feature.title}</p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <aside className="rounded-2xl border border-[var(--mkt-border)] bg-[var(--mkt-s2)] p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <p className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--mkt-text3)]">
                Coming soon
              </p>
              <MarketingBadge tone="badge-n">Roadmap</MarketingBadge>
            </div>
            <ul className="space-y-4">
              {COMING_SOON.map((item) => (
                <li key={item.title} className="rounded-xl border border-[var(--mkt-border)] bg-[var(--mkt-s1)] p-4">
                  <p className="text-sm font-semibold text-[var(--mkt-text1)]">{item.title}</p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
