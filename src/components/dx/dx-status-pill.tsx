import type { ReactNode } from "react";

/** Monday-inspired saturated status chips — DeliverX palette, not Monday purple. */
export const DX_STATUS_PILL_TONE = {
  urgent: "bg-[#C0392B] text-white border-[#C0392B]",
  "at-risk": "bg-[#C0392B] text-white border-[#C0392B]",
  waiting: "bg-[#6B6B64] text-white border-[#6B6B64]",
  review: "bg-[#B7620A] text-white border-[#B7620A]",
  decide: "bg-[#B7620A] text-white border-[#B7620A]",
  "on-track": "bg-[#1A6B3A] text-white border-[#1A6B3A]",
  clear: "bg-[#1A6B3A] text-white border-[#1A6B3A]",
  active: "bg-[#1A5C5C] text-white border-[#1A5C5C]",
  pending: "bg-[#1A5C5C]/90 text-white border-[#1A5C5C]",
  approved: "bg-[#1A6B3A] text-white border-[#1A6B3A]",
  proposed: "bg-[#B7620A] text-white border-[#B7620A]",
  submitted: "bg-[#B7620A] text-white border-[#B7620A]",
  critical: "bg-[#C0392B] text-white border-[#C0392B]",
  high: "bg-[#C0392B]/90 text-white border-[#C0392B]",
  medium: "bg-[#B7620A] text-white border-[#B7620A]",
  low: "bg-[#6B6B64]/80 text-white border-[#6B6B64]",
  slate: "bg-[#F0F0E8] text-[#6B6B64] border-[#E4E4DC]",
} as const;

export type DxStatusPillTone = keyof typeof DX_STATUS_PILL_TONE;

export function DxStatusPill({
  children,
  tone = "slate",
  size = "sm",
  className = "",
}: {
  children: ReactNode;
  tone?: DxStatusPillTone;
  size?: "xs" | "sm";
  className?: string;
}) {
  const sizeClass =
    size === "xs"
      ? "px-2 py-0.5 text-[9px] tracking-wide"
      : "px-2.5 py-0.5 text-[10px] tracking-wide";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold uppercase ${sizeClass} ${DX_STATUS_PILL_TONE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Map governance / RAID severity strings to pill tones. */
export function severityToPillTone(severity: string): DxStatusPillTone {
  const s = severity.toLowerCase();
  if (s === "critical" || s === "high") return "critical";
  if (s === "medium") return "medium";
  if (s === "low") return "low";
  return "slate";
}

/** Map PM team-need status labels to pill tones. */
export function teamNeedStatusToPillTone(status: string): DxStatusPillTone {
  const s = status.toLowerCase();
  if (s === "urgent") return "urgent";
  if (s === "waiting") return "waiting";
  if (s === "review") return "review";
  if (s === "clear") return "clear";
  return "slate";
}
