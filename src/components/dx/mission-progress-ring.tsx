type RingTone =
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

const RING_STROKE: Record<RingTone, string> = {
  default: "#1C4A2E",
  slate: "#1C4A2E",
  teal: "#1A6B3A",
  green: "#1A6B3A",
  healthy: "#1A6B3A",
  amber: "#B7620A",
  watch: "#B7620A",
  rose: "#C0392B",
  red: "#C0392B",
  "at-risk": "#C0392B",
};

function clampPct(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Circular progress ring — construction PM mobile hero-stat pattern. */
export function MissionProgressRing({
  pct,
  size = 40,
  strokeWidth = 3.5,
  tone = "default",
  label,
}: {
  pct: number;
  size?: number;
  strokeWidth?: number;
  tone?: RingTone;
  /** Shown inside ring when provided (e.g. "72%") */
  label?: string;
}) {
  const value = clampPct(pct);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const stroke = RING_STROKE[tone];

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${value}% complete`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--dx-rul2)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      {label ? (
        <span className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-dx-mono)] text-[7px] font-semibold tabular-nums text-[var(--dx-ink3)]">
          {label}
        </span>
      ) : null}
    </div>
  );
}
