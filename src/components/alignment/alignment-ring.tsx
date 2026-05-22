import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { AlignmentTier, AlignmentTrend } from "@/services/alignmentEngine";

const TIER_STROKE: Record<AlignmentTier, string> = {
  aligned: "#0F766E",
  drifting: "#D97706",
  misaligned: "#DC2626",
};

const TIER_LABEL: Record<AlignmentTier, string> = {
  aligned: "Aligned",
  drifting: "Drifting",
  misaligned: "Off charter",
};

const SIZE_MAP = {
  sm: { box: 88, stroke: 6, font: "text-xl" },
  md: { box: 120, stroke: 8, font: "text-3xl" },
  lg: { box: 160, stroke: 10, font: "text-4xl" },
};

export function AlignmentRing({
  score,
  tier,
  trend,
  delta,
  size = "md",
  label = "Charter alignment",
}: {
  score: number;
  tier: AlignmentTier;
  trend: AlignmentTrend;
  delta?: number | null;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const { box, stroke, font } = SIZE_MAP[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = TIER_STROKE[tier];

  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  return (
    <div className="flex flex-col items-center">
      <p className="mb-3 text-center text-sm font-medium text-slate-600">{label}</p>
      <div className="relative" style={{ width: box, height: box }}>
        <svg width={box} height={box} className="-rotate-90">
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={stroke}
          />
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold tabular-nums text-slate-900 ${font}`}>{score}</span>
          <span className="text-xs text-slate-500">%</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        <span
          className="rounded-full px-2 py-0.5 font-medium"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {TIER_LABEL[tier]}
        </span>
        <span className="flex items-center gap-0.5 text-slate-500">
          <TrendIcon size={12} />
          {delta != null ? (
            <span
              className={
                delta > 0 ? "text-green-600" : delta < 0 ? "text-red-600" : "text-slate-400"
              }
            >
              {delta > 0 ? "+" : ""}
              {delta}%
            </span>
          ) : (
            "Baseline"
          )}
        </span>
      </div>
    </div>
  );
}
