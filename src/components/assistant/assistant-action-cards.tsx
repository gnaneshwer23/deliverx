"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import type { ProposedAction } from "@/services/assistantActions";

export function AssistantActionCards({
  actions,
  onApplied,
}: {
  actions: ProposedAction[];
  onApplied?: () => void;
}) {
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();

  if (!actions.length) return null;

  function apply(action: ProposedAction) {
    start(async () => {
      setErrors((e) => {
        const next = { ...e };
        delete next[action.id];
        return next;
      });
      try {
        const res = await fetch("/api/ai/assistant/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          setErrors((e) => ({
            ...e,
            [action.id]: data.error ?? "Could not apply",
          }));
          return;
        }
        setApplied((s) => new Set(s).add(action.id));
        onApplied?.();
      } catch {
        setErrors((e) => ({ ...e, [action.id]: "Network error" }));
      }
    });
  }

  return (
    <div className="mt-2 space-y-2 border-t border-[#E4E4DC] pt-2">
      <p className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wide text-[#6B6B64]">
        Proposed actions — approve to apply
      </p>
      {actions.map((action) => {
        const done = applied.has(action.id);
        return (
          <div
            key={action.id}
            className="border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2 text-sm"
          >
            <p className="font-medium text-[#1C4A2E]">{action.summary}</p>
            <p className="mt-0.5 text-xs text-[#6B6B64]">
              {action.type === "create_raid" ? "Create RAID item" : "Create task"} ·{" "}
              {action.title}
            </p>
            {errors[action.id] ? (
              <p className="mt-1 text-xs text-[#C0392B]">{errors[action.id]}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              {done ? (
                <span className="inline-flex items-center gap-1 text-xs text-[#1A6B3A]">
                  <Check size={12} /> Applied
                </span>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => apply(action)}
                  className="text-xs font-medium text-[#1C4A2E] underline disabled:opacity-50"
                >
                  {pending ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 size={12} className="animate-spin" /> Applying…
                    </span>
                  ) : (
                    "Approve & apply"
                  )}
                </button>
              )}
              <Link
                href={`/project/${action.projectId}`}
                className="text-xs text-[#6B6B64] hover:text-[#1C4A2E]"
              >
                View project →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
