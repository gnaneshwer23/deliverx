import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import type { NavPathSegment } from "@/lib/nav-path";

export function MissionNavPath({
  segments,
  showHomeIcon = false,
  className = "",
}: {
  segments: NavPathSegment[];
  showHomeIcon?: boolean;
  className?: string;
}) {
  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="Navigation path"
      className={`flex flex-wrap items-center gap-1 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.14em] text-[#A8A89E] ${className}`}
      data-testid="mission-nav-path"
    >
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        return (
          <span key={`${segment.label}-${index}`} className="inline-flex items-center gap-1">
            {index > 0 ? (
              <ChevronRight size={10} className="shrink-0 text-[#C8C8BE]" aria-hidden />
            ) : showHomeIcon ? (
              <Home size={10} className="shrink-0 text-[#A8A89E]" aria-hidden />
            ) : null}
            {segment.href && !isLast ? (
              <Link
                href={segment.href}
                className="transition-colors hover:text-[#1C4A2E]"
              >
                {segment.label}
              </Link>
            ) : (
              <span className={isLast ? "text-[#6B6B64]" : undefined}>{segment.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
