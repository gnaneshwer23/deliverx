import type { CSSProperties, ReactNode } from "react";
import { mkt, mktCssVars } from "@/lib/marketing/landing-theme";

export function MarketingPageShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="marketing-page min-h-screen bg-[var(--mkt-ink)] text-[var(--mkt-text1)] antialiased"
      style={mktCssVars as CSSProperties}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded focus:border focus:border-[var(--mkt-green-l)] focus:bg-[var(--mkt-s1)] focus:px-4 focus:py-2 focus:text-xs focus:text-[var(--mkt-green-l)]"
      >
        Skip to content
      </a>
      {children}
    </div>
  );
}

export function MarketingContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[${mkt.maxW}px] px-5 md:px-10 lg:px-12 ${className}`}
      style={{ maxWidth: mkt.maxW }}
    >
      {children}
    </div>
  );
}

export function MarketingSection({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-[var(--mkt-navh)] py-12 md:py-[clamp(48px,7vw,80px)] ${className}`}
    >
      {children}
    </section>
  );
}

export function MarketingSectionIntro({
  label,
  title,
  subtitle,
  className = "",
}: {
  label: string;
  title: ReactNode;
  subtitle?: string;
  className?: string;
}) {
  return (
    <header className={className}>
      <p className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--mkt-text3)]">
        {label}
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-dx-display)] text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.02em] text-[var(--mkt-text1)] [&_em]:not-italic [&_em]:text-[var(--mkt-green-l)]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-[clamp(0.9375rem,1.5vw,1.0625rem)] font-light leading-relaxed text-[var(--mkt-text2)]">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

export function MarketingDivider() {
  return <div className="h-px w-full bg-[var(--mkt-border)]" aria-hidden />;
}

export function TrustChecklist({ items, light }: { items: string[]; light?: boolean }) {
  return (
    <ul
      className={`flex flex-wrap items-center gap-5 text-xs ${light ? "text-white/60" : "text-[var(--mkt-text3)]"}`}
    >
      {items.map((item) => (
        <li key={item} className="flex items-center gap-1.5">
          <svg
            viewBox="0 0 24 24"
            className={`size-3 fill-none stroke-2 [stroke-linecap:round] ${light ? "stroke-white/75" : "stroke-[var(--mkt-green-l)]"}`}
            aria-hidden
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {item}
        </li>
      ))}
    </ul>
  );
}
