import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { ClampableSummary } from "@/components/dx/clampable-summary";

export function MissionAiSummaryBlock({
  title,
  summary,
  icon = false,
  children,
}: {
  title: string;
  summary: string;
  icon?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#C6DDD0] bg-[#EEF5F1]/60 p-5">
      {icon ? (
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#1C4A2E]">
          <Sparkles size={14} aria-hidden />
          {title}
        </div>
      ) : (
        <p className="text-xs font-semibold uppercase tracking-wide text-[#1C4A2E]">{title}</p>
      )}
      <ClampableSummary text={summary} className="mt-2 text-[#0D0D0B]" />
      {children}
    </div>
  );
}
