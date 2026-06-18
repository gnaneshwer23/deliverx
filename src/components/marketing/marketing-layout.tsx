import type { CSSProperties, ReactNode } from "react";
import { mkt } from "@/lib/marketing/landing-theme";

export function MarketingPageShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="marketing-page min-h-screen bg-[#0C0C0A] text-[#E8E6E1] antialiased"
      style={{ "--mkt-navh": `${mkt.navH}px` } as CSSProperties}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded focus:border focus:border-[#3D9660] focus:bg-[#111110] focus:px-4 focus:py-2 focus:text-xs focus:text-[#3D9660]"
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
    <div className={`mx-auto w-full max-w-[1200px] px-5 md:px-10 lg:px-12 ${className}`}>
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
      className={`scroll-mt-[var(--mkt-navh)] py-20 md:py-[clamp(80px,10vw,120px)] ${className}`}
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
      <p className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[#7A7874]">
        {label}
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-dx-display)] text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.02em] text-[#F0EDE8] [&_em]:not-italic [&_em]:text-[#3D9660]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 max-w-2xl text-[clamp(0.9375rem,1.5vw,1.0625rem)] font-light leading-relaxed text-[#B8B5AF]">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

export function MarketingDivider() {
  return <div className="h-px w-full bg-[#2E2E30]" aria-hidden />;
}

export function TrustChecklist({ items, light }: { items: string[]; light?: boolean }) {
  return (
    <ul
      className={`flex flex-wrap items-center gap-5 text-xs ${light ? "text-white/50" : "text-[#7A7874]"}`}
    >
      {items.map((item) => (
        <li key={item} className="flex items-center gap-1.5">
          <svg
            viewBox="0 0 24 24"
            className={`size-3 fill-none stroke-2 [stroke-linecap:round] ${light ? "stroke-white/70" : "stroke-[#3D9660]"}`}
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
