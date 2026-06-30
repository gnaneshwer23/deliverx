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
    <div
      className={`rounded-[var(--dx-radius-lg)] border border-[var(--dx-acr)] bg-gradient-to-br from-[var(--dx-acb)] to-white shadow-[var(--dx-shadow-sm)] ${compact ? "p-4" : "p-5"}`}
    >
      {icon ? (
        <div className="mb-2 flex items-center gap-2 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.14em] text-[var(--dx-acc)]">
          <Sparkles size={14} aria-hidden />
          {title}
        </div>
      ) : (
        <p className="font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.14em] text-[var(--dx-acc)]">{title}</p>
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
