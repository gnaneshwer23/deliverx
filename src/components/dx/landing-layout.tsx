import type { ReactNode } from "react";
import { DxBadge } from "@/components/dx/dx-badge";
import { DxCaps } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";
import type { LandingPreviewStats } from "@/services/landing";

type SectionTone = "base" | "white" | "muted" | "ink" | "accent";

const TONE: Record<SectionTone, string> = {
  base: "bg-[#FAFAF5] landing-section-base",
  white: "bg-white landing-section-white",
  muted: "bg-[#F7F7F2] landing-section-muted",
  ink: "bg-[#0D0D0B] text-white landing-section-ink",
  accent: "bg-[#EEF5F1] landing-section-accent",
};

/** Shared surface styles for landing cards */
export const landingCard =
  "border border-[#E4E4DC] bg-white transition duration-300 hover:border-[#C6DDD0] hover:shadow-[0_20px_50px_-24px_rgba(13,13,11,0.12)]";

export function LandingSkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:border focus:border-[#1C4A2E] focus:bg-white focus:px-4 focus:py-2 focus:font-[family-name:var(--font-dx-mono)] focus:text-[10px] focus:uppercase focus:tracking-wider focus:text-[#1C4A2E]"
    >
      Skip to content
    </a>
  );
}

export function LandingPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="landing-page min-h-screen bg-[#FAFAF5] text-[#0D0D0B] antialiased">
      <LandingSkipLink />
      {children}
    </div>
  );
}

export function LandingContainer({
  children,
  className = "",
  wide,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full px-6 md:px-10 ${wide ? "max-w-[1240px]" : "max-w-[1080px]"} ${className}`}
    >
      {children}
    </div>
  );
}

const SECTION_PAD = {
  default: "py-16 md:py-20",
  compact: "py-12 md:py-16",
  tight: "py-10 md:py-12",
} as const;

export function LandingSection({
  id,
  tone = "base",
  className = "",
  children,
  density = "default",
}: {
  id?: string;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
  density?: keyof typeof SECTION_PAD;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-[var(--dx-navh)] ${SECTION_PAD[density]} ${TONE[tone]} ${className}`}
    >
      {children}
    </section>
  );
}

