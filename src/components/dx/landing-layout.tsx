import type { ReactNode } from "react";
import { DxBadge } from "@/components/dx/dx-badge";
import { DxCaps } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";
import type { LandingPreviewStats } from "@/services/landing";

type SectionTone = "base" | "white" | "muted" | "ink" | "accent";

const TONE: Record<SectionTone, string> = {
  base: "bg-[#FAFAF5]",
  white: "bg-white",
  muted: "bg-[#F7F7F2]",
  ink: "bg-[#0D0D0B] text-white",
  accent: "bg-[#EEF5F1]",
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

export function LandingSection({
  id,
  tone = "base",
  className = "",
  children,
  bleed,
}: {
  id?: string;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-[var(--dx-navh)] py-24 md:py-32 ${TONE[tone]} ${bleed ? "" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  align = "left",
  light,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  const alignClass = align === "center" ? "mx-auto text-center" : "max-w-2xl";
  return (
    <header className={`mb-14 md:mb-20 ${alignClass}`}>
      <DxCaps
        accent={!light}
        className={`mb-4 block ${light ? "text-[#3D9660]" : ""}`}
      >
        {eyebrow}
      </DxCaps>
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
  const teams = ["PMO", "Digital", "Transformation", "Platform", "Programme"];
  return (
    <div className={className}>
      <p className="mb-4 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.16em] text-[#A8A89E]">
        Built for delivery teams
      </p>
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex -space-x-2.5" aria-hidden>
          {["SK", "JM", "AL", "RP", "TC"].map((initials, i) => (
            <span
              key={initials}
              className="flex size-9 items-center justify-center border-2 border-[#FAFAF5] bg-[#EEF5F1] font-[family-name:var(--font-dx-mono)] text-[10px] font-medium text-[#1C4A2E] shadow-sm"
              style={{ zIndex: 5 - i }}
            >
              {initials}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.12em] text-[#A8A89E]">
          {teams.map((t) => (
            <span key={t} className="text-[#6B6B64]/80">
              {t}
            </span>
          ))}
        </div>
      </div>
      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.14em] text-[#A8A89E]">
        <li>No credit card</li>
        <li>15 min setup</li>
        <li>GDPR ready</li>
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
          <div key={s.l} className="bg-white px-4 py-4 text-center">
            <div className={`${dxClass.display} text-xl leading-none ${s.c}`}>{s.v}</div>
            <DxCaps className="mt-1 text-[6px]">{s.l}</DxCaps>
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
      <div className="overflow-hidden border border-[#E4E4DC] bg-white shadow-[0_32px_100px_-20px_rgba(13,13,11,0.18)] ring-1 ring-[#0D0D0B]/[0.04]">
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
            <div key={k.l} className="bg-white px-4 py-5 text-center">
              <div className={`${dxClass.display} text-2xl leading-none ${k.c}`}>{k.v}</div>
              <DxCaps className="mt-1.5 text-[7px]">{k.l}</DxCaps>
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
                <span className="w-8 text-right font-[family-name:var(--font-dx-mono)] text-[9px] tabular-nums text-[#A8A89E]">
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
