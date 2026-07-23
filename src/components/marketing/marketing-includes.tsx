import { mktClass } from "@/lib/marketing/landing-theme";

const HIGHLIGHT_COUNT = 6;

/**
 * Feature includes without a wall of bullets:
 * a short highlight list + denser “also included” grid.
 */
export function MarketingIncludes({
  items,
  highlightCount = HIGHLIGHT_COUNT,
}: {
  items: readonly string[];
  highlightCount?: number;
}) {
  const highlights = items.slice(0, highlightCount);
  const rest = items.slice(highlightCount);

  return (
    <div>
      <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-[var(--mkt-text3)]">
        What&apos;s included
      </p>
      <ul className="mt-4 space-y-2.5">
        {highlights.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-[0.9375rem] text-[var(--mkt-text2)]">
            <span
              className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--mkt-green-l)]"
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>
      {rest.length > 0 ? (
        <div className="mt-6 border-t border-[var(--mkt-border)] pt-5">
          <p className={`${mktClass.label} mb-3`}>Also included · {rest.length} more</p>
          <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {rest.map((feature) => (
              <li key={feature} className="text-[0.8125rem] leading-snug text-[var(--mkt-text3)]">
                {feature}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function MarketingIdealFor({ children }: { children: string }) {
  return (
    <p className="mt-6 border-l-2 border-[var(--mkt-green-l)] pl-4 text-[0.875rem] leading-relaxed text-[var(--mkt-text3)]">
      <span className="font-medium text-[var(--mkt-text1)]">Ideal for </span>
      {children}
    </p>
  );
}
