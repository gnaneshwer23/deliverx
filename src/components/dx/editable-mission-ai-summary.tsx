"use client";

import { Sparkles } from "lucide-react";
import { InlineEditableText } from "@/components/dx/inline-editable-text";
import { aiSummaryFieldKey } from "@/lib/dashboard-inline-edit";

export function EditableMissionAiSummary({
  title,
  summary,
  icon = false,
}: {
  title: string;
  summary: string;
  icon?: boolean;
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
      <InlineEditableText
        fieldKey={aiSummaryFieldKey()}
        defaultValue={summary}
        quote
        className="mt-2 text-[#0D0D0B]"
        placeholder="Write your delivery summary…"
        label="AI summary"
      />
    </div>
  );
}
