import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Minus, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";
import { MissionProgressRing } from "@/components/dx/mission-progress-ring";
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
  icon?: LucideIcon;
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

const ICON_BG: Record<MissionKpiTone, string> = {
  default: "bg-[#EEF5F1] text-[#1C4A2E]",
  slate: "bg-[#F3F4F6] text-[#1C4A2E]",
  teal: "bg-[#EDF7F1] text-[#1A6B3A]",
  green: "bg-[#EDF7F1] text-[#1A6B3A]",
  healthy: "bg-[#EDF7F1] text-[#1A6B3A]",
  amber: "bg-[#FEF6EC] text-[#B7620A]",
  watch: "bg-[#FEF6EC] text-[#B7620A]",
  rose: "bg-[#FDF1F0] text-[#C0392B]",
  red: "bg-[#FDF1F0] text-[#C0392B]",
  "at-risk": "bg-[#FDF1F0] text-[#C0392B]",
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
  icon: Icon,
  className = "",
  valueSize = "2xl",
}: MissionKpiCardProps) {
  const valueClass = valueSize === "2xl" ? "text-[2rem]" : "text-xl";
  const barWidth = progressPct != null ? `${clampPct(progressPct)}%` : undefined;
  const DeltaIcon = delta ? DELTA_ICON[delta.direction] : null;

  return (
    <div
      className={`${dxClass.card} border-t-[3px] ${BORDER_TOP[tone]} px-5 py-4 transition hover:shadow-[var(--dx-shadow-card-hover)] ${className}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.16em] text-[var(--dx-fnt)]">
          {label}
        </p>
        {Icon ? (
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-[var(--dx-radius-sm)] ${ICON_BG[tone]}`}
            aria-hidden
          >
            <Icon size={15} strokeWidth={2} />
          </span>
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className={`${dxClass.display} ${valueClass} leading-none tabular-nums ${VALUE_COLOR[tone]}`}>
          {value}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          {progressPct != null ? (
            <MissionProgressRing
              pct={progressPct}
              tone={tone}
              size={36}
              label={`${clampPct(progressPct)}%`}
            />
          ) : null}
          {delta && DeltaIcon ? (
            <span
              className={`mb-0.5 inline-flex items-center gap-0.5 font-[family-name:var(--font-dx-mono)] text-[7px] leading-tight ${DELTA_STYLE[delta.direction]}`}
            >
              <DeltaIcon size={9} strokeWidth={2} aria-hidden />
              {delta.value}
            </span>
          ) : null}
        </div>
      </div>
      {hint ? (
        <p className="mt-1 font-[family-name:var(--font-dx-mono)] text-[7px] leading-snug text-[var(--dx-mut)]">{hint}</p>
      ) : null}
      {barWidth ? (
        <div
          className="mt-2.5 hidden h-1.5 overflow-hidden rounded-full bg-[var(--dx-rul2)] lg:block"
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
      ? "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-4 lg:gap-2.5 lg:overflow-visible lg:pb-0 xl:grid-cols-5 [&>*]:min-w-[44%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:min-w-[38%] lg:[&>*]:min-w-0 lg:[&>*]:shrink"
      : layout === "mission"
        ? "grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-7"
        : "grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-4";

  const grid = <div className={`${gridClass} ${className}`}>{children}</div>;

  if (layout === "wide") {
    return <div className="dx-kpi-scroll-wrap">{grid}</div>;
  }

  return grid;
}
