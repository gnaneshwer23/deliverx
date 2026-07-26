"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { scheduleEffectWork } from "@/lib/react/schedule-effect-work";
import Link from "next/link";
import {
  OUTCOME_EVENT_TYPES,
  OUTCOME_EVENT_DISPLAY,
  type CalibrationFindingRecord,
  type OutcomeEventRecord,
  type OutcomeEventType,
  type OutcomeSummary,
} from "@/lib/real-world-outcomes/types";
import { PI_EVIDENCE_PATH, PI_PROFILE_PATH } from "@/lib/pi-profile/paths";

type ScoreRunPrompt = {
  prompt: boolean;
  scoreRunTriggered: false;
  reason: string | null;
  href: string;
};

type OutcomesPayload = {
  events: OutcomeEventRecord[];
  findings: CalibrationFindingRecord[];
  summary: OutcomeSummary;
  narrative: string | null;
  notice: string;
};

const SEVERITY_STYLE: Record<string, string> = {
  action: "border-red-200 bg-red-50 text-red-800",
  watch: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-[#CDE5D4] bg-[#F0F7F2] text-[#1C4A2E]",
};

export function RealWorldOutcomesApp() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<ScoreRunPrompt | null>(null);
  const [data, setData] = useState<OutcomesPayload | null>(null);

  const [eventType, setEventType] = useState<OutcomeEventType>("application_submitted");
  const [title, setTitle] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [company, setCompany] = useState("");
  const [stageReached, setStageReached] = useState("");
  const [detail, setDetail] = useState("");
  const [artefactRef, setArtefactRef] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/career/outcomes");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load outcomes");
      setData(json as OutcomesPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => scheduleEffectWork(() => { void load(); }), [load]);

  async function onRecord(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    setPrompt(null);
    try {
      const res = await fetch("/api/career/outcomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_outcome",
          eventType,
          title,
          roleTitle,
          company,
          stageReached,
          detail,
          artefactRef,
          hasArtefact: Boolean(artefactRef.trim()),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save");
      setNotice(json.notice ?? "Logged as self-reported outcome evidence.");
      if (json.scoreRunPrompt?.prompt) setPrompt(json.scoreRunPrompt as ScoreRunPrompt);
      setTitle("");
      setRoleTitle("");
      setCompany("");
      setStageReached("");
      setDetail("");
      setArtefactRef("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function actOnFinding(findingId: string, action: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/career/outcomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, findingId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Action failed");
      if (json.reviewCaseId) {
        setNotice("Challenge opened — a review case was created. Diagnostics never change your capability.");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-[#6B6B64]">
        Loading real-world outcomes…
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6B6B64]">
        Real-world outcomes
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-dx-display)] text-3xl tracking-tight text-[#1A1A18]">
        Record what actually happened in the market
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4A4A45]">
        Log applications, interviews, feedback, offers, rejections, hires, promotions and
        external projects. Outcomes are <strong>self-reported</strong> evidence — they never
        change a capability level and are never marked externally verified. Calibration below
        is honest, diagnostic guidance, not a judgement of your capability.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link href={PI_PROFILE_PATH} className="rounded-md border border-[#D6D3C8] bg-white px-3 py-1.5 text-[#1A1A18]">
          Profile
        </Link>
        <Link href={PI_EVIDENCE_PATH} className="rounded-md border border-[#D6D3C8] bg-white px-3 py-1.5 text-[#1A1A18]">
          Evidence Ledger
        </Link>
        <Link href="/launchpad/app" className="rounded-md border border-[#D6D3C8] bg-white px-3 py-1.5 text-[#1A1A18]">
          Career
        </Link>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      ) : null}
      {notice ? (
        <p className="mt-4 rounded-md border border-[#CDE5D4] bg-[#F0F7F2] px-3 py-2 text-sm text-[#1C4A2E]">{notice}</p>
      ) : null}
      {prompt?.prompt ? (
        <div className="mt-4 rounded-md border border-[#D6D3C8] bg-[#FAFAF7] px-3 py-3 text-sm text-[#1A1A18]">
          <p>{prompt.reason}</p>
          <Link href={prompt.href} className="mt-2 inline-block rounded-md bg-[#1C4A2E] px-3 py-1.5 text-xs font-medium text-white">
            Update capability profile (optional)
          </Link>
        </div>
      ) : null}

      {summary ? (
        <section className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["Applications", summary.applications],
            ["Interviews", summary.interviews],
            ["Offers", summary.offers],
            ["Rejections", summary.rejections],
            ["Hires", summary.hires],
            ["Promotions", summary.promotions],
            ["External projects", summary.externalProjects],
            ["Document-supported", summary.documentSupported],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg border border-[#E5E2D9] bg-white px-3 py-2">
              <p className="text-lg font-semibold text-[#1A1A18]">{value as number}</p>
              <p className="text-[11px] text-[#6B6B64]">{label}</p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-sm font-medium text-[#1A1A18]">Calibration (diagnostic)</h2>
        <p className="mt-1 text-xs text-[#6B6B64]">
          Honest pattern detection with sample sizes. Diagnostic only — never a capability
          judgement. You can acknowledge, dismiss or challenge any finding.
        </p>
        {data?.findings?.length ? (
          <ul className="mt-4 space-y-3">
            {data.findings.map((f) => (
              <li key={f.id} className={`rounded-lg border px-4 py-3 ${SEVERITY_STYLE[f.severity] ?? SEVERITY_STYLE.info}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">{f.title}</p>
                  <span className="rounded-full border border-current/30 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                    {f.severity}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed">{f.detail}</p>
                {f.implicatedGaps.length ? (
                  <p className="mt-2 text-[11px] opacity-80">Implicated gaps: {f.implicatedGaps.join(" · ")}</p>
                ) : null}
                <p className="mt-2 text-[10px] opacity-70">
                  Sample: {Object.entries(f.metrics).map(([k, v]) => `${k}=${v}`).join(" · ")} · diagnostic · not capability
                </p>
                {f.status === "open" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" disabled={saving} onClick={() => void actOnFinding(f.id, "acknowledge_finding")}
                      className="rounded-md border border-current/40 bg-white/60 px-2.5 py-1 text-[11px] font-medium disabled:opacity-50">
                      Acknowledge
                    </button>
                    <button type="button" disabled={saving} onClick={() => void actOnFinding(f.id, "challenge_finding")}
                      className="rounded-md border border-current/40 bg-white/60 px-2.5 py-1 text-[11px] font-medium disabled:opacity-50">
                      Challenge
                    </button>
                    <button type="button" disabled={saving} onClick={() => void actOnFinding(f.id, "dismiss_finding")}
                      className="rounded-md border border-current/40 bg-white/60 px-2.5 py-1 text-[11px] font-medium disabled:opacity-50">
                      Dismiss
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] font-medium capitalize">{f.status}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[#6B6B64]">
            No calibration findings yet. Log a few outcomes to see honest patterns.
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-[#1A1A18]">Your outcome record</h2>
        <p className="mt-1 text-xs text-[#6B6B64]">Private to you (RLS self-only). Employer names never appear in shared artefacts.</p>
        {data?.events?.length ? (
          <ul className="mt-4 space-y-3">
            {data.events.map((ev) => (
              <li key={ev.id} className="rounded-lg border border-[#E5E2D9] bg-white px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-[#1A1A18]">
                    <span className="mr-2 text-[10px] uppercase tracking-wide text-[#6B6B64]">
                      {OUTCOME_EVENT_DISPLAY[ev.eventType].label}
                    </span>
                    {ev.title}
                  </p>
                  <span className="rounded-full border border-[#D6D3C8] px-2 py-0.5 text-[10px] text-[#4A4A45]">
                    {ev.evidenceStrength === "document_supported" ? "Document-supported" : "Self-reported"}
                  </span>
                </div>
                {ev.roleTitle || ev.stageReached ? (
                  <p className="mt-1 text-xs text-[#4A4A45]">
                    {[ev.roleTitle, ev.stageReached ? `stage: ${ev.stageReached}` : null].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
                {ev.detail ? <p className="mt-2 text-xs italic text-[#6B6B64]">“{ev.detail.slice(0, 200)}”</p> : null}
                <p className="mt-2 text-[10px] text-[#6B6B64]">
                  {ev.occurredOn} · outcome evidence{ev.evidenceId ? ` · ${ev.evidenceId.slice(0, 8)}…` : ""} · not capability
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[#6B6B64]">No outcomes logged yet.</p>
        )}
      </section>

      <section className="mt-10 border-t border-[#E5E2D9] pt-8">
        <h2 className="text-sm font-medium text-[#1A1A18]">Log an outcome</h2>
        <form onSubmit={onRecord} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-[#4A4A45]">
              Event
              <select value={eventType} onChange={(e) => setEventType(e.target.value as OutcomeEventType)}
                className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm">
                {OUTCOME_EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{OUTCOME_EVENT_DISPLAY[t].label}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-[#4A4A45]">
              Role title
              <input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Associate Product Manager"
                className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm" />
            </label>
          </div>
          <label className="block text-xs text-[#4A4A45]">
            Title / summary
            <input required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Short label for this outcome"
              className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-[#4A4A45]">
              Company (private)
              <input value={company} onChange={(e) => setCompany(e.target.value)}
                placeholder="Kept private — never shared"
                className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm" />
            </label>
            <label className="block text-xs text-[#4A4A45]">
              Stage reached (interviews)
              <input value={stageReached} onChange={(e) => setStageReached(e.target.value)}
                placeholder="phone_screen, onsite, final…"
                className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm" />
            </label>
          </div>
          <label className="block text-xs text-[#4A4A45]">
            Detail
            <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3}
              placeholder="What happened? Any feedback received?"
              className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-xs text-[#4A4A45]">
            Supporting artefact (optional) — makes this document-supported
            <input value={artefactRef} onChange={(e) => setArtefactRef(e.target.value)}
              placeholder="Link/reference to offer letter, feedback doc…"
              className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm" />
          </label>
          <button type="submit" disabled={saving || !title.trim()}
            className="rounded-md bg-[#1C4A2E] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {saving ? "Saving…" : "Log outcome (self-reported evidence)"}
          </button>
          <p className="text-[10px] text-[#6B6B64]">
            Appends ledger evidence with source_type real_world_outcome · self-reported (or
            document-supported with an artefact). No capability assessment is triggered; capability is unchanged.
          </p>
        </form>
      </section>

      <p className="mt-10 text-[10px] text-[#A8A89E]">
        Real-world outcome loop · self-reported · never externally verified (that is Phase 8)
      </p>
    </div>
  );
}
