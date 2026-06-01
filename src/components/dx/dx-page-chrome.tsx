import type { ReactNode } from "react";
import { DxCaps, DxLogo } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";

export function DxPageHeader({
  breadcrumb,
  title,
  titleEm,
  action,
}: {
  breadcrumb: string;
  title: string;
  titleEm?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-[#E4E4DC] bg-white px-6 py-5 md:px-8">
      <div>
        <DxCaps className="mb-1 text-[8px]">{breadcrumb}</DxCaps>
        <h1 className={dxClass.pageTitle}>
          {title}
          {titleEm ? (
            <>
              {" "}
              <em className="text-[#1C4A2E] not-italic">{titleEm}</em>
            </>
          ) : null}
        </h1>
      </div>
      {action}
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
    { v: "15×", l: "Faster reports" },
    { v: "97%", l: "Lessons retained" },
  ];

  return (
    <div className="relative flex flex-col justify-between overflow-hidden bg-[#0a0e14] p-10 md:p-14">
      <div className="landing-pp-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative z-10">
        <DxLogo href="/" showTag dark />
        <p className="mt-10 font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.22em] text-[#6ee7c7]">
          AI-native delivery operations
        </p>
        <h2 className={`${dxClass.display} mt-4 max-w-sm text-3xl leading-tight text-[#f8f6f2] md:text-4xl`}>
          Status in minutes.
          <br />
          <span className="text-[#6ee7c7]">Not weeks.</span>
        </h2>
        <p className="mt-3.5 max-w-xs text-base font-light leading-relaxed text-white/45">
          One workspace from business case to closure — AI proposes, humans approve.
        </p>
        <div className="mt-11 grid grid-cols-2 gap-3.5">
          {stats.map((s) => (
            <div
              key={s.l}
              className="rounded-2xl border border-white/[0.08] bg-[#111820]/80 p-4 backdrop-blur-sm"
            >
              <div className={`${dxClass.display} text-3xl text-[#6ee7c7]`}>{s.v}</div>
              <DxCaps className="mt-0.5 text-[7px] text-white/30">{s.l}</DxCaps>
            </div>
          ))}
        </div>
      </div>
      <DxCaps className="relative z-10 text-[7px] text-white/15">
        DeliverX © 2026 — GDPR · EU Data Residency
      </DxCaps>
    </div>
  );
}
