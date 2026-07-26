"use client";

import { useCallback, useEffect, useState } from "react";
import { scheduleEffectWork } from "@/lib/react/schedule-effect-work";
import { DELETE_CONFIRM_PHRASE } from "@/lib/pi-privacy/cascade-map";
import type { PrivacyRequestRecord } from "@/lib/pi-privacy/types";
import { dxClass } from "@/lib/dx-theme";

type ExportResponse = {
  ok?: boolean;
  request?: PrivacyRequestRecord;
  export?: {
    schemaVersion: number;
    exportedAt: string;
    tables: Record<string, unknown[]>;
  };
  error?: string;
};

export function PrivacyDataControls() {
  const [requests, setRequests] = useState<PrivacyRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pi/privacy/export");
      const data = (await res.json()) as { requests?: PrivacyRequestRecord[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not load privacy requests");
      setRequests(data.requests ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => scheduleEffectWork(() => { void load(); }), [load]);

  async function runExport() {
    setExporting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/pi/privacy/export", { method: "POST" });
      const data = (await res.json()) as ExportResponse;
      if (!res.ok) throw new Error(data.error || "Export failed");

      const blob = new Blob([JSON.stringify(data.export, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `deliverx-pi-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage("Export ready. JSON download started. Observation and evidence remain private by default.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  async function runDelete() {
    setDeleting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/pi/privacy/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPhrase, deleteAuthUser: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setMessage(
        "Person Professional Intelligence data deleted. A privacy request tombstone is retained. You will be signed out.",
      );
      setPassword("");
      setConfirmPhrase("");
      window.location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[#1A1A18]">Your data</h3>
        <p className="mt-1 text-sm text-[#4A4A45]">
          Export or delete your person Professional Intelligence data. Shared competency
          frameworks are not personal data and are not removed. Capability is never rewritten
          here — delete only removes your stored records.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={exporting || deleting}
          onClick={() => void runExport()}
          className={dxClass.btnPrimary}
        >
          {exporting ? "Exporting…" : "Export my PI data"}
        </button>
      </div>

      <div className="space-y-3 border-t border-[#E4E4DC] pt-4">
        <h3 className="text-sm font-semibold text-[#C0392B]">Delete my PI data</h3>
        <p className="text-xs text-[#6B6B64]">
          Requires password re-authentication. Type{" "}
          <code className="rounded bg-[#F4F4EF] px-1">{DELETE_CONFIRM_PHRASE}</code> to confirm.
          This purges person PI tables and deletes the auth account. A request tombstone is
          retained for audit.
        </p>
        <label className="block text-xs font-medium text-[#6B6B64]">
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full max-w-md border border-[#E4E4DC] bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-[#6B6B64]">
          Confirmation phrase
          <input
            type="text"
            value={confirmPhrase}
            onChange={(e) => setConfirmPhrase(e.target.value)}
            placeholder={DELETE_CONFIRM_PHRASE}
            className="mt-1 w-full max-w-md border border-[#E4E4DC] bg-white px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          disabled={deleting || exporting || !password || confirmPhrase !== DELETE_CONFIRM_PHRASE}
          onClick={() => void runDelete()}
          className={`${dxClass.btnGhost} text-[#C0392B] hover:border-[#C0392B]/30 hover:bg-[#FDF1F0]`}
        >
          {deleting ? "Deleting…" : "Delete my PI data and account"}
        </button>
      </div>

      {error ? <p className="text-sm text-[#C0392B]">{error}</p> : null}
      {message ? <p className="text-sm text-[#1C4A2E]">{message}</p> : null}

      <div className="border-t border-[#E4E4DC] pt-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">
          Recent privacy requests
        </h4>
        {loading ? (
          <p className="mt-2 text-sm text-[#6B6B64]">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="mt-2 text-sm text-[#6B6B64]">No privacy requests yet.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-[#4A4A45]">
            {requests.map((r) => (
              <li key={r.id}>
                {r.requestType} · {r.status} · {new Date(r.requestedAt).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
