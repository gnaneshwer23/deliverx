"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ATTESTATION_RELATIONSHIPS } from "@/lib/external-attestation/types";

type AttestorView = {
  claimLabel: string;
  claimSummary: string;
  entryTitle: string;
  targetRole: string | null;
  relationshipHint: string | null;
  alreadyDecided: boolean;
  purposeNotice: string;
  status: string;
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  former_manager: "Former manager",
  current_manager: "Current manager",
  colleague: "Colleague",
  client: "Client",
  mentor: "Mentor",
  other: "Other",
};

export function AttestationForm({ token }: { token: string }) {
  const [view, setView] = useState<AttestorView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [relationship, setRelationship] = useState("former_manager");
  const [organisation, setOrganisation] = useState("");
  const [statement, setStatement] = useState("");
  const [decision, setDecision] = useState<"confirm" | "dispute">("confirm");

  const load = useCallback(async () => {
    const res = await fetch(`/api/portfolio/attest/${encodeURIComponent(token)}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "This attestation link is unavailable.");
      return;
    }
    setView(data.view);
    if (data.view?.alreadyDecided) {
      setDone("This attestation request has already been decided.");
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolio/attest/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          attestorDisplayName: displayName,
          attestorRelationship: relationship,
          attestorOrganisation: organisation || null,
          statement,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not submit attestation");
        return;
      }
      setDone(data.notice || "Thank you. Your response was recorded.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !view) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-[#E4E4DC] bg-white p-8">
        <h1 className="text-xl font-semibold text-[#1A1A18]">Attestation unavailable</h1>
        <p className="mt-2 text-sm text-[#6B6B64]">{error}</p>
        <Link href="/" className="mt-6 inline-flex text-sm font-medium text-[#0F766E] underline">
          Go to DeliverX
        </Link>
      </div>
    );
  }

  if (!view) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-[#E4E4DC] bg-white p-8">
        <p className="text-sm text-[#6B6B64]">Loading attestation request…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[#E4E4DC] bg-white p-8 shadow-sm">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
        External attestation
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-[#1A1A18]">Confirm or dispute a claim</h1>
      <p className="mt-2 text-sm text-[#6B6B64]">
        Portfolio: <strong className="text-[#1A1A18]">{view.entryTitle}</strong>
        {view.targetRole ? ` · ${view.targetRole}` : null}
      </p>

      <div className="mt-4 rounded-lg border border-[#C5D9CE] bg-[#EEF5F1] px-3 py-2 text-xs text-[#1C4A2E]">
        {view.purposeNotice}
      </div>

      <section className="mt-6 space-y-2">
        <h2 className="text-sm font-medium text-[#1A1A18]">Claim</h2>
        <p className="text-sm font-semibold text-[#1A1A18]">{view.claimLabel}</p>
        <p className="text-sm text-[#4A4A45]">{view.claimSummary}</p>
        {view.relationshipHint ? (
          <p className="text-xs text-[#6B6B64]">Suggested relationship: {view.relationshipHint}</p>
        ) : null}
      </section>

      {done ? (
        <div className="mt-6 rounded-lg border border-[#E4E4DC] bg-[#FAFAF5] px-3 py-3 text-sm text-[#1A1A18]">
          {done}
        </div>
      ) : (
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label className="block text-sm">
            <span className="font-medium text-[#1A1A18]">Your display name</span>
            <input
              className="mt-1 w-full rounded-lg border border-[#E4E4DC] px-3 py-2 text-sm"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={80}
              autoComplete="name"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-[#1A1A18]">Relationship to the person</span>
            <select
              className="mt-1 w-full rounded-lg border border-[#E4E4DC] px-3 py-2 text-sm"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            >
              {ATTESTATION_RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>
                  {RELATIONSHIP_LABELS[r] ?? r}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="font-medium text-[#1A1A18]">Organisation (optional)</span>
            <input
              className="mt-1 w-full rounded-lg border border-[#E4E4DC] px-3 py-2 text-sm"
              value={organisation}
              onChange={(e) => setOrganisation(e.target.value)}
              maxLength={120}
            />
          </label>

          <fieldset className="space-y-2 text-sm">
            <legend className="font-medium text-[#1A1A18]">Decision</legend>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="decision"
                checked={decision === "confirm"}
                onChange={() => setDecision("confirm")}
              />
              Confirm this claim
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="decision"
                checked={decision === "dispute"}
                onChange={() => setDecision("dispute")}
              />
              Dispute this claim (opens a private review)
            </label>
          </fieldset>

          <label className="block text-sm">
            <span className="font-medium text-[#1A1A18]">Statement</span>
            <textarea
              className="mt-1 w-full rounded-lg border border-[#E4E4DC] px-3 py-2 text-sm"
              rows={4}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              required
              minLength={10}
              maxLength={2000}
              placeholder="Briefly explain what you can confirm or why you dispute the claim."
            />
          </label>

          {error ? <p className="text-sm text-[#9B2C2C]">{error}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Submit attestation"}
          </button>
        </form>
      )}
    </div>
  );
}
