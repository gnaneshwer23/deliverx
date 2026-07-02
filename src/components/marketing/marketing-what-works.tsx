import { MarketingBadge } from "@/components/marketing/marketing-badge";
import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { COMING_SOON, LIVE_FEATURES } from "@/lib/marketing/landing-data";

const FEATURE_ICON_PATHS = [
  "M9 12h6M9 16h4M7 4h10a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z",
  "M9 12l2 2 4-4 M3 4h18v16H3z",
  "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2",
  "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8",
  "M12 2L2 7l10 5 10-5-10-5z",
  "M3 3h18v18H3z M3 9h18",
] as const;

function FeatureIcon({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d={FEATURE_ICON_PATHS[index % FEATURE_ICON_PATHS.length]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CAPABILITY_PILLS = [
  "Delivery Brain",
  "AI Review Queue",
  "Role dashboards",
  "Signal graph",
  "Meeting intelligence",
  "Organisational memory",
] as const;

export function MarketingWhatWorksSection() {
  return (
    <MarketingSection id="features-live" tone="white">
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

        <div className="mt-10 flex flex-wrap gap-2">
          {CAPABILITY_PILLS.map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(61,150,96,0.2)] bg-[rgba(61,150,96,0.06)] px-3 py-1.5 font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--mkt-green-l)]"
            >
              <svg viewBox="0 0 24 24" className="size-3 fill-none stroke-current stroke-2 [stroke-linecap:round]" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {pill}
            </span>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {LIVE_FEATURES.map((feature, index) => (
              <article
                key={feature.title}
                className="mkt-feature-row mkt-card mkt-card-lift flex flex-col p-5"
              >
                <span className="mkt-feature-icon" aria-hidden>
                  <FeatureIcon index={index} />
                </span>
                <p className="mt-4 text-sm font-semibold text-[var(--mkt-text1)]">{feature.title}</p>
                <p className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">
                  {feature.description}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-[0.6875rem] font-medium text-[var(--mkt-green-l)]">
                  <svg viewBox="0 0 24 24" className="size-3 fill-none stroke-current stroke-2 [stroke-linecap:round]" aria-hidden>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Live on main
                </p>
              </article>
            ))}
          </div>

          <aside className="mkt-card mkt-card-gradient p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <p className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--mkt-text3)]">
                Coming soon
              </p>
              <MarketingBadge tone="badge-n">Roadmap</MarketingBadge>
            </div>
            <ul className="space-y-3">
              {COMING_SOON.map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl border border-[var(--mkt-border)] bg-[var(--mkt-s2)] p-4 transition duration-200 hover:border-[var(--mkt-border-l)] hover:shadow-[var(--dx-shadow-sm)]"
                >
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
