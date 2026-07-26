"use client";

import { useCallback, useEffect, useState } from "react";
import { scheduleEffectWork } from "@/lib/react/schedule-effect-work";
import type { ObservationConsentRecord } from "@/lib/workspace-observation/types";
import { WORKSPACE_OBSERVATION_CONSENT_COPY } from "@/lib/workspace-observation/types";

type ConsentResponse = {
  allowed: boolean;
  global: ObservationConsentRecord | null;
  copy?: typeof WORKSPACE_OBSERVATION_CONSENT_COPY;
};

export function ObservationConsentForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copy, setCopy] = useState(WORKSPACE_OBSERVATION_CONSENT_COPY);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pi/observation/consent");
      const data = (await res.json()) as ConsentResponse & { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not load consent");
      setAllowed(Boolean(data.allowed));
      if (data.copy) setCopy(data.copy);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => scheduleEffectWork(() => { void load(); }), [load]);

  async function setConsent(next: boolean) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/pi/observation/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consented: next, scope: "global" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update consent");
      setAllowed(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[#6B6B64]">Loading observation consent…</p>;
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-[#1A1A18]">{copy.title}</h3>
        <p className="mt-1 text-sm text-[#4A4A45]">{copy.summary}</p>
      </div>
      <ul className="list-disc space-y-1 pl-5 text-xs text-[#6B6B64]">
        {copy.details.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="text-xs text-[#6B6B64]">{copy.revokeNote}</p>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          disabled={saving || allowed}
          onClick={() => void setConsent(true)}
          className="rounded-md bg-[#1C4A2E] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
        >
          {allowed ? "Observation on" : "Enable Workspace observation"}
        </button>
        <button
          type="button"
          disabled={saving || !allowed}
          onClick={() => void setConsent(false)}
          className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18] disabled:opacity-50"
        >
          Turn off
        </button>
        <span className="text-xs text-[#6B6B64]">
          Status: {allowed ? "consented" : "off (default)"}
        </span>
      </div>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
