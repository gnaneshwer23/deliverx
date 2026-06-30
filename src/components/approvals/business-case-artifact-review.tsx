"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, Pencil, X } from "lucide-react";
import {
  ARTIFACT_ENTITY_LABELS,
  REVIEW_STATUS_LABELS,
} from "@/lib/approval/constants";
import type { ArtifactReviewRow } from "@/lib/approval/artifact-review";
import type {
  BusinessCaseStructuredAnalysis,
  StructuredCategory,
  StructuredCategoryDecision,
  StructuredCategoryId,
} from "@/lib/businessCaseStructuredAnalysis.shared";
import {
  allCategoriesResolved,
  categoriesReadyToApply,
} from "@/lib/businessCaseStructuredAnalysis.shared";

function parseStructuredAnalysis(
  payload: Record<string, unknown>,
): BusinessCaseStructuredAnalysis | null {
  const raw = payload.structuredAnalysis;
  if (!raw || typeof raw !== "object") return null;
  return raw as BusinessCaseStructuredAnalysis;
}

export function BusinessCaseArtifactReviewItem({
  review,
  showProject = true,
}: {
  review: ArtifactReviewRow & { project_name?: string };
  showProject?: boolean;
}) {
  const router = useRouter();
  const initial = parseStructuredAnalysis(review.payload);
  const [analysis, setAnalysis] = useState<BusinessCaseStructuredAnalysis | null>(initial);
  const [editingId, setEditingId] = useState<StructuredCategoryId | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canApply = useMemo(
    () => (analysis ? categoriesReadyToApply(analysis) : false),
    [analysis],
  );
  const allResolved = useMemo(
    () => (analysis ? allCategoriesResolved(analysis) : false),
    [analysis],
  );

  const persistAnalysis = useCallback(
    (next: BusinessCaseStructuredAnalysis) => {
      setAnalysis(next);
      startTransition(async () => {
        try {
          const res = await fetch("/api/artifacts/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: review.id,
              action: "edit",
              structuredAnalysis: next,
            }),
          });
          const data = (await res.json()) as { ok?: boolean; error?: string };
          if (!res.ok || !data.ok) {
            setError(data.error ?? "Could not save edits");
          }
        } catch {
          setError("Could not save edits");
        }
      });
    },
    [review.id],
  );

  function setCategoryDecision(id: StructuredCategoryId, decision: StructuredCategoryDecision) {
    if (!analysis) return;
    const next: BusinessCaseStructuredAnalysis = {
      ...analysis,
      categories: analysis.categories.map((cat) =>
        cat.id === id ? { ...cat, decision } : cat,
      ),
    };
    persistAnalysis(next);
  }

  function startEdit(category: StructuredCategory) {
    setEditingId(category.id);
    setEditDraft(category.items.map((i) => i.title).join("\n"));
  }

  function saveEdit(categoryId: StructuredCategoryId) {
    if (!analysis) return;
    const lines = editDraft
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const next: BusinessCaseStructuredAnalysis = {
      ...analysis,
      categories: analysis.categories.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          decision: "edited",
          items: lines.map((title, index) => ({
            id: `${categoryId}-edit-${index + 1}`,
            title,
            description: cat.items[index]?.description ?? "Edited by PM during review.",
          })),
        };
      }),
    };
    setEditingId(null);
    persistAnalysis(next);
  }

  function resolveBundle(action: "approve" | "reject") {
    setError(null);
    if (action === "approve" && !canApply) {
      setError("Accept at least one category before creating the workspace.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/artifacts/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: review.id, action }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          setError(data.error ?? "Action failed");
          return;
        }
        router.refresh();
      } catch {
        setError("Could not reach the server");
      }
    });
  }

  if (!analysis) {
    return (
      <li className="rounded-lg border border-[#C6DDD0] bg-[#EEF5F1] p-4">
        <p className="text-sm text-[#6B6B64]">
          Legacy business case review — use Approve/Reject on the standard panel or re-upload.
        </p>
      </li>
    );
  }

  return (
    <li className="rounded-lg border border-[#C6DDD0] bg-[#EEF5F1] p-4">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#1C4A2E]">
            {ARTIFACT_ENTITY_LABELS[review.entity_type]} · {REVIEW_STATUS_LABELS[review.status]}
          </p>
          <p className="mt-1 font-medium text-[#2C2C28]">{review.title}</p>
          {showProject && review.project_name ? (
            <Link
              href={`/workspace/pm-mission?project=${review.project_id}`}
              className="text-sm text-[#1C4A2E] hover:underline"
            >
              {review.project_name}
            </Link>
          ) : null}
          <p className="mt-1 text-sm text-[#6B6B64]">{analysis.summary}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {analysis.categories.map((category) => (
            <section
              key={category.id}
              className="rounded-lg border border-[var(--dx-rul)] bg-white p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#1C4A2E]">
                    {category.label}
                  </p>
                  <p className="text-[10px] text-[#A8A89E]">
                    {category.items.length} item{category.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                    category.decision === "accepted" || category.decision === "edited"
                      ? "bg-[#EEF5F1] text-[#1C4A2E]"
                      : category.decision === "rejected"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {category.decision}
                </span>
              </div>

              {editingId === category.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    rows={4}
                    className="w-full rounded border border-[var(--dx-rul)] px-2 py-1.5 text-xs"
                    aria-label={`Edit ${category.label}`}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(category.id)}
                      className="rounded bg-[#1C4A2E] px-2 py-1 text-[10px] font-medium text-white"
                    >
                      Save edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded border border-[var(--dx-rul)] px-2 py-1 text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="mt-2 space-y-1 text-xs text-[#6B6B64]">
                  {category.items.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <span className="font-medium text-[#2C2C28]">{item.title}</span>
                    </li>
                  ))}
                  {category.items.length > 4 ? (
                    <li className="text-[#A8A89E]">+{category.items.length - 4} more</li>
                  ) : null}
                </ul>
              )}

              {review.status === "needs_review" && editingId !== category.id ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setCategoryDecision(category.id, "accepted")}
                    className="inline-flex items-center gap-1 rounded bg-[#1C4A2E] px-2 py-1 text-[10px] font-medium text-white disabled:opacity-60"
                  >
                    <Check size={10} />
                    Accept
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => startEdit(category)}
                    className="inline-flex items-center gap-1 rounded border border-[var(--dx-rul)] bg-white px-2 py-1 text-[10px] font-medium disabled:opacity-60"
                  >
                    <Pencil size={10} />
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setCategoryDecision(category.id, "rejected")}
                    className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-medium text-rose-700 disabled:opacity-60"
                  >
                    <X size={10} />
                    Reject
                  </button>
                </div>
              ) : null}
            </section>
          ))}
        </div>

        {review.status === "needs_review" ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--dx-rul)] pt-3">
            <p className="text-xs text-[#6B6B64]">
              {allResolved
                ? canApply
                  ? "Ready — accept creates the project workspace from approved categories."
                  : "All categories rejected — reject the bundle or accept at least one category."
                : "Review each category — Accept, Edit, or Reject before creating workspace."}
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                disabled={isPending || !canApply}
                onClick={() => resolveBundle("approve")}
                className="inline-flex items-center gap-1 rounded bg-[#1C4A2E] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#163d26] disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Check size={12} />
                )}
                Accept & create workspace
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => resolveBundle("reject")}
                className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
              >
                <X size={12} />
                Reject bundle
              </button>
            </div>
          </div>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </li>
  );
}
