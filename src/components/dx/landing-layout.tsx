import type { ReactNode } from "react";
import { DxCaps } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";

type SectionTone = "base" | "white" | "muted" | "ink" | "accent";

const TONE: Record<SectionTone, string> = {
  base: "bg-[#FAFAF5]",
  white: "bg-white",
  muted: "bg-[#F7F7F2]",
  ink: "bg-[#0D0D0B] text-white",
  accent: "bg-[#EEF5F1]",
};

export function LandingPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="landing-page min-h-screen bg-[#FAFAF5] text-[#0D0D0B] antialiased">
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
