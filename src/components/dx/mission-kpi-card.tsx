import type { ReactNode } from "react";
import { Minus, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";

export type MissionKpiTone =
  | "default"
  | "healthy"
  | "green"
  | "teal"
  | "watch"
  | "amber"
  | "at-risk"
  | "rose"
  | "red"
  | "slate";

export type MissionKpiDelta = {
  value: string;
  direction: "up" | "down" | "warn" | "neutral";
};

export type MissionKpiCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: MissionKpiTone;
  progressPct?: number;
  delta?: MissionKpiDelta;
  className?: string;
  valueSize?: "xl" | "2xl";
};

const VALUE_COLOR: Record<MissionKpiTone, string> = {
  default: "text-[#0D0D0B]",
  slate: "text-[#0D0D0B]",
  teal: "text-[#1A6B3A]",
  green: "text-[#1A6B3A]",
  healthy: "text-[#1A6B3A]",
  amber: "text-[#B7620A]",
  watch: "text-[#B7620A]",
  rose: "text-[#C0392B]",
  red: "text-[#C0392B]",
  "at-risk": "text-[#C0392B]",
};

const BORDER_TOP: Record<MissionKpiTone, string> = {
  default: "border-t-[#1C4A2E]",
  slate: "border-t-[#1C4A2E]",
  teal: "border-t-[#1A6B3A]",
  green: "border-t-[#1A6B3A]",
  healthy: "border-t-[#1A6B3A]",
  amber: "border-t-[#B7620A]",
  watch: "border-t-[#B7620A]",
  rose: "border-t-[#C0392B]",
  red: "border-t-[#C0392B]",
  "at-risk": "border-t-[#C0392B]",
};

const BAR_COLOR: Record<MissionKpiTone, string> = {
  default: "bg-[#1C4A2E]",
  slate: "bg-[#1C4A2E]",
  teal: "bg-[#1A6B3A]",
  green: "bg-[#1A6B3A]",
  healthy: "bg-[#1A6B3A]",
  amber: "bg-[#B7620A]",
  watch: "bg-[#B7620A]",
  rose: "bg-[#C0392B]",
  red: "bg-[#C0392B]",
  "at-risk": "bg-[#C0392B]",
};

const DELTA_STYLE: Record<MissionKpiDelta["direction"], string> = {
  up: "text-[#1A6B3A]",
  down: "text-[#C0392B]",
  warn: "text-[#B7620A]",
  neutral: "text-[#6B6B64]",
};

const DELTA_ICON: Record<MissionKpiDelta["direction"], typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  warn: TriangleAlert,
  neutral: Minus,
};

/** Maps legacy KpiStrip accent names to mission KPI tones. */
export function accentToTone(accent?: "teal" | "amber" | "rose" | "slate"): MissionKpiTone {
  if (accent === "teal") return "teal";
  if (accent === "amber") return "amber";
  if (accent === "rose") return "rose";
  return "slate";
}

function clampPct(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function MissionKpiCard({
  label,
  value,
  hint,
  tone = "default",
  progressPct,
  delta,
  className = "",
  valueSize = "2xl",
}: MissionKpiCardProps) {
  const valueClass = valueSize === "2xl" ? "text-[2rem]" : "text-xl";
  const barWidth = progressPct != null ? `${clampPct(progressPct)}%` : undefined;
  const DeltaIcon = delta ? DELTA_ICON[delta.direction] : null;

  return (
    <div
      className={`${dxClass.card} border-t-2 ${BORDER_TOP[tone]} rounded-xl px-4 py-3.5 transition hover:shadow-[0_4px_20px_rgba(13,13,11,0.09)] ${className}`}
    >
      <p className="mb-1 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.16em] text-[#A8A89E]">
        {label}
      </p>
      <div className="flex items-end justify-between gap-1.5">
        <p className={`${dxClass.display} ${valueClass} leading-none tabular-nums ${VALUE_COLOR[tone]}`}>
          {value}
        </p>
        {delta && DeltaIcon ? (
          <span
            className={`mb-0.5 inline-flex items-center gap-0.5 font-[family-name:var(--font-dx-mono)] text-[7px] leading-tight ${DELTA_STYLE[delta.direction]}`}
          >
            <DeltaIcon size={9} strokeWidth={2} aria-hidden />
            {delta.value}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p className="mt-0.5 font-[family-name:var(--font-dx-mono)] text-[7px] leading-snug text-[#6B6B64]">{hint}</p>
      ) : null}
      {barWidth ? (
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E4E4DC]/70 shadow-inner"
          role="progressbar"
          aria-valuenow={clampPct(progressPct!)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={`h-full rounded-full ${BAR_COLOR[tone]}`} style={{ width: barWidth }} />
        </div>
      ) : null}
    </div>
  );
}

export function MissionKpiGrid({
  children,
  layout = "strip",
  className = "",
}: {
  children: ReactNode;
  layout?: "strip" | "mission" | "wide";
  className?: string;
}) {
  const gridClass =
    layout === "wide"
      ? "flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 xl:grid-cols-5 [&>*]:min-w-[42%] [&>*]:shrink-0 [&>*]:snap-start lg:[&>*]:min-w-0 lg:[&>*]:shrink"
      : layout === "mission"
        ? "grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7"
        : "grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-4";

  return <div className={`${gridClass} ${className}`}>{children}</div>;
}
