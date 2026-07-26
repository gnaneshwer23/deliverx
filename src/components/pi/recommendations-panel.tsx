"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { scheduleEffectWork } from "@/lib/react/schedule-effect-work";
import type { RecommendationRecord } from "@/lib/recommendations/types";
import { MAX_ACTIVE_RECOMMENDATIONS_SHOWN } from "@/lib/recommendations/generate";
import { AiCitationStrip } from "@/components/dx/ai-citation-strip";

type PanelState = {
  enabled: boolean;
  items: RecommendationRecord[];
};

const STATUS_LABEL: Record<string, string> = {
  generated: "New",
  viewed: "Seen",
  accepted: "Accepted",
};

/**
 * B2 next-action recommendations (FR-010): explainable, accept/dismiss with
 * retained history. Accepting never auto-creates anything — it records intent
 * and offers the deterministic destination link.
 */
export function RecommendationsPanel() {
  const pathname = usePathname();
  const analyticsSurface = pathname.startsWith("/career") ? "career" : "profile";
  const [state, setState] = useState<PanelState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const viewedMarked = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pi/recommendations");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load recommendations");
      setState({
        enabled: data.enabled === true,
        items: (data.recommendations ?? []) as RecommendationRecord[],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => scheduleEffectWork(() => { void load(); }), [load]);

  // Mark freshly generated recommendations as viewed once they render.
  useEffect(() => {
    if (!state?.enabled || viewedMarked.current) return;
    const generatedIds = state.items
      .filter((r) => r.status === "generated")
      .slice(0, MAX_ACTIVE_RECOMMENDATIONS_SHOWN)
      .map((r) => r.id);
    if (!generatedIds.length) return;
    viewedMarked.current = true;
    void fetch("/api/pi/recommendations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "viewed",
        recommendationIds: generatedIds,
        surface: analyticsSurface,
      }),
    }).then((res) => {
      if (res.ok) {
        setState((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.map((r) =>
                  generatedIds.includes(r.id) && r.status === "generated"
                    ? { ...r, status: "viewed" }
                    : r,
                ),
              }
            : prev,
        );
      }
    });
  }, [analyticsSurface, state]);

  async function act(id: string, action: "accepted" | "dismissed" | "completed") {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/pi/recommendations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId: id, action, surface: analyticsSurface }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      const updated = data.recommendation as RecommendationRecord;
      setState((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items
                .map((r) => (r.id === id ? { ...r, ...updated } : r))
                .filter((r) => r.status !== "dismissed" && r.status !== "completed"),
            }
          : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <p className="text-xs text-[#6B6B64]">Loading recommendations…</p>;
  }

  if (error) {
    return (
      <div className="text-xs text-red-700">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-1 font-medium underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!state?.enabled) return null;

  const items = state.items.slice(0, MAX_ACTIVE_RECOMMENDATIONS_SHOWN);

  if (!items.length) {
    return (
      <p className="text-xs text-[#6B6B64]">
        No open recommendations. Run a capability assessment and new next actions will
        appear here with their rationale.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-lg border border-[#E5E2D9] bg-[#FAFAF7] px-3 py-3 text-xs text-[#4A4A45]"
        >
          <p className="font-medium text-[#1A1A18]">{item.title}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#6B6B64]">
            {STATUS_LABEL[item.status] ?? item.status}
            {item.competencyId ? ` · ${item.competencyId}` : ""}
          </p>
          <p className="mt-1">Why: {item.rationale}</p>
          <AiCitationStrip
            citations={item.evidenceReferences}
            emptyLabel="No direct evidence cited — generated from your capability assessment"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href={item.href}
              className="rounded-md bg-[#1C4A2E] px-2.5 py-1.5 text-[11px] font-medium text-white"
            >
              Open
            </Link>
            {item.status === "generated" || item.status === "viewed" ? (
              <>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => void act(item.id, "accepted")}
                  className="rounded-md border border-[#D6D3C8] bg-white px-2.5 py-1.5 text-[11px] font-medium disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => void act(item.id, "dismissed")}
                  className="rounded-md border border-transparent px-2.5 py-1.5 text-[11px] text-[#6B6B64] disabled:opacity-50"
                >
                  Dismiss
                </button>
              </>
            ) : null}
            {item.status === "accepted" ? (
              <>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => void act(item.id, "completed")}
                  className="rounded-md border border-[#D6D3C8] bg-white px-2.5 py-1.5 text-[11px] font-medium disabled:opacity-50"
                >
                  Mark completed
                </button>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => void act(item.id, "dismissed")}
                  className="rounded-md border border-transparent px-2.5 py-1.5 text-[11px] text-[#6B6B64] disabled:opacity-50"
                >
                  Dismiss
                </button>
              </>
            ) : null}
          </div>
          <p className="mt-2 text-[10px] text-[#6B6B64]">
            Accepting records intent only — nothing is created or scored automatically.
          </p>
        </li>
      ))}
    </ul>
  );
}
