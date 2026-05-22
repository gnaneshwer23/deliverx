"use client";

import { useState, useTransition } from "react";
import { Sparkles, Check, X, Pencil } from "lucide-react";
import type {
  AdaptiveRecommendation,
} from "@/services/adaptiveEngine";
import type { AdaptiveReviewRow } from "@/services/adaptive";

export type RecommendationWithReview = AdaptiveRecommendation & {
  review: AdaptiveReviewRow | null;
};

type ActionState = {
  busy: boolean;
  editingKey: string | null;
  edited: string;
  notice: string | null;
};

const CATEGORY_TONE: Record<AdaptiveRecommendation["category"], string> = {
  blocker: "bg-rose-100 text-rose-700",
  scope: "bg-indigo-100 text-indigo-700",
  dependency: "bg-amber-100 text-amber-700",
  cadence: "bg-slate-100 text-slate-700",
  capacity: "bg-emerald-100 text-emerald-700",
};

const REVIEW_LABEL: Record<AdaptiveReviewRow["action"], string> = {
  approved: "Approved",
  approved_with_edit: "Approved (edited)",
  rejected: "Rejected",
  ignored: "Ignored",
};

const REVIEW_TONE: Record<AdaptiveReviewRow["action"], string> = {
  approved: "bg-emerald-50 text-emerald-700",
  approved_with_edit: "bg-indigo-50 text-indigo-700",
  rejected: "bg-rose-50 text-rose-700",
  ignored: "bg-slate-100 text-slate-600",
};

export function AdaptiveRecommendationsPanel({
  projectId,
  items,
}: {
  projectId: string;
  items: RecommendationWithReview[];
}) {
  const [state, setState] = useState<ActionState>({
    busy: false,
    editingKey: null,
    edited: "",
    notice: null,
  });
  const [optimistic, setOptimistic] = useState<
    Record<string, AdaptiveReviewRow["action"]>
  >({});
  const [, startTransition] = useTransition();

  async function submitReview(
    rec: AdaptiveRecommendation,
    action: AdaptiveReviewRow["action"],
    editedText?: string,
  ) {
    setState((s) => ({ ...s, busy: true, notice: null }));
    setOptimistic((m) => ({ ...m, [rec.key]: action }));
    try {
      const res = await fetch("/api/adaptive/recommendation/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          recommendationKey: rec.key,
          action,
          originalActionText: rec.action,
          editedActionText: editedText ?? null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to record review");
      }
      setState({
        busy: false,
        editingKey: null,
        edited: "",
        notice: "Decision recorded.",
      });
      startTransition(() => {});
    } catch (err) {
      setOptimistic((m) => {
        const next = { ...m };
        delete next[rec.key];
        return next;
      });
      setState({
        busy: false,
        editingKey: null,
        edited: "",
        notice: err instanceof Error ? err.message : "Failed",
      });
    }
  }

  return (
    <section className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-indigo-700">
        <Sparkles size={14} />
        <h3 className="font-semibold">Adaptive Recommendations</h3>
        <span className="ml-auto text-xs text-slate-400">
          {items.length} active
        </span>
      </div>

      {state.notice ? (
        <p className="mb-3 rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-700">
          {state.notice}
        </p>
      ) : null}

      <ul className="space-y-3">
        {items.map((rec) => {
          const liveAction = optimistic[rec.key] ?? rec.review?.action ?? null;
          const isEditing = state.editingKey === rec.key;
          return (
            <li
              key={rec.key}
              className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${CATEGORY_TONE[rec.category]}`}
                    >
                      {rec.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {Math.round(rec.confidence * 100)}% confidence
                    </span>
                    {liveAction ? (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${REVIEW_TONE[liveAction]}`}
                      >
                        {REVIEW_LABEL[liveAction]}
                      </span>
                    ) : null}
                  </div>
                  {isEditing ? (
                    <textarea
                      value={state.edited}
                      onChange={(e) =>
                        setState((s) => ({ ...s, edited: e.target.value }))
                      }
                      rows={2}
                      className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  ) : (
                    <p className="mt-1.5 text-sm font-medium text-slate-900">
                      {rec.review?.edited_action_text ?? rec.action}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">{rec.rationale}</p>
                </div>
              </div>

              {!liveAction || isEditing ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        disabled={state.busy || !state.edited.trim()}
                        onClick={() =>
                          submitReview(
                            rec,
                            "approved_with_edit",
                            state.edited.trim(),
                          )
                        }
                        className="inline-flex h-7 items-center gap-1 rounded-md bg-indigo-600 px-3 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Save edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setState((s) => ({
                            ...s,
                            editingKey: null,
                            edited: "",
                          }))
                        }
                        className="inline-flex h-7 items-center gap-1 rounded-md px-3 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={state.busy}
                        onClick={() => submitReview(rec, "approved")}
                        className="inline-flex h-7 items-center gap-1 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        type="button"
                        disabled={state.busy}
                        onClick={() =>
                          setState({
                            busy: false,
                            editingKey: rec.key,
                            edited: rec.action,
                            notice: null,
                          })
                        }
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        disabled={state.busy}
                        onClick={() => submitReview(rec, "rejected")}
                        className="inline-flex h-7 items-center gap-1 rounded-md px-3 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      >
                        <X size={12} /> Reject
                      </button>
                      <button
                        type="button"
                        disabled={state.busy}
                        onClick={() => submitReview(rec, "ignored")}
                        className="inline-flex h-7 items-center gap-1 rounded-md px-3 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                      >
                        Ignore
                      </button>
                    </>
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[11px] text-slate-400">
        Guardrail: nothing is auto-applied. Every action requires PM approval.
      </p>
    </section>
  );
}
