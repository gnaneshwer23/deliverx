import type { ReactNode } from "react";
import { dxClass } from "@/lib/dx-theme";

/** Large, high-contrast stat for landing sections */
export function LandingStatValue({
  children,
  tone = "green",
  className = "",
}: {
  children: ReactNode;
  tone?: "green" | "white" | "ink";
  className?: string;
}) {
  const toneClass =
    tone === "white"
      ? "text-white"
      : tone === "ink"
        ? "text-[#1C4A2E]"
        : "text-[#3D9660]";
  return (
    <p
      className={`landing-stat-value ${dxClass.display} text-4xl leading-none tracking-tight tabular-nums sm:text-5xl ${toneClass} ${className}`}
    >
      {children}
    </p>
  );
}

export function LandingStatCard({
  value,
  title,
  description,
  icon: Icon,
  light,
}: {
  value: string;
  title: string;
  description: string;
  icon?: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  light?: boolean;
}) {
  return (
    <article
      className={`relative overflow-hidden border p-6 md:p-8 ${
        light
          ? "border-white/10 bg-white/[0.06]"
          : "border-[#E4E4DC] bg-white"
      }`}
    >
      {Icon ? (
        <span
          className={`mb-4 flex size-10 items-center justify-center border ${
            light
              ? "border-[#3D9660]/35 bg-[#3D9660]/15"
              : "border-[#C6DDD0] bg-[#EEF5F1]"
          }`}
        >
          <Icon
            size={18}
            className={light ? "text-[#3D9660]" : "text-[#1C4A2E]"}
            strokeWidth={1.5}
          />
        </span>
      ) : null}
      <LandingStatValue tone={light ? "green" : "ink"}>{value}</LandingStatValue>
      <h3
        className={`mt-3 text-base font-semibold leading-snug md:text-lg ${
          light ? "text-white" : "text-[#0D0D0B]"
        }`}
      >
        {title}
      </h3>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          light ? "text-white/70" : "text-[#6B6B64]"
        }`}
      >
        {description}
      </p>
    </article>
  );
}

/** Compact stat for section headers (e.g. platform row) */
export function LandingMetricChip({
  value,
  label,
  valueClassName = "text-[#1C4A2E]",
}: {
  value: string;
  label: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex min-w-[7.5rem] flex-col border border-[#E4E4DC] bg-white px-3 py-2.5">
      <span
        className={`${dxClass.display} text-xl leading-none tabular-nums ${valueClassName}`}
      >
        {value}
      </span>
      <span className="mt-1 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#6B6B64]">
        {label}
      </span>
    </div>
  );
}

export function LandingMetricTile({
  value,
  label,
  sub,
  valueClassName = "text-[#1C4A2E]",
}: {
  value: string;
  label: string;
  sub?: string;
  valueClassName?: string;
}) {
  return (
    <div className="border border-[#E4E4DC] bg-white px-5 py-6 md:px-6 md:py-7">
      <p className={`landing-stat-value ${dxClass.display} text-3xl tabular-nums md:text-4xl ${valueClassName}`}>
        {value}
      </p>
      <p className="mt-2 text-sm font-semibold text-[#0D0D0B]">{label}</p>
      {sub ? (
        <p className="mt-1 text-xs font-light leading-snug text-[#6B6B64]">{sub}</p>
      ) : null}
    </div>
  );
}
