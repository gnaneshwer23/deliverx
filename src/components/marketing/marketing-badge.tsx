import type { ReactNode } from "react";
import type { BadgeTone } from "@/lib/marketing/landing-data";

const BADGE_STYLES: Record<BadgeTone, string> = {
  "badge-g": "bg-[rgba(61,150,96,.15)] text-[#3D9660]",
  "badge-a": "bg-[rgba(217,119,6,.15)] text-[#D97706]",
  "badge-n": "bg-[rgba(120,120,120,.15)] text-[#B8B5AF]",
};

export function MarketingBadge({
  tone,
  children,
  className = "",
}: {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.06em] ${BADGE_STYLES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
