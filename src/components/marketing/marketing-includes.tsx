import { mktClass } from "@/lib/marketing/landing-theme";

const HIGHLIGHT_COUNT = 6;

/**
 * Feature includes without a wall of bullets:
 * a short highlight list + denser “also included” grid.
 */
export function MarketingIncludes({
  items,
  highlightCount = HIGHLIGHT_COUNT,
  hideLabel = false,
  tone = "light",
}: {
  items: readonly string[];
  highlightCount?: number;
  /** When the section intro already says “What’s included” */
  hideLabel?: boolean;
  tone?: "light" | "dark";
}) {
  const highlights = items.slice(0, highlightCount);
  const rest = items.slice(highlightCount);
  const dark = tone === "dark";

  return (
    <div>
      {hideLabel ? null : (
        <p className={`${mktClass.label} ${dark ? "!text-white/50" : ""}`}>
          What&apos;s included
        </p>
      )}
      <ul className={`${hideLabel ? "mt-0" : "mt-4"} space-y-3`}>
        {highlights.map((feature) => (
          <li
            key={feature}
            className={`grid grid-cols-[auto_1fr] gap-3 text-[0.9375rem] leading-snug ${
              dark ? "text-white/85" : "text-[var(--mkt-text1)]"
            }`}
          >
            <span
              className={`mt-[0.45rem] size-1 shrink-0 rounded-full ${
                dark ? "bg-white/70" : "bg-[var(--mkt-green-l)]"
              }`}
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>
      {rest.length > 0 ? (
        <div
          className={`mt-7 border-t pt-5 ${dark ? "border-white/15" : "border-[var(--mkt-border)]"}`}
        >
          <p className={`${mktClass.label} mb-3.5 ${dark ? "!text-white/45" : ""}`}>
            Also included · {rest.length} more
          </p>
          <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {rest.map((feature) => (
              <li
                key={feature}
                className={`text-[0.8125rem] leading-snug ${
                  dark ? "text-white/50" : "text-[var(--mkt-text3)]"
                }`}
              >
                {feature}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function MarketingIdealFor({
  children,
  tone = "light",
}: {
  children: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`mt-8 border-t pt-6 ${dark ? "border-white/15" : "border-[var(--mkt-border)]"}`}
    >
      <p className={`${mktClass.label} ${dark ? "!text-white/45" : ""}`}>Ideal for</p>
      <p
        className={`mt-2.5 max-w-xl text-[0.9375rem] leading-relaxed ${
          dark ? "text-white/70" : "text-[var(--mkt-text2)]"
        }`}
      >
        {children}
      </p>
    </div>
  );
}
