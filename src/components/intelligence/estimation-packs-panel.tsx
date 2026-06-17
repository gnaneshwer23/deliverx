"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import {
  ESTIMATION_ROLE_LABELS,
  type EstimationLineItem,
} from "@/services/estimationEngine";
import type { EstimationPackRow } from "@/services/estimationPacks";

const STATUS_STYLE = {
  draft: "bg-slate-100 text-slate-700",
  pending: "bg-amber-50 text-amber-800",
  approved: "bg-emerald-50 text-emerald-800",
  rejected: "bg-rose-50 text-rose-800",
} as const;

function PackActions({
  projectId,
  pack,
}: {
  projectId: string;
  pack: EstimationPackRow;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [lineItems, setLineItems] = useState(pack.line_items);

  function resolve(action: "approve" | "reject" | "submit" | "modify") {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/project/${projectId}/estimations/resolve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packId: pack.id,
            action,
            lineItems: action === "modify" ? lineItems : undefined,
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Action failed");
          return;
        }
        setEditing(false);
        router.refresh();
      } catch {
        setError("Could not reach the server");
      }
    });
  }

  function updateItem(index: number, patch: Partial<EstimationLineItem>) {
    setLineItems((items) =>
      items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      {editing ? (
        <div className="space-y-2">
          {lineItems.map((item, index) => (
            <div key={item.id} className="flex gap-2">
              <input
                className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs"
                value={item.title}
                onChange={(e) => updateItem(index, { title: e.target.value })}
              />
              <input
                type="number"
                min={0}
                step={0.5}
                className="w-16 rounded border border-slate-200 px-2 py-1 text-xs"
                value={item.days}
                onChange={(e) =>
                  updateItem(index, { days: Number(e.target.value) || 0 })
                }
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => resolve("modify")}
              className="rounded bg-teal-700 px-2 py-1 text-xs font-medium text-white hover:bg-teal-800 disabled:opacity-60"
            >
              Save & resubmit
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setLineItems(pack.line_items);
              }}
              className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {pack.status === "pending" || pack.status === "draft" ? (
            <>
              <button
                type="button"
                disabled={isPending}
                onClick={() => resolve("approve")}
                className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <Check size={12} />
                Approve
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => resolve("reject")}
                className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
              >
                <X size={12} />
                Reject
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setEditing(true)}
                className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
              >
                Modify
              </button>
            </>
          ) : pack.status === "rejected" ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => setEditing(true)}
              className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
            >
              Revise estimate
            </button>
          ) : null}
        </div>
      )}
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export function EstimationPacksPanel({
  projectId,
  packs,
}: {
  projectId: string;
  packs: EstimationPackRow[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function generate() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/project/${projectId}/estimations/generate`, {
          method: "POST",
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Generation failed");
          return;
        }
        router.refresh();
      } catch {
        setError("Could not reach the server");
      }
    });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Role estimation packs</h3>
          <p className="mt-1 text-sm text-slate-500">
            PM, BA, engineering, and QA breakdowns — approve, modify, or reject before
            they feed forecasts.
          </p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={generate}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-violet-600 px-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          {packs.length === 0 ? "Generate estimates" : "Regenerate drafts"}
        </button>
      </div>

      {error ? (
        <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {packs.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          No estimation packs yet. Generate AI drafts from your charter and org memory.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {packs.map((pack) => (
            <li
              key={pack.id}
              className="rounded-lg border border-slate-100 bg-slate-50/50 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-slate-900">
                  {ESTIMATION_ROLE_LABELS[pack.role]}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${STATUS_STYLE[pack.status]}`}
                >
                  {pack.status}
                </span>
              </div>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {pack.total_days}d
                <span className="ml-2 text-xs font-normal text-slate-500">
                  {pack.confidence}% confidence
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-600">{pack.rationale}</p>
              <ul className="mt-2 space-y-1">
                {pack.line_items.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between text-xs text-slate-600"
                  >
                    <span>{item.title}</span>
                    <span>{item.days}d</span>
                  </li>
                ))}
              </ul>
              {pack.reviewer_notes ? (
                <p className="mt-2 text-xs text-slate-500">
                  Review: {pack.reviewer_notes}
                </p>
              ) : null}
              <PackActions projectId={projectId} pack={pack} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
