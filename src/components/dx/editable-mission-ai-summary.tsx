"use client";

import { Sparkles } from "lucide-react";
import { InlineEditableText } from "@/components/dx/inline-editable-text";
import { aiSummaryFieldKey } from "@/lib/dashboard-inline-edit";

export function EditableMissionAiSummary({
  title,
  summary,
  icon = false,
  compact = false,
}: {
  title: string;
  summary: string;
  icon?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-[#B8D8D8] bg-[#EDF7F7]/60 ${compact ? "p-4" : "p-5"}`}>
      {icon ? (
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#1A5C5C]">
          <Sparkles size={14} aria-hidden />
          {title}
        </div>
      ) : (
        <p className="text-xs font-semibold uppercase tracking-wide text-[#1A5C5C]">{title}</p>
      )}
      <InlineEditableText
        fieldKey={aiSummaryFieldKey()}
        defaultValue={summary}
        quote
        className={`mt-2 text-[#0D0D0B] ${compact ? "line-clamp-2 text-sm" : ""}`}
        placeholder="Write your delivery summary…"
        label="AI summary"
      />
    </div>
  );
}
