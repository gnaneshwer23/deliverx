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
      <p className={mktClass.label}>What&apos;s included</p>
      <ul className="mt-4 space-y-3">
        {highlights.map((feature) => (
          <li
            key={feature}
            className="grid grid-cols-[auto_1fr] gap-3 text-[0.9375rem] leading-snug text-[var(--mkt-text1)]"
          >
            <span
              className="mt-[0.45rem] size-1 shrink-0 bg-[var(--mkt-green-l)]"
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>
      {rest.length > 0 ? (
        <div className="mt-7 border-t border-[var(--mkt-border)] pt-5">
          <p className={`${mktClass.label} mb-3.5`}>
            Also included · {rest.length} more
          </p>
          <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
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
    <div className="mt-8 border-t border-[var(--mkt-border)] pt-6">
      <p className={mktClass.label}>Ideal for</p>
      <p className="mt-2.5 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
        {children}
      </p>
    </div>
  );
}
