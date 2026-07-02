import { MarketingBadge } from "@/components/marketing/marketing-badge";
import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import {
  COMING_SOON,
  LIVE_FEATURE_CATEGORIES,
  LIVE_FEATURES,
  type LiveFeatureCategory,
} from "@/lib/marketing/landing-data";

const CATEGORY_ORDER: LiveFeatureCategory[] = ["onboarding", "ai-meetings", "visibility"];

const FEATURE_ICONS: Record<LiveFeatureCategory, readonly string[]> = {
  onboarding: [
    "M9 12h6M9 16h4M7 4h10a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z",
    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8",
  ],
  "ai-meetings": [
    "M9 12l2 2 4-4 M3 4h18v16H3z",
    "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2",
    "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    "M8 7h8M8 11h6M8 15h4",
  ],
  visibility: [
    "M12 2L2 7l10 5 10-5-10-5z",
    "M3 3h18v18H3z M3 9h18",
  ],
};

const ROADMAP_ICONS = [
  "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
] as const;

function FeatureIcon({ path, accent }: { path: string; accent: string }) {
  return (
    <span
      className="mkt-feature-icon"
      style={{ background: `${accent}14`, color: accent }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function LiveCheckBadge() {
  return (
    <span className="mkt-live-badge">
      <svg viewBox="0 0 24 24" className="size-3 fill-none stroke-current stroke-2 [stroke-linecap:round]" aria-hidden>
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Live on main
    </span>
  );
}

function RoadmapPanelVisual() {
  return (
    <div className="mkt-roadmap-visual mb-5 rounded-xl border border-[var(--mkt-border)] bg-[var(--mkt-s2)] p-4" aria-hidden>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[rgba(61,150,96,0.12)] text-[var(--mkt-green-l)]">
            <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-[1.5]" aria-hidden>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <p className="font-[family-name:var(--font-mkt-mono)] text-[0.55rem] uppercase tracking-[0.12em] text-[var(--mkt-text3)]">
              Product roadmap
            </p>
            <p className="text-xs font-medium text-[var(--mkt-text1)]">3 items queued</p>
          </div>
        </div>
        <MarketingBadge tone="badge-n">No dates yet</MarketingBadge>
      </div>
      <div className="mt-3 flex gap-1">
        {[0.85, 0.55, 0.3].map((opacity, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{ background: `rgba(61, 150, 96, ${opacity})` }}
          />
        ))}
      </div>
    </div>
  );
}

export function MarketingWhatWorksSection() {
  const featuresByCategory = CATEGORY_ORDER.map((categoryId) => ({
    ...LIVE_FEATURE_CATEGORIES[categoryId],
    id: categoryId,
    features: LIVE_FEATURES.filter((f) => f.category === categoryId),
  }));

  return (
    <MarketingSection id="features-live" tone="white">
      <MarketingContainer>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <MarketingSectionIntro
            label="What's live today"
            title={
              <>
                Shipped and <em>in production.</em>
              </>
            }
            subtitle="No vapourware. These are the capabilities live on main today — the same paths you get when you start a free trial."
          />
          <div className="mkt-live-stat shrink-0 lg:mb-1">
            <p className="font-[family-name:var(--font-dx-display)] text-3xl leading-none tracking-tight text-[var(--mkt-green-l)]">
              {LIVE_FEATURES.length}
            </p>
            <p className="mt-1 font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--mkt-text3)]">
              Live capabilities
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.55fr_1fr]">
          <div className="space-y-10">
            {featuresByCategory.map((group) => {
              const icons = FEATURE_ICONS[group.id];
              return (
                <section key={group.id} aria-labelledby={`live-cat-${group.id}`}>
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span
                          className="size-2 rounded-full"
                          style={{ background: group.accent }}
                          aria-hidden
                        />
                        <h3
                          id={`live-cat-${group.id}`}
                          className="text-sm font-semibold text-[var(--mkt-text1)]"
                        >
                          {group.label}
                        </h3>
                        <span className="font-[family-name:var(--font-mkt-mono)] text-[0.625rem] text-[var(--mkt-text3)]">
                          {group.features.length} live
                        </span>
                      </div>
                      <p className="mt-1.5 max-w-xl text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">
                        {group.summary}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {group.features.map((feature, index) => (
                      <article
                        key={feature.title}
                        className="mkt-feature-row mkt-card mkt-card-lift group flex flex-col p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <FeatureIcon path={icons[index % icons.length]!} accent={group.accent} />
                          <LiveCheckBadge />
                        </div>
                        <p className="mt-4 text-sm font-semibold leading-snug text-[var(--mkt-text1)]">
                          {feature.title}
                        </p>
                        <p className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">
                          {feature.description}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <aside className="mkt-roadmap-panel mkt-card-gradient flex flex-col p-5 md:p-6 xl:sticky xl:top-[calc(var(--mkt-navh)+1.5rem)] xl:self-start">
            <header className="mb-1">
              <p className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--mkt-green-l)]">
                On the roadmap
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-[var(--mkt-text1)]">Coming soon</h3>
                <MarketingBadge tone="badge-n">Not in production</MarketingBadge>
              </div>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">
                Honest next-up items we&apos;re building — listed here so you know what&apos;s planned, not promised on a date.
              </p>
            </header>

            <RoadmapPanelVisual />

            <ul className="space-y-3">
              {COMING_SOON.map((item, index) => (
                <li
                  key={item.title}
                  className="mkt-roadmap-item group rounded-xl border border-[var(--mkt-border)] bg-[var(--mkt-s1)] p-4 transition duration-200 hover:border-[rgba(61,150,96,0.35)] hover:shadow-[var(--dx-shadow-sm)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[rgba(120,120,120,0.08)] text-[var(--mkt-text3)] transition group-hover:bg-[rgba(61,150,96,0.1)] group-hover:text-[var(--mkt-green-l)]">
                      <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-[1.5]" aria-hidden>
                        <path d={ROADMAP_ICONS[index % ROADMAP_ICONS.length]} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--mkt-text1)]">{item.title}</p>
                        <MarketingBadge tone={item.priorityTone}>{item.priorityLabel}</MarketingBadge>
                      </div>
                      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-5 border-t border-[var(--mkt-border)] pt-4 text-[0.6875rem] leading-relaxed text-[var(--mkt-text3)]">
              Roadmap order may shift based on pilot feedback. We only list items here when the direction is clear — not when they ship.
            </p>
          </aside>
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
