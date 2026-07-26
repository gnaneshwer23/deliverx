"use client";

import { useCallback, useEffect, useState } from "react";
import { scheduleEffectWork } from "@/lib/react/schedule-effect-work";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  EVIDENCE_STRENGTH_DISPLAY,
  type EvidenceStrengthLabel,
} from "@/lib/verified-portfolio/types";

type EvidenceRow = {
  id: string;
  title: string;
  summary: string | null;
  source_type: string;
  category: string;
  status: string;
  actorType: string;
  strength: EvidenceStrengthLabel;
  captured_at: string | null;
  created_at: string;
};

type SnapshotView = {
  snapshotId?: string | null;
  scoreRunId?: string | null;
  capturedAt?: string | null;
  readiness?: number | null;
  dimensions?: Record<string, number> | null;
  strengths?: string[];
  gaps?: string[];
  recommendations?: Array<{ id?: string; title: string; rationale?: string }>;
  explanations?: Array<{ competencyId: string; text: string }>;
  judgements?: Array<{
    competencyId: string;
    indicatorId: string;
    levelProposed: number;
    evidenceReferences: string[];
    reasoningSummary: string;
    confidence: number;
  }>;
};

export function EvidenceCapabilityApp() {
  const searchParams = useSearchParams();
  const autoRun = searchParams.get("run") === "1";

  const [evidence, setEvidence] = useState<EvidenceRow[]>([]);
  const [snapshot, setSnapshot] = useState<SnapshotView | null>(null);
  const [notice, setNotice] = useState("Loading Evidence Ledger…");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [didAutoRun, setDidAutoRun] = useState(false);

  const loadEvidence = useCallback(async () => {
    const res = await fetch("/api/pi/evidence");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load evidence");
    setEvidence(data.evidence ?? []);
  }, []);

  const loadSnapshot = useCallback(async () => {
    const res = await fetch("/api/pi/capability/run");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load snapshot");
    if (!data.snapshotId && data.snapshot === null) {
      setSnapshot(null);
      return;
    }
    setSnapshot({
      snapshotId: data.snapshotId,
      scoreRunId: data.scoreRunId,
      capturedAt: data.capturedAt,
      readiness: data.readiness,
      dimensions: data.dimensions,
      strengths: data.strengths ?? [],
      gaps: data.gaps ?? [],
      recommendations: data.recommendations ?? [],
      explanations: data.explanations ?? [],
    });
  }, []);

  const refresh = useCallback(async () => {
    try {
      await Promise.all([loadEvidence(), loadSnapshot()]);
      setError(null);
      setNotice("Evidence Ledger ready. Capability assessment projects capability from this evidence.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    }
  }, [loadEvidence, loadSnapshot]);

  useEffect(() => scheduleEffectWork(() => { void refresh(); }), [refresh]);

  const runScore = useCallback(async () => {
    setBusy(true);
    setNotice("Running capability assessment against your Evidence Ledger…");
    try {
      const res = await fetch("/api/pi/capability/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persist: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Assessment failed");
      if (!data.ok) {
        setNotice(data.error || "Assessment could not complete — add more practice evidence.");
        await loadSnapshot();
        return;
      }
      setSnapshot({
        snapshotId: data.persisted?.snapshotId,
        scoreRunId: data.persisted?.scoreRunId,
        capturedAt: new Date().toISOString(),
        readiness: data.readiness,
        dimensions: data.dimensions,
        strengths: data.strengths ?? [],
        gaps: data.gaps ?? [],
        recommendations: data.recommendations ?? [],
        explanations: data.explanations ?? [],
        judgements: data.judgements ?? [],
      });
      setNotice(
        data.duplicate
          ? "Same inputs — reused prior assessment (deterministic)."
          : "Assessment complete. Readiness, strengths and gaps are projected from evidence.",
      );
      await loadEvidence();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assessment failed");
    } finally {
      setBusy(false);
    }
  }, [loadEvidence, loadSnapshot]);

  useEffect(() => {
    if (!autoRun || didAutoRun || busy) return;
    if (evidence.length === 0 && !error) return;
    return scheduleEffectWork(() => {
      setDidAutoRun(true);
      void runScore();
    });
  }, [autoRun, didAutoRun, busy, evidence.length, error, runScore]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8 border-b border-[#E5E2D9] pb-5">
        <p className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
          Professional Intelligence
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[#1A1A18]">
          Evidence &amp; capability
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#4A4A45]">
          Review durable evidence from Experience and practice. Run a capability assessment to
          project readiness — the engine judges; this screen never invents capability.
        </p>
        <p className="mt-3 text-sm text-[#1C4A2E]">{notice}</p>
        {error ? <p className="mt-1 text-sm text-red-700">{error}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || evidence.length === 0}
            onClick={() => void runScore()}
            className="rounded-md bg-[#1C4A2E] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
          >
            {busy ? "Running assessment…" : "Run assessment"}
          </button>
          <Link
            href="/profile"
            className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
          >
            Profile centre
          </Link>
          <Link
            href="/portfolio"
            className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
          >
            Open Portfolio
          </Link>
          <Link
            href="/launchpad/app"
            className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
          >
            Career readiness
          </Link>
          <Link
            href="/experience/app"
            className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
          >
            Continue Experience
          </Link>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-[#1A1A18]">Evidence Ledger</h2>
          <p className="mt-1 text-xs text-[#6B6B64]">
            {evidence.length} item{evidence.length === 1 ? "" : "s"} · source, actor, strength
          </p>
          {evidence.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-[#D6D3C8] px-4 py-6 text-sm text-[#6B6B64]">
              No evidence yet. Complete an Experience Day 1 decision and reflection — observations
              land here automatically.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {evidence.map((row) => {
                const strengthMeta =
                  EVIDENCE_STRENGTH_DISPLAY[row.strength] ??
                  EVIDENCE_STRENGTH_DISPLAY.self_reported;
                return (
                  <li
                    key={row.id}
                    className="rounded-lg border border-[#E5E2D9] bg-white px-4 py-3"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-sm font-medium text-[#1A1A18]">{row.title}</h3>
                      <span className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-wide text-[#1C4A2E]">
                        {strengthMeta.label}
                      </span>
                    </div>
                    {row.summary ? (
                      <p className="mt-1 text-xs text-[#4A4A45]">{row.summary}</p>
                    ) : null}
                    <p className="mt-2 text-[11px] text-[#6B6B64]">
                      {row.source_type} · {row.category} · actor {row.actorType} · status{" "}
                      {row.status} ·{" "}
                      {new Date(row.captured_at || row.created_at).toLocaleString()}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1A1A18]">Latest assessment</h2>
          <p className="mt-1 text-xs text-[#6B6B64]">
            Capability projection from the Evidence Ledger. Not assigned by Experience or Career UI.
          </p>
          {!snapshot || snapshot.readiness == null ? (
            <div className="mt-4 rounded-lg border border-dashed border-[#D6D3C8] px-4 py-6 text-sm text-[#6B6B64]">
              No snapshot yet. After you have evidence, run an assessment to see readiness, strengths
              and gaps.
            </div>
          ) : (
            <div className="mt-4 space-y-4 rounded-lg border border-[#E5E2D9] bg-white px-4 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-[#4A4A45]">Readiness</p>
                <strong className="font-[family-name:var(--font-dx-mono)] text-2xl text-[#1C4A2E]">
                  {Math.round(Number(snapshot.readiness))}
                </strong>
              </div>
              {snapshot.capturedAt ? (
                <p className="text-[11px] text-[#6B6B64]">
                  Captured {new Date(snapshot.capturedAt).toLocaleString()}
                  {snapshot.scoreRunId ? ` · run ${snapshot.scoreRunId.slice(0, 8)}` : ""}
                </p>
              ) : null}

              {snapshot.strengths && snapshot.strengths.length > 0 ? (
                <div>
                  <p className="text-xs font-medium text-[#1A1A18]">Strengths</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-[#4A4A45]">
                    {snapshot.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {snapshot.gaps && snapshot.gaps.length > 0 ? (
                <div>
                  <p className="text-xs font-medium text-[#1A1A18]">Gaps</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-[#4A4A45]">
                    {snapshot.gaps.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {snapshot.explanations && snapshot.explanations.length > 0 ? (
                <div>
                  <p className="text-xs font-medium text-[#1A1A18]">Explanations</p>
                  <ul className="mt-1 space-y-2 text-xs text-[#4A4A45]">
                    {snapshot.explanations.slice(0, 6).map((e) => (
                      <li key={e.competencyId}>
                        <span className="font-medium text-[#1A1A18]">{e.competencyId}</span>
                        {" — "}
                        {e.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {snapshot.judgements && snapshot.judgements.length > 0 ? (
                <div>
                  <p className="text-xs font-medium text-[#1A1A18]">Levels (evidence-cited)</p>
                  <ul className="mt-1 space-y-2 text-xs text-[#4A4A45]">
                    {snapshot.judgements.slice(0, 8).map((j) => (
                      <li key={`${j.competencyId}-${j.indicatorId}`}>
                        <span className="font-medium text-[#1A1A18]">
                          {j.competencyId} · L{j.levelProposed}
                        </span>
                        {" — "}
                        {j.reasoningSummary}
                        {j.evidenceReferences?.length ? (
                          <span className="block text-[10px] text-[#6B6B64]">
                            Evidence: {j.evidenceReferences.slice(0, 3).join(", ")}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {snapshot.recommendations && snapshot.recommendations.length > 0 ? (
                <div>
                  <p className="text-xs font-medium text-[#1A1A18]">Recommendations</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-[#4A4A45]">
                    {snapshot.recommendations.map((r) => (
                      <li key={r.id ?? r.title}>
                        {r.title}
                        {r.rationale ? ` — ${r.rationale}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
