import { MarketingContainer } from "@/components/marketing/marketing-layout";
import { QUICK_START_STEPS } from "@/lib/marketing/landing-data";

export function MarketingQuickStartStrip() {
  return (
    <section
      id="quick-start"
      aria-label="Three steps to start"
      className="border-y border-[var(--mkt-border)] bg-[var(--mkt-s2)] py-8 md:py-10"
    >
      <MarketingContainer>
        <p className="mb-5 text-center font-[family-name:var(--font-mkt-mono)] text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-[var(--mkt-text3)]">
          Start in three steps
        </p>
        <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
          {QUICK_START_STEPS.map((item, index) => (
            <li key={item.label} className="relative flex gap-4 md:block md:text-center">
              {index < QUICK_START_STEPS.length - 1 ? (
                <div
                  className="pointer-events-none absolute left-[1.125rem] top-10 hidden h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-[var(--mkt-green-l)]/40 to-transparent md:left-[calc(50%+1.75rem)] md:top-7 md:block md:w-[calc(100%-3.5rem)]"
                  aria-hidden
                />
              ) : null}
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(61,150,96,0.25)] bg-[rgba(61,150,96,0.08)] font-[family-name:var(--font-mkt-mono)] text-[0.6875rem] font-semibold text-[var(--mkt-green-l)] md:mx-auto">
                {item.step}
              </span>
              <div className="min-w-0 md:mt-3">
                <p className="text-sm font-semibold text-[var(--mkt-text1)]">{item.label}</p>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </MarketingContainer>
    </section>
  );
}
