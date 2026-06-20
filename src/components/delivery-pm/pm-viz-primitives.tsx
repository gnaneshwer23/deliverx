import type { PmBarSegment, PmMilestoneTimelineSegment } from "@/lib/pm-viz-helpers";

const MILESTONE_STATUS_COLOR = {
  done: "bg-[#1A6B3A]",
  active: "bg-[#1A5C5C]",
  pending: "bg-[#D4EBEB]",
} as const;

const MILESTONE_STATUS_BORDER = {
  done: "border-[#1A6B3A]",
  active: "border-[#1A5C5C] ring-2 ring-[#1A5C5C]/30",
  pending: "border-[#B8D8D8]",
} as const;

export function PmHorizontalStackedBar({
  segments,
  heightClass = "h-3",
  emptyLabel = "No items",
}: {
  segments: PmBarSegment[];
  heightClass?: string;
  emptyLabel?: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (total === 0) {
    return (
      <div
        className={`${heightClass} overflow-hidden rounded-full bg-[#E4E4DC]/80`}
        role="img"
        aria-label={emptyLabel}
      />
    );
  }

  return (
    <div
      className={`flex ${heightClass} overflow-hidden rounded-full bg-[#E4E4DC]/60 shadow-inner`}
      role="img"
      aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(", ")}
    >
      {segments.map((segment, index) => (
        <div
          key={segment.id}
          className="h-full transition-all first:rounded-l-full last:rounded-r-full"
          style={{
            width: `${(segment.value / total) * 100}%`,
            backgroundColor: segment.color,
            boxShadow: index > 0 ? "inset 2px 0 0 rgba(255,255,255,0.25)" : undefined,
          }}
          title={`${segment.label}: ${segment.value}`}
        />
      ))}
    </div>
  );
}

export function PmBarLegend({ segments }: { segments: PmBarSegment[] }) {
  if (segments.length === 0) return null;

  return (
    <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
      {segments.map((segment) => (
        <span key={segment.id} className="inline-flex items-center gap-1.5 text-[10px] text-[#6B6B64]">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: segment.color }}
            aria-hidden
          />
          <span className="tabular-nums font-semibold text-[#2C2C28]">{segment.value}</span>
          <span>{segment.label}</span>
        </span>
      ))}
    </div>
  );
}

export function PmMilestoneTimelineStrip({
  segments,
  compact = false,
}: {
  segments: PmMilestoneTimelineSegment[];
  compact?: boolean;
}) {
  if (segments.length === 0) {
    return (
      <p className="text-sm text-[#6B6B64]">No milestones planned yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex overflow-hidden rounded-lg border border-[#B8D8D8]">
        {segments.map((segment, index) => (
          <div
            key={`${segment.phase}-${index}`}
            className={`${MILESTONE_STATUS_COLOR[segment.status]} h-2 min-w-[8px] transition-all`}
            style={{ width: `${segment.widthPct}%` }}
            title={`${segment.phase} — ${segment.status}`}
          />
        ))}
      </div>
      {!compact ? (
        <div className="flex flex-wrap gap-2">
          {segments.map((segment, index) => (
            <span
              key={`label-${segment.phase}-${index}`}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${MILESTONE_STATUS_BORDER[segment.status]} ${
                segment.status === "pending" ? "text-[#2C5A5A]" : "text-white"
              } ${segment.status === "pending" ? "bg-[#EDF7F7]" : ""}`}
            >
              {segment.status === "done" ? "✓" : segment.status === "active" ? "●" : "○"}
              <span className="max-w-[120px] truncate">{segment.phase}</span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PmSeverityBar({
  pct,
  tone = "default",
}: {
  pct: number;
  tone?: "urgent" | "decide" | "default";
}) {
  const barColor =
    tone === "urgent"
      ? "bg-[#C0392B]"
      : tone === "decide"
        ? "bg-[#B7620A]"
        : "bg-[#1A5C5C]";

  return (
    <div
      className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-[#E4E4DC]/80 shadow-inner"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function PmTabProgressDot({ pct, color }: { pct: number; color: string }) {
  if (pct <= 0) return null;
  return (
    <span
      className="ml-1 inline-block h-1.5 rounded-full"
      style={{ width: `${Math.max(12, Math.min(32, pct * 0.32))}px`, backgroundColor: color }}
      aria-hidden
    />
  );
}
