"use client";

import { useCallback, useEffect, useState } from "react";
import { ARTEFACT_KINDS, type ArtefactKind, type ArtefactRecord } from "@/lib/artefacts/types";
import { dxClass } from "@/lib/dx-theme";

export function ArtefactVersionsPanel() {
  const [artefacts, setArtefacts] = useState<ArtefactRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ArtefactKind>("work_sample");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pi/artefacts");
      const data = (await res.json()) as { artefacts?: ArtefactRecord[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not load artefacts");
      setArtefacts(data.artefacts ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Matches shipped PI settings panels (privacy / consent) load-on-mount pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function createArtefact() {
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/pi/artefacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, kind, content: { note: "Created from settings" } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      setMessage(`Artefact "${title.trim()}" created with version 1.`);
      setTitle("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function addVersion(artefactId: string) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/pi/artefacts/${artefactId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { note: "Revision", at: new Date().toISOString() },
          changeNote: "Manual revision",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Add version failed");
      setMessage(
        data.duplicate
          ? "No change detected — identical content is not re-versioned."
          : `New immutable version v${data.version?.versionNumber} recorded.`,
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Add version failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[#1A1A18]">Artefacts &amp; versions</h3>
        <p className="mt-1 text-sm text-[#4A4A45]">
          Artefacts are private by default. Each revision is an immutable version — prior
          versions are never rewritten, and evidence always cites a specific version.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-xs font-medium text-[#6B6B64]">
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 discovery brief"
            className="mt-1 w-64 border border-[#E4E4DC] bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-[#6B6B64]">
          Kind
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ArtefactKind)}
            className="mt-1 border border-[#E4E4DC] bg-white px-3 py-2 text-sm"
          >
            {ARTEFACT_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={busy || !title.trim()}
          onClick={() => void createArtefact()}
          className={dxClass.btnPrimary}
        >
          {busy ? "Working…" : "Create artefact"}
        </button>
      </div>

      {error ? <p className="text-sm text-[#C0392B]">{error}</p> : null}
      {message ? <p className="text-sm text-[#1C4A2E]">{message}</p> : null}

      <div className="border-t border-[#E4E4DC] pt-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">
          Your artefacts
        </h4>
        {loading ? (
          <p className="mt-2 text-sm text-[#6B6B64]">Loading…</p>
        ) : artefacts.length === 0 ? (
          <p className="mt-2 text-sm text-[#6B6B64]">No artefacts yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm text-[#4A4A45]">
            {artefacts.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 border border-[#E4E4DC] bg-white px-3 py-2"
              >
                <span>
                  <span className="font-medium text-[#1A1A18]">{a.title}</span>{" "}
                  <span className="text-[#6B6B64]">
                    · {a.kind} · {a.status} · v{a.currentVersionNumber}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void addVersion(a.id)}
                  className={dxClass.btnGhost}
                >
                  Add version
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
