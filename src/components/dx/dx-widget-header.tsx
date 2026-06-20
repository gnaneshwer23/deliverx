import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";

export type DxWidgetHeaderProps = {
  title: string;
  subtitle?: string;
  count?: number;
  countTone?: "accent" | "neutral" | "urgent";
  href?: string;
  actionLabel?: string;
  trailing?: ReactNode;
  className?: string;
};

const COUNT_TONE = {
  accent: "bg-[#EDF7F7] text-[#1A5C5C]",
  neutral: "bg-[#F0F0E8] text-[#6B6B64]",
  urgent: "bg-[#FDF1F0] text-[#C0392B]",
} as const;

/** Monday-style widget header: title + optional count badge + subtle action link. */
export function DxWidgetHeader({
  title,
  subtitle,
  count,
  countTone = "accent",
  href,
  actionLabel = "View all",
  trailing,
  className = "",
}: DxWidgetHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-3 border-b border-[#E4E4DC] px-6 py-3.5 ${className}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`${dxClass.display} text-lg leading-tight`}>{title}</h3>
          {count != null ? (
            <span
              className={`inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${COUNT_TONE[countTone]}`}
            >
              {count}
            </span>
          ) : null}
        </div>
        {subtitle ? <p className="mt-0.5 text-xs text-[#6B6B64]">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {trailing}
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-0.5 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.08em] text-[#1C4A2E] transition hover:text-[#2D7048]"
          >
            {actionLabel}
            <ArrowUpRight size={12} aria-hidden />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
