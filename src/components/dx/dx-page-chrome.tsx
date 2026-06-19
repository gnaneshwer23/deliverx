import type { ReactNode } from "react";
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
}: {
  breadcrumb: string;
  breadcrumbNode?: ReactNode;
  title: string;
  titleEm?: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
  sticky?: boolean;
}) {
  return (
    <header
      className={`relative flex shrink-0 flex-wrap items-start justify-between gap-4 ${
        sticky ? dxClass.stickyHeader : "border-b border-[#E4E4DC] bg-white px-6 py-5 md:px-8"
      }`}
    >
      {sticky ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#1C4A2E] via-[#3D9660] to-[#1C4A2E]"
          aria-hidden
        />
      ) : null}
      <div className="min-w-0 flex-1">
        {breadcrumbNode ?? <DxCaps className="mb-1 text-[8px]">{breadcrumb}</DxCaps>}
        <h1 className={dxClass.pageTitle}>
          {title}
          {titleEm ? (
            <>
              {" "}
              <em className="text-[#1C4A2E] not-italic">{titleEm}</em>
            </>
          ) : null}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#6B6B64]">{subtitle}</p>
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
      <div className="mb-1.5 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.14em] text-[#A8A89E]">
        {label}
      </div>
      <div className={`${dxClass.display} text-[2rem] leading-none ${valueColor}`}>{value}</div>
      {hint ? (
        <div className="mt-1 font-[family-name:var(--font-dx-mono)] text-[8px] text-[#6B6B64]">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export function AuthBrandPanel() {
  const stats = [
    { v: "15min", l: "Setup time" },
    { v: "40%", l: "Less admin" },
    { v: "3x", l: "Faster reports" },
    { v: "97%", l: "Lessons retained" },
  ];

  return (
    <div className="relative flex flex-col justify-between overflow-hidden bg-[#0D0D0B] p-10 md:p-14">
      <div
        className="pointer-events-none absolute -right-[20%] -top-[30%] aspect-square w-[80%] rounded-full bg-[radial-gradient(circle,rgba(28,74,46,0.45)_0%,transparent_70%)]"
        aria-hidden
      />
      <div className="relative z-10">
        <DxLogo href="/" showTag dark />
        <h2 className={`${dxClass.display} mt-12 max-w-sm text-3xl leading-tight text-white md:text-4xl`}>
          The workspace where
          <br />
          delivery becomes
          <br />
          <em className="text-[#3D9660] not-italic">intelligent.</em>
        </h2>
        <p className="mt-3.5 max-w-xs text-base font-light leading-relaxed text-white/40">
          From business case to lessons learned — one workspace, AI watching everything.
        </p>
        <div className="mt-11 grid grid-cols-2 gap-3.5">
          {stats.map((s) => (
            <div key={s.l} className="border border-white/[0.08] p-4">
              <div className={`${dxClass.display} text-3xl text-white`}>{s.v}</div>
              <DxCaps className="mt-0.5 text-[7px] text-white/30">{s.l}</DxCaps>
            </div>
          ))}
        </div>
      </div>
      <DxCaps className="relative z-10 text-[7px] text-white/15">
        DeliverX © 2026 — GDPR Compliant — EU Data Residency
      </DxCaps>
    </div>
  );
}
