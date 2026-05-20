"use client";

import { useState, useTransition } from "react";
import { Check, X, Sparkles } from "lucide-react";
import type { Recommendation } from "@/services/intelligenceEngine";

type ReviewState = "pending" | "accepted" | "ignored";

export function RecommendationsPanel({
  projectId,
  items,
}: {
  projectId: string;
  items: Recommendation[];
}) {
  const [states, setStates] = useState<Record<string, ReviewState>>(
    Object.fromEntries(items.map((i) => [i.id, "pending"])),
  );
  const [isPending, startTransition] = useTransition();

  function review(id: string, action: "accept" | "ignore") {
    const next: ReviewState = action === "accept" ? "accepted" : "ignored";
    setStates((s) => ({ ...s, [id]: next }));

    startTransition(async () => {
      try {
        await fetch("/api/ai/recommendation/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, id, action }),
        });
      } catch {
        // Optimistic UI — revert on failure.
        setStates((s) => ({ ...s, [id]: "pending" }));
      }
    });
  }

  const visible = items.filter((i) => states[i.id] === "pending");

  return (
    <section className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
          <Sparkles size={14} />
        </span>
        <h3 className="font-semibold text-indigo-600">AI Recommendations</h3>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
          Top {items.length}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          All recommendations reviewed.
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3"
            >
              <p className="text-sm text-slate-800">{item.text}</p>
              <p className="mt-1 text-xs text-slate-500">{item.rationale}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Confidence: {Math.round(item.confidence * 100)}%
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => review(item.id, "accept")}
                    className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-white px-2 py-1 font-medium text-green-700 transition hover:bg-green-50 disabled:opacity-60"
                  >
                    <Check size={12} /> Accept
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => review(item.id, "ignore")}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    <X size={12} /> Ignore
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
