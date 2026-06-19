"use client";

import { useCallback, useState } from "react";
import { ClampableSummary } from "@/components/dx/clampable-summary";
import { useDashboardCustomize } from "@/components/dx/dashboard-customize-context";
import { dxClass } from "@/lib/dx-theme";

export function InlineEditableText({
  fieldKey,
  defaultValue,
  multiline = true,
  quote = false,
  className = "",
  placeholder = "Add a note…",
  label,
}: {
  fieldKey: string;
  defaultValue: string;
  multiline?: boolean;
  quote?: boolean;
  className?: string;
  placeholder?: string;
  label?: string;
}) {
  const { contentEditMode, resolveFieldText, setFieldText } = useDashboardCustomize();
  const resolved = resolveFieldText(fieldKey, defaultValue);
  const [draft, setDraft] = useState(resolved);
  const [prevResolved, setPrevResolved] = useState(resolved);
  if (resolved !== prevResolved) {
    setPrevResolved(resolved);
    setDraft(resolved);
  }

  const commit = useCallback(() => {
    setFieldText(fieldKey, draft);
  }, [draft, fieldKey, setFieldText]);

  if (!contentEditMode) {
    if (!resolved.trim()) return null;
    if (multiline) {
      return <ClampableSummary text={resolved} quote={quote} className={className} />;
    }
    return <p className={className}>{resolved}</p>;
  }

  const inputClassName = `${dxClass.input} ${multiline ? "min-h-[88px] resize-y leading-relaxed" : ""}`;

  return (
    <div
      className={`rounded-lg border border-dashed border-[#3D9660]/40 bg-[#EEF5F1]/40 p-3 ${className}`}
      data-inline-edit-field={fieldKey}
    >
      {label ? (
        <p className="mb-1.5 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.1em] text-[#1C4A2E]">
          {label}
        </p>
      ) : null}
      {multiline ? (
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          placeholder={placeholder}
          className={inputClassName}
          rows={3}
        />
      ) : (
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          placeholder={placeholder}
          className={inputClassName}
        />
      )}
    </div>
  );
}
