import type { ReactNode } from "react";
import Link from "next/link";
import { dxClass } from "@/lib/dx-theme";

export type FeedCardSeverity = "high" | "medium" | "low" | "neutral";

export type FeedCardProps = {
  severity?: FeedCardSeverity;
  badge: string;
  badgeClassName?: string;
  title: ReactNode;
  meta?: ReactNode;
  timestamp?: string;
  href?: string;
  actions?: ReactNode;
  className?: string;
};

const SEVERITY_DOT: Record<FeedCardSeverity, string> = {
  high: "bg-[#C0392B]",
  medium: "bg-[#B7620A]",
  low: "bg-[#1A6B3A]",
  neutral: "bg-[#A8A89E]",
};

export function FeedCard({
  severity = "neutral",
  badge,
  badgeClassName = "text-[#1C4A2E] bg-[#EEF5F1]",
  title,
  meta,
  timestamp,
  href,
  actions,
  className = "",
}: FeedCardProps) {
  const content = (
    <div
      className={`${dxClass.card} flex gap-3 p-4 transition hover:shadow-[0_4px_20px_rgba(13,13,11,0.09)] ${href ? "cursor-pointer" : ""} ${className}`}
    >
      <span
        className={`mt-1.5 size-2 shrink-0 rounded-full ${SEVERITY_DOT[severity]}`}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${badgeClassName}`}
          >
            {badge}
          </span>
          {meta ? (
            <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase text-[#A8A89E]">
              {meta}
            </span>
          ) : null}
        </div>
        <p className="mt-1.5 text-sm leading-snug text-[#2C2C28]">{title}</p>
        {timestamp ? (
          <time className="mt-1.5 block font-[family-name:var(--font-dx-mono)] text-[8px] text-[#A8A89E]">
            {timestamp}
          </time>
        ) : null}
      </div>
      {actions ? <div className="shrink-0 self-start">{actions}</div> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export function FeedCardList({
  children,
  title,
  icon,
  emptyMessage,
  isEmpty,
}: {
  children?: ReactNode;
  title?: string;
  icon?: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}) {
  if (isEmpty && emptyMessage) {
    return <div className={`${dxClass.card} p-6 text-sm text-[#6B6B64]`}>{emptyMessage}</div>;
  }

  return (
    <div className="space-y-2">
      {title ? (
        <div className="mb-3 flex items-center gap-2">
          {icon}
          <h3 className={`${dxClass.display} text-lg`}>{title}</h3>
        </div>
      ) : null}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/** Maps delivery impact tone to feed card severity. */
export function impactToneToSeverity(tone: string): FeedCardSeverity {
  if (tone === "blocked") return "high";
  if (tone === "waiting" || tone === "pending") return "medium";
  if (tone === "ready") return "low";
  return "neutral";
}

export const IMPACT_BADGE_CLASS: Record<string, string> = {
  updated: "text-[#1C4A2E] bg-[#EEF5F1]",
  blocked: "text-[#B7620A] bg-[#FEF6EC]",
  waiting: "text-[#6B6B64] bg-[#F7F7F2]",
  ready: "text-[#1A6B3A] bg-[#EDF7F1]",
  pending: "text-[#6B6B64] bg-[#F7F7F2]",
};
