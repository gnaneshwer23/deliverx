"use client";

import { useState, useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";
import type { DigitalTwinState } from "@/services/twinEngine";

type SnapshotPoint = {
  id: string;
  captured_at: string;
  state: DigitalTwinState;
};

function spark(values: number[], width = 120, height = 32): string {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / Math.max(values.length - 1, 1);
  return values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function TwinSnapshotPanel({
  initialSnapshots,
}: {
  initialSnapshots: SnapshotPoint[];
}) {
  const [snapshots, setSnapshots] = useState(initialSnapshots);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const healthSeries = [...snapshots]
    .reverse()
    .map((s) => s.state.portfolio.health);

  function capture() {
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/twin/snapshot", { method: "POST" });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok || !data.ok) {
          setMessage(data.error ?? "Capture failed");
          return;
        }
        const listRes = await fetch("/api/twin/snapshot?limit=20");
        const listData = (await listRes.json()) as { snapshots?: SnapshotPoint[] };
        setSnapshots(listData.snapshots ?? []);
        setMessage("Snapshot captured");
      } catch {
        setMessage("Capture failed");
      }
    });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-800">Snapshot history</h3>
          <p className="mt-1 text-xs text-slate-500">
            Portfolio health trend from stored twin captures. Cron runs every 15
            minutes on Vercel.
          </p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={capture}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-3 text-xs font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Camera size={12} />
          )}
          Capture now
        </button>
      </div>

      {healthSeries.length >= 2 ? (
        <div className="flex items-end gap-4">
          <svg width={120} height={32} className="text-emerald-600">
            <path
              d={spark(healthSeries)}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            />
          </svg>
          <div className="text-xs text-slate-500">
            <span className="font-medium text-slate-700">
              {healthSeries[healthSeries.length - 1]}
            </span>{" "}
            / 100 latest
            <span className="mx-2">·</span>
            {snapshots.length} snapshots
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No history yet — capture a snapshot or wait for the daily cron (06:00 UTC).
        </p>
      )}

      {snapshots.length > 0 ? (
        <ul className="mt-4 max-h-40 space-y-1 overflow-y-auto text-xs text-slate-600">
          {snapshots.slice(0, 8).map((s) => (
            <li key={s.id} className="flex justify-between border-t border-slate-100 py-1.5">
              <span>{new Date(s.captured_at).toLocaleString()}</span>
              <span className="font-medium">
                Health {s.state.portfolio.health}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {message ? (
        <p className="mt-3 text-xs text-indigo-600">{message}</p>
      ) : null}
    </section>
  );
}
