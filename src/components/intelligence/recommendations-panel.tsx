"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, X, Sparkles, Loader2 } from "lucide-react";
import { postAi } from "@/lib/ai/client-fetch";
import type { Recommendation } from "@/services/intelligenceEngine";
import type { AiReviewAction } from "@/services/recommendations";
import { AiCitationStrip } from "@/components/dx/ai-citation-strip";

type ReviewState = "pending" | "accepted" | "ignored";

type EnrichResponse = {
  ok: true;
  rationales: Record<string, string>;
};

export function RecommendationsPanel({
  projectId,
  items,
  initialReviews = {},
}: {
  projectId: string;
  items: Recommendation[];
  initialReviews?: Record<string, AiReviewAction>;
}) {
  const [states, setStates] = useState<Record<string, ReviewState>>(() => {
    const base = Object.fromEntries(items.map((i) => [i.id, "pending" as ReviewState]));
    for (const [id, action] of Object.entries(initialReviews)) {
      base[id] = action === "accept" ? "accepted" : "ignored";
    }
    return base;
  });
  const [rationales, setRationales] = useState<Record<string, string>>({});
  const [enriching, setEnriching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [, startEnrichTransition] = useTransition();

  useEffect(() => {
    if (items.length === 0) return;

    let cancelled = false;
    startEnrichTransition(() => setEnriching(true));

    postAi<EnrichResponse>("/api/ai/recommendations/enrich", { projectId }).then(
      (res) => {
        if (cancelled) return;
        setEnriching(false);
        if (res.ok && Object.keys(res.data.rationales).length > 0) {
          setRationales(res.data.rationales);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [projectId, items.length]);

  function review(id: string, action: "accept" | "ignore") {
    const next: ReviewState = action === "accept" ? "accepted" : "ignored";
    setStates((s) => ({ ...s, [id]: next }));

    startTransition(async () => {
      try {
        const res = await fetch("/api/ai/recommendation/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, id, action }),
        });
        if (!res.ok) {
          setStates((s) => ({ ...s, [id]: "pending" }));
        }
      } catch {
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
        {enriching ? <Loader2 size={12} className="animate-spin text-slate-400" /> : null}
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
              <p className="mt-1 text-xs text-slate-500">
                {rationales[item.id] ?? item.rationale}
              </p>
              <AiCitationStrip
                citations={[]}
                emptyLabel="Uncited — rationale shown without evidence ids"
              />
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
