"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  EVIDENCE_STRENGTH_DISPLAY,
  type EvidenceStrengthLabel,
} from "@/lib/verified-portfolio/types";

type EvidenceItem = {
  id: string;
  title: string;
  sourceType: string;
  status: string;
  confidentiality?: string;
};

type EntrySummary = {
  id: string;
  title: string;
  lifecycle: string;
  evidenceStrength: EvidenceStrengthLabel;
  deliverxVerified: boolean;
  targetRole: string | null;
  evidenceLinks: Array<{ title: string; strength: string }>;
};

export function VerifiedPortfolioApp() {
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [entries, setEntries] = useState<EntrySummary[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("Associate Product Manager");
  const [notice, setNotice] = useState("Select evidence to compile a portfolio entry.");
  const [busy, setBusy] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    entry: Record<string, unknown>;
    shares: Array<{ id: string; shareUrl: string; status: string; label: string | null }>;
    externalPreview: Record<string, unknown>;
    capabilityClaims?: Array<{
      competencyId: string;
      level: string;
      confidence: number;
      evidenceCitations: Array<{ evidenceId: string }>;
      reasoningSummary: string;
      deliverxVerified: boolean;
      snapshotId: string;
    }>;
  } | null>(null);
  const [capabilityClaims, setCapabilityClaims] = useState<
    Array<{
      competencyId: string;
      level: string;
      confidence: number;
      evidenceCitations: Array<{ evidenceId: string }>;
      reasoningSummary: string;
      deliverxVerified: boolean;
    }>
  >([]);
  const [narrative, setNarrative] = useState("");
  const [hiddenFields, setHiddenFields] = useState<string[]>([]);
  const [claimLabel, setClaimLabel] = useState("");
  const [attestConsent, setAttestConsent] = useState(false);
  const [attestRequests, setAttestRequests] = useState<
    Array<{ id: string; claimLabel: string; status: string; attestUrl: string }>
  >([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/portfolio/entries");
    const data = await res.json();
    if (!res.ok) {
      setNotice(data.error || "Could not load portfolio");
      return;
    }
    setEvidence(data.evidence ?? []);
    setEntries(data.entries ?? []);
    setCapabilityClaims(data.capabilityClaims ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createEntry() {
    if (!title.trim() || selected.length === 0) {
      setNotice("Title and at least one evidence item are required.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/portfolio/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          targetRole,
          evidenceIds: selected,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || "Create failed");
        return;
      }
      setNotice(data.notice || "Entry created.");
      setSelected([]);
      setTitle("");
      await load();
      if (data.entry?.id) {
        setActiveId(data.entry.id);
        await openEntry(data.entry.id);
      }
    } finally {
      setBusy(false);
    }
  }

  async function openEntry(id: string) {
    setActiveId(id);
    const res = await fetch(`/api/portfolio/entries/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setNotice(data.error || "Could not open entry");
      return;
    }
    setDetail(data);
    setNarrative(String(data.entry.narrative ?? ""));
    setHiddenFields((data.entry.hiddenFields as string[]) ?? []);
    setClaimLabel(String(data.entry.title ?? ""));
    setAttestConsent(false);

    const attestRes = await fetch(`/api/portfolio/entries/${id}/attestations`);
    const attestData = await attestRes.json();
    if (attestRes.ok) {
      setAttestRequests(
        (attestData.requests ?? []).map(
          (r: { id: string; claimLabel: string; status: string; attestUrl: string }) => ({
            id: r.id,
            claimLabel: r.claimLabel,
            status: r.status,
            attestUrl: r.attestUrl,
          }),
        ),
      );
    } else {
      setAttestRequests([]);
    }
  }

  async function requestAttestation() {
    if (!activeId) return;
    if (!attestConsent) {
      setNotice("Consent is required before requesting external attestation.");
      return;
    }
    if (!claimLabel.trim()) {
      setNotice("Claim label is required.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/portfolio/entries/${activeId}/attestations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request",
          claimLabel: claimLabel.trim(),
          consentToShare: true,
          relationshipHint: "former_manager",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || "Attestation request failed");
        return;
      }
      setNotice(`Attestation link created. Share it with your attestor: ${data.request.attestUrl}`);
      await openEntry(activeId);
    } finally {
      setBusy(false);
    }
  }

  async function saveNarrative() {
    if (!activeId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/portfolio/entries/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          narrative,
          hiddenFields,
          lifecycle: "ready",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || "Save failed");
        return;
      }
      setNotice("Narrative saved. Ready to share.");
      await openEntry(activeId);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function createShare() {
    if (!activeId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/portfolio/entries/${activeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "share", hiddenFields }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || "Share failed");
        return;
      }
      setNotice(`Share link created: ${data.share.shareUrl}`);
      await openEntry(activeId);
    } finally {
      setBusy(false);
    }
  }

  async function revoke(shareId: string) {
    if (!activeId) return;
    await fetch(`/api/portfolio/entries/${activeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revoke", shareId }),
    });
    setNotice("Access revoked.");
    await openEntry(activeId);
  }

  async function roleVersion() {
    if (!activeId) return;
    const roleLabel = window.prompt("Role label for this version", targetRole);
    if (!roleLabel) return;
    const res = await fetch(`/api/portfolio/entries/${activeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "role_version", roleLabel }),
    });
    const data = await res.json();
    if (!res.ok) {
      setNotice(data.error || "Version failed");
      return;
    }
    setNotice(`Role version created: ${data.version.roleLabel}`);
  }

  function toggleEvidence(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleHidden(field: string) {
    setHiddenFields((prev) =>
      prev.includes(field) ? prev.filter((x) => x !== field) : [...prev, field],
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-[#1A1A18]">
      <header className="mb-8 border-b border-[#E5E2D9] pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
          DeliverX · Verified Professional Portfolio
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">
          Evidence-linked portfolio
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#4A4A45]">
          Every claim links to Evidence Ledger items. Labels describe strength — DeliverX does not
          claim verification unless external attestation requirements are met.
        </p>
        <p className="mt-3 text-sm text-[#1C4A2E]">{notice}</p>
      </header>

      {capabilityClaims.length > 0 ? (
        <section className="mb-8 rounded-xl border border-[#C5D9CE] bg-[#EEF5F1] p-5">
          <h2 className="text-sm font-medium text-[#1C4A2E]">
            Capability claims (ScoreRun projection)
          </h2>
          <p className="mt-1 text-xs text-[#4A4A45]">
            Same snapshot as Profile and Career. Levels cite evidence — DeliverX has not verified
            these claims externally.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[#4A4A45]">
            {capabilityClaims.slice(0, 8).map((c) => (
              <li key={`${c.competencyId}-${c.level}`}>
                <span className="font-medium text-[#1A1A18]">
                  {c.competencyId} · {c.level.replace(/_/g, " ")}
                </span>
                {c.evidenceCitations.length ? (
                  <span className="block text-[10px] text-[#6B6B64]">
                    Evidence:{" "}
                    {c.evidenceCitations
                      .slice(0, 3)
                      .map((e) => e.evidenceId)
                      .join(", ")}
                  </span>
                ) : null}
                {c.deliverxVerified ? null : (
                  <span className="block text-[10px] text-[#6B6B64]">Not DeliverX-verified</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E5E2D9] bg-white p-5">
          <h2 className="text-lg font-medium">1. Select evidence</h2>
          {evidence.length === 0 ? (
            <p className="mt-3 text-sm text-[#6B6B64]">
              No evidence yet. Complete Experience or Workspace work first, or import via the
              Evidence Ledger.
            </p>
          ) : (
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
              {evidence.map((ev) => (
                <li key={ev.id}>
                  <label className="flex cursor-pointer gap-2 rounded border border-transparent px-2 py-1.5 hover:border-[#E5E2D9]">
                    <input
                      type="checkbox"
                      checked={selected.includes(ev.id)}
                      onChange={() => toggleEvidence(ev.id)}
                    />
                    <span>
                      <strong>{ev.title}</strong>
                      <span className="block text-xs text-[#6B6B64]">
                        {ev.sourceType} · {ev.status} · {ev.confidentiality ?? "private"}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-[#E5E2D9] bg-white p-5">
          <h2 className="text-lg font-medium">2. Create entry</h2>
          <label className="mt-3 block text-xs text-[#6B6B64]">
            Title
            <input
              className="mt-1 w-full rounded border border-[#E5E2D9] px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="TrustCare pilot — stakeholder trade-off"
            />
          </label>
          <label className="mt-3 block text-xs text-[#6B6B64]">
            Target role version
            <input
              className="mt-1 w-full rounded border border-[#E5E2D9] px-3 py-2 text-sm"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void createEntry()}
            className="mt-4 rounded-md bg-[#1C4A2E] px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            Compile from evidence
          </button>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-medium">Your entries</h2>
        {entries.length === 0 ? (
          <p className="mt-2 text-sm text-[#6B6B64]">No portfolio entries yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {entries.map((en) => (
              <li key={en.id}>
                <button
                  type="button"
                  onClick={() => void openEntry(en.id)}
                  className="w-full rounded-lg border border-[#E5E2D9] bg-white px-4 py-3 text-left hover:border-[#1C4A2E]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-sm">{en.title}</strong>
                    <StrengthPill strength={en.evidenceStrength} />
                  </div>
                  <p className="mt-1 text-xs text-[#6B6B64]">
                    {en.lifecycle}
                    {en.targetRole ? ` · ${en.targetRole}` : ""} ·{" "}
                    {en.deliverxVerified
                      ? "Externally attested"
                      : "Not DeliverX-verified"}{" "}
                    · {en.evidenceLinks.length} evidence links
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {detail && activeId ? (
        <section className="space-y-6 rounded-xl border border-[#E5E2D9] bg-white p-5">
          <h2 className="text-lg font-medium">3–7. Review, edit, privacy, share, preview</h2>

          <div>
            <p className="text-xs uppercase tracking-wide text-[#6B6B64]">AI summary (review)</p>
            <p className="mt-1 text-sm text-[#4A4A45]">{String(detail.entry.aiSummary ?? "")}</p>
            <p className="mt-1 text-xs text-[#B7620A]">
              Packaging only — not verification.
            </p>
          </div>

          <label className="block text-xs text-[#6B6B64]">
            Narrative (edit)
            <textarea
              className="mt-1 w-full rounded border border-[#E5E2D9] px-3 py-2 text-sm"
              rows={8}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
            />
          </label>

          <div>
            <p className="text-xs uppercase tracking-wide text-[#6B6B64]">
              Hide confidential fields in external view
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["challenge", "outcomes", "reflection", "contribution_breakdown", "metrics"].map(
                (f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleHidden(f)}
                    className={
                      hiddenFields.includes(f)
                        ? "rounded-full bg-[#1C4A2E] px-3 py-1 text-xs text-white"
                        : "rounded-full border border-[#E5E2D9] px-3 py-1 text-xs"
                    }
                  >
                    {f}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void saveNarrative()}
              className="rounded-md bg-[#1C4A2E] px-3 py-2 text-xs text-white"
            >
              Save narrative
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void createShare()}
              className="rounded-md border border-[#1C4A2E] px-3 py-2 text-xs text-[#1C4A2E]"
            >
              Generate shareable view
            </button>
            <button
              type="button"
              onClick={() => void roleVersion()}
              className="rounded-md border border-[#E5E2D9] px-3 py-2 text-xs"
            >
              Role-specific version
            </button>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-[#6B6B64]">Share links</p>
            <ul className="mt-2 space-y-2 text-sm">
              {(detail.shares ?? []).map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-2">
                  <Link href={s.shareUrl} className="text-[#1C4A2E] underline" target="_blank">
                    {s.label || "Share"} ({s.status})
                  </Link>
                  {s.status === "active" ? (
                    <button
                      type="button"
                      className="text-xs text-red-700 underline"
                      onClick={() => void revoke(s.id)}
                    >
                      Revoke
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-[#C5D9CE] bg-[#EEF5F1] p-4">
            <p className="text-xs uppercase tracking-wide text-[#1C4A2E]">
              External attestation (T8)
            </p>
            <p className="mt-1 text-xs text-[#4A4A45]">
              Request a third-party confirmation of one claim. The Verified badge lights only after
              confirmation is recorded on the Evidence Ledger — never from ScoreRuns or self-report.
            </p>
            <label className="mt-3 block text-xs text-[#6B6B64]">
              Claim to attest
              <input
                className="mt-1 w-full rounded border border-[#E5E2D9] bg-white px-3 py-2 text-sm"
                value={claimLabel}
                onChange={(e) => setClaimLabel(e.target.value)}
              />
            </label>
            <label className="mt-2 flex items-start gap-2 text-xs text-[#4A4A45]">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={attestConsent}
                onChange={(e) => setAttestConsent(e.target.checked)}
              />
              I consent to share this claim summary with an external attestor for verification.
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void requestAttestation()}
              className="mt-3 rounded-md bg-[#0F766E] px-3 py-2 text-xs text-white disabled:opacity-60"
            >
              Create attestation link
            </button>
            {attestRequests.length > 0 ? (
              <ul className="mt-3 space-y-2 text-xs text-[#4A4A45]">
                {attestRequests.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-2">
                    <span>
                      {r.claimLabel} · {r.status}
                    </span>
                    {r.status === "pending" ? (
                      <Link
                        href={r.attestUrl}
                        className="text-[#0F766E] underline"
                        target="_blank"
                      >
                        Open attestor link
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="rounded-lg border border-dashed border-[#D6D3C8] bg-[#FAFAF7] p-4">
            <p className="text-xs uppercase tracking-wide text-[#6B6B64]">
              External viewer preview
            </p>
            <p className="mt-2 text-sm font-medium">
              {String(detail.externalPreview.title ?? "")}
            </p>
            <p className="mt-1 text-xs text-[#6B6B64]">
              {String(detail.externalPreview.verificationNotice ?? "")}
            </p>
            {Array.isArray(detail.externalPreview.capabilityClaims) &&
            (detail.externalPreview.capabilityClaims as unknown[]).length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-[#4A4A45]">
                {(
                  detail.externalPreview.capabilityClaims as Array<{
                    competencyId: string;
                    level: string;
                    deliverxVerified?: boolean;
                  }>
                )
                  .slice(0, 4)
                  .map((c) => (
                    <li key={c.competencyId}>
                      {c.competencyId}: {c.level.replace(/_/g, " ")}
                      {c.deliverxVerified ? "" : " · not verified"}
                    </li>
                  ))}
              </ul>
            ) : null}
            <p className="mt-2 whitespace-pre-wrap text-sm text-[#4A4A45]">
              {String(detail.externalPreview.narrative ?? "").slice(0, 600)}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-[#6B6B64]">Linked evidence</p>
            <ul className="mt-2 space-y-1 text-sm">
              {(detail.entry.evidenceLinks as Array<{ title: string; strength: string }> | undefined)?.map(
                (l) => (
                  <li key={l.title + l.strength} className="flex items-center gap-2">
                    <span>{l.title}</span>
                    <StrengthPill strength={l.strength as EvidenceStrengthLabel} />
                  </li>
                ),
              )}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-sm font-medium">Evidence strength labels</h2>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {(Object.keys(EVIDENCE_STRENGTH_DISPLAY) as EvidenceStrengthLabel[]).map((key) => (
            <li key={key} className="rounded border border-[#E5E2D9] px-3 py-2 text-xs">
              <strong>{EVIDENCE_STRENGTH_DISPLAY[key].label}</strong>
              <p className="mt-1 text-[#6B6B64]">{EVIDENCE_STRENGTH_DISPLAY[key].description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StrengthPill({ strength }: { strength: EvidenceStrengthLabel }) {
  const meta = EVIDENCE_STRENGTH_DISPLAY[strength] ?? EVIDENCE_STRENGTH_DISPLAY.self_reported;
  return (
    <span className="rounded-full bg-[#EEF5F1] px-2 py-0.5 font-mono text-[10px] text-[#1C4A2E]">
      {meta.label}
    </span>
  );
}
