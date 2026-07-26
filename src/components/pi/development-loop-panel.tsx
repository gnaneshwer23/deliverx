"use client";

import { useCallback, useEffect, useState } from "react";
import { scheduleEffectWork } from "@/lib/react/schedule-effect-work";
import Link from "next/link";
import type { InterventionRecord } from "@/lib/workspace-observation/types";
import { AiCitationStrip } from "@/components/dx/ai-citation-strip";

export function DevelopmentLoopPanel() {
  const [items, setItems] = useState<InterventionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pi/interventions");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load interventions");
      setItems((data.interventions ?? []) as InterventionRecord[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => scheduleEffectWork(() => { void load(); }), [load]);

  async function act(id: string, action: "accepted" | "dismissed" | "completed") {
    setBusyId(id);
    try {
      const res = await fetch("/api/pi/interventions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interventionId: id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <p className="text-xs text-[#6B6B64]">Loading development loop…</p>;
  }

  if (error) {
    return <p className="text-xs text-red-700">{error}</p>;
  }

  if (!items.length) {
    return (
      <p className="text-xs text-[#6B6B64]">
        No active interventions. Enable Workspace observation, accumulate evidence, and run a
        capability assessment — Coach will recommend targeted next steps without auto-acting.
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
            {item.kind.replace(/_/g, " ")} · {item.status}
          </p>
          <p className="mt-1">{item.rationale}</p>
          {item.targetGap ? (
            <p className="mt-1 text-[11px] text-[#6B6B64]">Targets: {item.targetGap}</p>
          ) : null}
          <AiCitationStrip citations={item.triggeringEvidenceIds} />
          <div className="mt-2 flex flex-wrap gap-2">
            {item.href ? (
              <Link
                href={item.href}
                className="rounded-md bg-[#1C4A2E] px-2.5 py-1.5 text-[11px] font-medium text-white"
              >
                Open
              </Link>
            ) : null}
            {item.status === "offered" ? (
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
              <button
                type="button"
                disabled={busyId === item.id}
                onClick={() => void act(item.id, "completed")}
                className="rounded-md border border-[#D6D3C8] bg-white px-2.5 py-1.5 text-[11px] font-medium disabled:opacity-50"
              >
                Mark completed
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