/** Short transition band between major landing sections */
export function LandingSectionBridge({
  headline,
  sub,
  children,
}: {
  headline: ReactNode;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <div className="landing-section-bridge border-y border-[#C6DDD0]/80 bg-[#EEF5F1] py-8 md:py-10">
      <LandingContainer>
        <p className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.2em] text-[#1C4A2E]">
          Why DeliverX
        </p>
        <p className={`${dxClass.display} mt-2 max-w-3xl text-xl leading-snug text-[#0D0D0B] md:text-2xl`}>
          {headline}
        </p>
        {sub ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6B6B64] md:text-base">
            {sub}
          </p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </LandingContainer>
    </div>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  align = "left",
  light,
  lead,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  /** One-line outcome shown above the title */
  lead?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  const alignClass = align === "center" ? "mx-auto text-center" : "max-w-2xl";
  return (
    <header className={`mb-10 md:mb-12 ${alignClass}`}>
      <div className={`mb-4 flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
        <span
          className={`h-px w-8 ${light ? "bg-[#3D9660]" : "bg-[#1C4A2E]"}`}
          aria-hidden
        />
        <DxCaps accent={!light} className={light ? "text-[#3D9660]" : ""}>
          {eyebrow}
        </DxCaps>
      </div>
      {lead ? (
        <p
          className={`mb-3 text-sm font-medium leading-snug md:text-base ${
            light ? "text-[#3D9660]" : "text-[#1C4A2E]"
          } ${align === "center" ? "mx-auto" : ""}`}
        >
          {lead}
        </p>
      ) : null}
      <h2
        className={`${dxClass.sectionTitle} ${light ? "text-white" : ""} ${align === "center" ? "mx-auto" : ""}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-5 text-lg font-light leading-relaxed ${light ? "text-white/50" : "text-[#6B6B64]"} ${align === "center" ? "mx-auto max-w-xl" : "max-w-lg"}`}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="landing-nav-link font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.18em] text-[#6B6B64] transition hover:text-[#0D0D0B]"
    >
      {children}
    </a>
  );
}

export function SocialProofStrip({ className = "" }: { className?: string }) {
  const outcomes = [
    { n: "1", l: "Workspace", d: "Brief → closure" },
    { n: "0", l: "Silent AI changes", d: "Human approval gate" },
    { n: "15m", l: "To first project", d: "Guided setup" },
  ];
  return (
    <div className={className}>
      <p className="mb-3 text-sm font-medium text-[#2C2C28]">
        For PMO, digital, and transformation teams
      </p>
      <div className="grid grid-cols-3 gap-2 border border-[#E4E4DC] bg-white/80 sm:gap-3">
        {outcomes.map((o) => (
          <div key={o.l} className="px-3 py-3 sm:px-4 sm:py-3.5">
            <p className="landing-stat-value font-[family-name:var(--font-dx-display)] text-2xl leading-none text-[#1C4A2E] tabular-nums sm:text-3xl">
              {o.n}
            </p>
            <p className="mt-1 text-[11px] font-semibold leading-tight text-[#0D0D0B] sm:text-xs">
              {o.l}
            </p>
            <p className="mt-0.5 hidden text-[10px] font-light text-[#6B6B64] sm:block">
              {o.d}
            </p>
          </div>
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.14em] text-[#6B6B64]">
        <li className="flex items-center gap-1.5">
          <span className="size-1 bg-[#3D9660]" aria-hidden />
          No credit card
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-1 bg-[#3D9660]" aria-hidden />
          GDPR ready
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-1 bg-[#3D9660]" aria-hidden />
          Free trial
        </li>
      </ul>
    </div>
  );
}

function MockFloatingBadge({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <div
      className={`absolute z-20 hidden border border-[#E4E4DC]/90 bg-white/95 px-3 py-2 shadow-[0_16px_40px_-12px_rgba(13,13,11,0.2)] backdrop-blur-md md:block ${className}`}
    >
      {children}
    </div>
  );
}

export function LandingMockupScene({ preview }: { preview: LandingPreviewStats }) {
  return (
    <div className="landing-mock-3d relative">
      <MockFloatingBadge className="-left-6 top-8 max-w-[11rem] landing-badge-float-a">
        <p className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#3D9660]">
          AI Coach
        </p>
        <p className="mt-1 text-[11px] leading-snug text-[#2C2C28]">
          Rebalance QA before sprint 14
        </p>
      </MockFloatingBadge>
      <MockFloatingBadge className="-right-4 bottom-16 landing-badge-float-b">
        <p className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#B7620A]">
          Alert queue
        </p>
        <p className="mt-1 text-[11px] leading-snug text-[#2C2C28]">2 items awaiting approval</p>
      </MockFloatingBadge>

      <div className="landing-mock-float relative">
        {preview.live ? (
          <LandingLiveMockup preview={preview} />
        ) : (
          <LandingDashboardMockup />
        )}
      </div>
    </div>
  );
}

function LandingLiveMockup({ preview }: { preview: LandingPreviewStats }) {
  return (
    <div
      className="overflow-hidden border border-[#E4E4DC] bg-white shadow-[0_40px_120px_-24px_rgba(13,13,11,0.22)] ring-1 ring-[#0D0D0B]/[0.05]"
      aria-label="DeliverX live workspace preview"
    >
      <div className="flex items-center border-b border-[#F0F0E8] bg-[#0a0e14] px-5 py-3">
        <DxCaps className="text-[#9ca3af]">Your workspace</DxCaps>
        <span className="ml-auto inline-flex items-center gap-1.5 font-[family-name:var(--font-dx-mono)] text-[8px] text-[#3D9660]">
          <span
            className="size-1.5 rounded-full bg-[#1A6B3A]"
            style={{ animation: "dx-pulse 2s ease-in-out infinite" }}
          />
          Live data
        </span>
      </div>
      <div className="grid grid-cols-3 gap-px bg-[#F0F0E8]">
        {[
          { v: `${preview.confidence}%`, l: "Confidence", c: "text-[#1A6B3A]" },
          { v: String(preview.atRisk), l: "At risk", c: "text-[#B7620A]" },
          { v: String(preview.blocked), l: "Blocked", c: "text-[#C0392B]" },
        ].map((s) => (
          <div key={s.l} className="bg-white px-4 py-5 text-center sm:py-6">
            <div
              className={`landing-stat-value ${dxClass.display} text-3xl leading-none tabular-nums sm:text-4xl ${s.c}`}
            >
              {s.v}
            </div>
            <DxCaps className="mt-2 text-[8px]">{s.l}</DxCaps>
          </div>
        ))}
      </div>
      <div className="space-y-2 p-4">
        {preview.signals.map((signal) => (
          <div
            key={signal.text}
            className={`flex items-center justify-between gap-3 border-l-[3px] px-3 py-2.5 ${
              signal.tone === "red"
                ? "bg-[#FDF1F0]/80"
                : signal.tone === "amber"
                  ? "bg-[#FEF6EC]/80"
                  : "bg-[#EDF7F1]/80"
            }`}
            style={{
              borderLeftColor:
                signal.tone === "red"
                  ? "#C0392B"
                  : signal.tone === "amber"
                    ? "#B7620A"
                    : "#1A6B3A",
            }}
          >
            <span className="text-[13px] leading-snug text-[#2C2C28]">{signal.text}</span>
            <DxBadge
              tone={
                signal.tone === "green" ? "green" : signal.tone === "amber" ? "amber" : "red"
              }
            >
              {signal.badge}
            </DxBadge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingDashboardMockup({
  className = "",
  float,
}: {
  className?: string;
  float?: boolean;
}) {
  const projects = [
    { name: "Platform migration", health: 78, tier: "watch" as const },
    { name: "CRM rollout", health: 91, tier: "healthy" as const },
    { name: "Data programme", health: 64, tier: "at-risk" as const },
  ];

  return (
    <div
      className={`relative ${float ? "landing-mock-float" : ""} ${className}`}
      aria-label="DeliverX dashboard preview"
    >
      <div
        className="pointer-events-none absolute -inset-4 -z-10 bg-gradient-to-br from-[#C6DDD0]/40 via-transparent to-[#E4E4DC]/30 blur-2xl"
        aria-hidden
      />
      <div className="landing-mock-frame relative overflow-hidden border border-[#E4E4DC] bg-white shadow-[0_32px_100px_-20px_rgba(13,13,11,0.18)] ring-1 ring-[#0D0D0B]/[0.04]">
        <div className="flex items-center border-b border-white/10 bg-[#0a0e14] px-5 py-3.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2 rounded-full bg-[#C0392B]/80" />
            <span className="size-2 rounded-full bg-[#B7620A]/80" />
            <span className="size-2 rounded-full bg-[#1A6B3A]/80" />
          </div>
          <span className="ml-4 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.2em] text-[#9ca3af]">
            DeliverX · Command centre
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#1A6B3A]/30 bg-[#1A6B3A]/10 px-2 py-0.5 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wide text-[#3D9660]">
            <span className="size-1.5 animate-pulse rounded-full bg-[#1A6B3A]" />
            Live
          </span>
        </div>

        <div className="grid grid-cols-4 gap-px bg-[#F0F0E8]">
          {[
            { v: "84%", l: "Confidence", c: "text-[#1A6B3A]" },
            { v: "3", l: "At risk", c: "text-[#B7620A]" },
            { v: "4", l: "Blocked", c: "text-[#C0392B]" },
            { v: "↑12%", l: "Velocity", c: "text-[#1C4A2E]" },
          ].map((k) => (
            <div key={k.l} className="bg-white px-3 py-5 text-center sm:px-4 sm:py-6">
              <div
                className={`landing-stat-value ${dxClass.display} text-3xl leading-none tabular-nums sm:text-4xl ${k.c}`}
              >
                {k.v}
              </div>
              <DxCaps className="mt-2 text-[8px] sm:text-[9px]">{k.l}</DxCaps>
            </div>
          ))}
        </div>

        <div className="grid gap-px bg-[#F0F0E8] lg:grid-cols-5">
          <div className="space-y-3 bg-white p-5 lg:col-span-3">
            <DxCaps className="text-[7px]">Portfolio health</DxCaps>
            {projects.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F7F7F2]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      p.tier === "healthy"
                        ? "bg-[#1A6B3A]"
                        : p.tier === "watch"
                          ? "bg-[#B7620A]"
                          : "bg-[#C0392B]"
                    }`}
                    style={{ width: `${p.health}%` }}
                  />
                </div>
                <span className="w-[7.5rem] truncate text-xs text-[#2C2C28]">{p.name}</span>
                <span className="w-10 text-right font-[family-name:var(--font-dx-mono)] text-[11px] font-medium tabular-nums text-[#0D0D0B]">
                  {p.health}%
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-between bg-gradient-to-b from-[#EEF5F1] to-[#E8F2EC] p-5 lg:col-span-2">
            <div>
              <DxCaps className="text-[7px] text-[#1C4A2E]">Needs attention</DxCaps>
              <p className="mt-2 text-[13px] leading-snug text-[#2C2C28]">
                Vendor scope risk
              </p>
              <p className="text-[12px] text-[#6B6B64]">2 alerts in review queue</p>
            </div>
            <div className="mt-4 flex items-center gap-2 border border-[#C6DDD0]/80 bg-white/90 px-3 py-2 backdrop-blur-sm">
              <span className="flex size-6 items-center justify-center bg-[#1C4A2E] text-[10px] text-white">
                ✦
              </span>
              <span className="text-[11px] leading-tight text-[#2C2C28]">
                Coach suggests rebalancing QA
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
