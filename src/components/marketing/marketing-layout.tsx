import type { CSSProperties, ReactNode } from "react";
import { mkt, mktClass, mktCssVars } from "@/lib/marketing/landing-theme";

export function MarketingPageShell({
  children,
  showSkipLink = true,
}: {
  children: ReactNode;
  showSkipLink?: boolean;
}) {
  return (
    <div
      className="marketing-page min-h-screen overflow-x-clip bg-[var(--mkt-ink)] text-[var(--mkt-text1)] antialiased"
      style={mktCssVars as CSSProperties}
    >
      {showSkipLink ? (
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded focus:border focus:border-[var(--mkt-green-l)] focus:bg-[var(--mkt-s1)] focus:px-4 focus:py-2 focus:text-xs focus:text-[var(--mkt-green-l)]"
        >
          Skip to content
        </a>
      ) : null}
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
      className={`mx-auto w-full px-5 md:px-10 lg:px-12 ${className}`}
      style={{ maxWidth: mkt.maxW }}
    >
      {children}
    </div>
  );
}

export type MarketingSectionTone =
  | "cream"
  | "white"
  | "green-tint"
  | "muted"
  | "dark"
  | "none";

const SECTION_TONE_CLASS: Record<MarketingSectionTone, string> = {
  cream: "bg-[var(--mkt-cream)]",
  white: "bg-[var(--mkt-s1)]",
  "green-tint":
    "bg-gradient-to-b from-[var(--mkt-mist)] via-[var(--mkt-cream)] to-[var(--mkt-ink)]",
  muted: "bg-[var(--mkt-s2)]",
  dark: "bg-[#0D0D0B] text-white overflow-hidden",
  none: "",
};

export function MarketingSection({
  id,
  children,
  className = "",
  tone = "none",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: MarketingSectionTone;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-[var(--mkt-navh)] py-20 md:py-[clamp(80px,10vw,128px)] ${SECTION_TONE_CLASS[tone]} ${className}`}
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
  align = "left",
}: {
  label: string;
  title: ReactNode;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <header className={`${centered ? "mx-auto max-w-2xl text-center" : "max-w-3xl"} ${className}`}>
      <p className={mktClass.label}>{label}</p>
      <h2 className={`mt-3.5 ${mktClass.sectionTitle} [&_em]:not-italic [&_em]:text-[var(--mkt-green)]`}>
        {title}
      </h2>
      {subtitle ? (
        <p className={`${mktClass.sectionSub} ${centered ? "mx-auto" : ""}`}>{subtitle}</p>
      ) : null}
    </header>
  );
}

export function MarketingDivider() {
  return <div className="h-px w-full bg-[var(--mkt-border)]" aria-hidden />;
}

function TrustCheckIcon({ light }: { light?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-3 shrink-0 fill-none stroke-2 [stroke-linecap:round] ${light ? "stroke-white/75" : "stroke-[var(--mkt-green-l)]"}`}
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function TrustChecklist({
  items,
  light,
  pills,
}: {
  items: string[];
  light?: boolean;
  pills?: boolean;
}) {
  if (pills) {
    return (
      <ul className="flex flex-wrap items-center gap-2">
        {items.map((item) => (
          <li
            key={item}
            className={`mkt-trust-pill ${light ? "!border-white/20 !bg-white/10 !text-white/85" : ""}`}
          >
            <TrustCheckIcon light={light} />
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul
      className={`flex flex-wrap items-center gap-5 text-xs ${light ? "text-white/60" : "text-[var(--mkt-text3)]"}`}
    >
      {items.map((item) => (
        <li key={item} className="flex items-center gap-1.5">
          <TrustCheckIcon light={light} />
          {item}
        </li>
      ))}
    </ul>
  );
}
