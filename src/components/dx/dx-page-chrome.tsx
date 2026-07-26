import type { ReactNode } from "react";
import type { MissionPersonaAccent } from "@/config/mission-persona-accent";
import { personaHeaderStripStyle } from "@/config/mission-persona-accent";
import { DxCaps, DxLogo } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";

export function DxPageHeader({
  breadcrumb,
  breadcrumbNode,
  title,
  titleEm,
  subtitle,
  action,
  children,
  sticky = false,
  accent,
}: {
  breadcrumb: string;
  breadcrumbNode?: ReactNode;
  title: string;
  titleEm?: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
  sticky?: boolean;
  /** Persona accent — top strip gradient and title emphasis color */
  accent?: MissionPersonaAccent;
}) {
  const titleEmColor = accent?.primary ?? "#1C4A2E";

  return (
    <header
      className={`relative flex shrink-0 flex-wrap items-start justify-between gap-4 ${
        sticky ? dxClass.stickyHeader : "border-b border-[var(--dx-rul)] bg-white px-6 py-5 md:px-8"
      }`}
    >
      {sticky ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5"
          style={accent ? personaHeaderStripStyle(accent) : {
            background: "linear-gradient(to right, #1C4A2E, #3D9660, #1C4A2E)",
          }}
          aria-hidden
        />
      ) : null}
      <div className="min-w-0 flex-1">
        {breadcrumbNode ?? <DxCaps className="mb-1 text-xs">{breadcrumb}</DxCaps>}
        <h1 className={dxClass.pageTitle}>
          {title}
          {titleEm ? (
            <>
              {" "}
              <em className="not-italic" style={{ color: titleEmColor }}>
                {titleEm}
              </em>
            </>
          ) : null}
        </h1>
        {subtitle ? (
          <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-[var(--dx-mut)]">{subtitle}</p>
        ) : null}
        {children}
      </div>
      {action ? <div className="shrink-0 self-start">{action}</div> : null}
    </header>
  );
}

export function DxStatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "green" | "amber" | "red" | "blue" | "default";
}) {
  const valueColor =
    tone === "green"
      ? "text-[#1A6B3A]"
      : tone === "amber"
        ? "text-[#B7620A]"
        : tone === "red"
          ? "text-[#C0392B]"
          : tone === "blue"
            ? "text-[#1A3F6B]"
            : "text-[#0D0D0B]";

  return (
    <div className={`${dxClass.card} p-4 md:p-[18px]`}>
      <div className="mb-1.5 font-[family-name:var(--font-dx-mono)] text-xs uppercase tracking-[0.1em] text-[#4B5563]">
        {label}
      </div>
      <div className={`${dxClass.display} text-[2rem] leading-none ${valueColor}`}>{value}</div>
      {hint ? (
        <div className="mt-1 font-[family-name:var(--font-dx-mono)] text-xs text-[#4B5563]">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export function AuthBrandPanel() {
  const principles = [
    "Evidence before claims",
    "AI drafts — you decide",
    "Observation consent default OFF",
    "Verified only via attestation",
  ];

  return (
    <div className="relative flex flex-col justify-between overflow-hidden bg-[#0D0D0B] p-10 md:p-14">
      <div
        className="pointer-events-none absolute -right-[20%] -top-[30%] aspect-square w-[80%] rounded-full bg-[radial-gradient(circle,rgba(28,74,46,0.45)_0%,transparent_70%)]"
        aria-hidden
      />
      <div className="relative z-10">
        <DxLogo href="/" dark />
        <h2 className={`${dxClass.display} mt-12 max-w-sm text-3xl leading-tight text-white md:text-4xl`}>
          Professional Intelligence
          <br />
          for product careers —
          <br />
          <em className="text-[#3D9660] not-italic">evidence first.</em>
        </h2>
        <p className="mt-3.5 max-w-xs text-base font-light leading-relaxed text-white/75">
          Experience, Launchpad and Professional Workspace share one intelligence layer — not chat history as the database.
        </p>
        <ul className="mt-11 space-y-3">
          {principles.map((line) => (
            <li
              key={line}
              className="border border-white/[0.08] px-4 py-3 text-sm font-light leading-snug text-white/70"
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
      <DxCaps className="relative z-10 text-xs text-white/70">
        DeliverX © 2026 — Privacy controls in product — See /privacy
      </DxCaps>
    </div>
  );
}
