"use client";

import { useCallback, useEffect, useState } from "react";
import { scheduleEffectWork } from "@/lib/react/schedule-effect-work";
import Link from "next/link";
import {
  PI_REVIEW_ACTION_LABELS,
  PI_REVIEW_STATUS_LABELS,
  PI_REVIEW_SUBJECT_LABELS,
  USER_ACTIONS,
  type PiReviewAction,
  type PiReviewStatus,
  type PiReviewSubjectKind,
} from "@/lib/pi-review/types";
import { availableActions } from "@/lib/pi-review/status-machine";

type CaseRow = {
  id: string;
  subject_kind: PiReviewSubjectKind;
  subject_label: string;
  subject_ref_type: string;
  subject_ref_id: string;
  subject_snapshot: Record<string, unknown>;
  current_status: PiReviewStatus;
  priority: string;
  sla_due_at: string | null;
  created_at: string;
};

type EventRow = {
  id: string;
  action: PiReviewAction;
  from_status: PiReviewStatus;
  to_status: PiReviewStatus;
  rationale: string;
  context_note: string;
  evidence_ids: string[];
  created_at: string;
  actor_role: string;
};

const CHALLENGE_ACTIONS: PiReviewAction[] = [
  "challenge_judgement",
  "request_reassessment",
  "add_context",
  "correct_factual",
  "add_evidence",
  "report_inappropriate",
  "hide_evidence",
  "change_visibility",
];

export function PiReviewQueueApp() {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [notice, setNotice] = useState("Load your review queue to accept or challenge findings.");
  const [busy, setBusy] = useState(false);
  const [action, setAction] = useState<PiReviewAction>("challenge_judgement");
  const [rationale, setRationale] = useState("");
  const [contextNote, setContextNote] = useState("");
  const [evidenceIdsRaw, setEvidenceIdsRaw] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/pi/review?open=1");
    const json = await res.json();
    if (!res.ok) {
      setNotice(json.error || "Could not load review queue");
      return;
    }
    setCases(json.data ?? []);
    if (!(json.data ?? []).length) {
      setNotice(
        "No open review cases. Findings appear here when a judgement or claim is queued for your review.",
      );
    } else {
      setNotice(`${json.data.length} open case(s).`);
    }
  }, []);

  useEffect(() => scheduleEffectWork(() => { void load(); }), [load]);

  async function openCase(id: string) {
    setActiveId(id);
    setBusy(true);
    try {
      const res = await fetch(`/api/pi/review/${id}`);
      const json = await res.json();
      if (!res.ok) {
        setNotice(json.error || "Could not load case");
        return;
      }
      setEvents(json.data?.events ?? []);
      const status = json.data?.case?.current_status as PiReviewStatus | undefined;
      if (status) {
        const acts = availableActions(status, "subject_user").filter((a) =>
          CHALLENGE_ACTIONS.includes(a) || a === "accept",
        );
        if (acts.length) setAction(acts[0]!);
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitAction() {
    if (!activeId) return;
    setBusy(true);
    try {
      const evidenceIds = evidenceIdsRaw
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch(`/api/pi/review/${activeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          rationale,
          contextNote,
          evidenceIds,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setNotice(json.error || "Action failed");
        return;
      }
      setNotice(
        `Recorded ${PI_REVIEW_ACTION_LABELS[action]} → ${PI_REVIEW_STATUS_LABELS[json.data.toStatus as PiReviewStatus]}. History preserved.`,
      );
      setRationale("");
      setContextNote("");
      setEvidenceIdsRaw("");
      await load();
      await openCase(activeId);
    } finally {
      setBusy(false);
    }
  }

  const active = cases.find((c) => c.id === activeId) ?? null;
  const userActs = active
    ? availableActions(active.current_status, "subject_user")
    : [...USER_ACTIONS];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="space-y-2 border-b border-[#E5E2D9] pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B64]">
          Professional Intelligence
        </p>
        <h1 className="font-[family-name:var(--font-dx-display)] text-2xl text-[#1A1A18]">
          Review & challenge
        </h1>
        <p className="max-w-2xl text-sm text-[#4A4A45]">
          Accept findings, add context, or challenge judgements. Challenges create a new review
          record — history is never overwritten. Verified capability levels cannot change without
          evidence.
        </p>
        <div className="flex flex-wrap gap-3 pt-1 text-sm">
          <Link href="/portfolio" className="text-[#1C4A2E] underline">
            Portfolio
          </Link>
          <Link href="/profile/evidence" className="text-[#1C4A2E] underline">
            Evidence
          </Link>
          <Link href="/pi/review/admin" className="text-[#1C4A2E] underline">
            Admin review
          </Link>
        </div>
      </header>

      <p className="text-sm text-[#4A4A45]" role="status">
        {notice}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-md border border-[#D6D3C8] bg-white px-3 py-1.5 text-xs font-medium text-[#1A1A18]"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[#1A1A18]">Queue</h2>
          <ul className="divide-y divide-[#E5E2D9] border border-[#E5E2D9] bg-white">
            {cases.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => void openCase(c.id)}
                  className={`w-full px-3 py-3 text-left text-sm hover:bg-[#F7F6F2] ${
                    activeId === c.id ? "bg-[#EEF5F1]" : ""
                  }`}
                >
                  <span className="block font-medium text-[#1A1A18]">{c.subject_label}</span>
                  <span className="mt-1 block text-xs text-[#6B6B64]">
                    {PI_REVIEW_SUBJECT_LABELS[c.subject_kind]} ·{" "}
                    {PI_REVIEW_STATUS_LABELS[c.current_status]} · {c.priority}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          {active ? (
            <>
              <div className="border border-[#E5E2D9] bg-white px-4 py-3">
                <h2 className="text-sm font-semibold text-[#1A1A18]">{active.subject_label}</h2>
                <p className="mt-1 text-xs text-[#6B6B64]">
                  Status: {PI_REVIEW_STATUS_LABELS[active.current_status]} · Ref:{" "}
                  {active.subject_ref_type}/{active.subject_ref_id.slice(0, 8)}…
                </p>
                {active.subject_snapshot && Object.keys(active.subject_snapshot).length > 0 ? (
                  <dl className="mt-3 space-y-1 text-xs text-[#4A4A45]">
                    {Object.entries(active.subject_snapshot)
                      .filter(([k]) => k !== "note")
                      .slice(0, 6)
                      .map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <dt className="w-28 shrink-0 text-[#6B6B64]">{k}</dt>
                          <dd className="font-[family-name:var(--font-dx-mono)]">
                            {typeof v === "string" || typeof v === "number" ? String(v) : JSON.stringify(v)}
                          </dd>
                        </div>
                      ))}
                  </dl>
                ) : null}
                <p className="mt-3 text-xs text-[#6B6B64]">
                  Snapshot is read-only. This UI does not invent or edit capability scores.
                </p>
              </div>

              <div className="space-y-3 border border-[#E5E2D9] bg-white px-4 py-3">
                <h3 className="text-sm font-semibold">Respond</h3>
                <label className="block text-xs text-[#6B6B64]">
                  Action
                  <select
                    className="mt-1 w-full rounded-md border border-[#D6D3C8] px-2 py-1.5 text-sm"
                    value={action}
                    onChange={(e) => setAction(e.target.value as PiReviewAction)}
                  >
                    {userActs.map((a) => (
                      <option key={a} value={a}>
                        {PI_REVIEW_ACTION_LABELS[a]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs text-[#6B6B64]">
                  Rationale
                  <textarea
                    className="mt-1 w-full rounded-md border border-[#D6D3C8] px-2 py-1.5 text-sm"
                    rows={3}
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    placeholder="Why accept or challenge this finding?"
                  />
                </label>
                <label className="block text-xs text-[#6B6B64]">
                  Context (optional)
                  <textarea
                    className="mt-1 w-full rounded-md border border-[#D6D3C8] px-2 py-1.5 text-sm"
                    rows={2}
                    value={contextNote}
                    onChange={(e) => setContextNote(e.target.value)}
                  />
                </label>
                <label className="block text-xs text-[#6B6B64]">
                  Evidence IDs (comma-separated, required for add evidence)
                  <input
                    className="mt-1 w-full rounded-md border border-[#D6D3C8] px-2 py-1.5 text-sm font-[family-name:var(--font-dx-mono)]"
                    value={evidenceIdsRaw}
                    onChange={(e) => setEvidenceIdsRaw(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void submitAction()}
                  className="rounded-md bg-[#1C4A2E] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Submit — creates new review record"}
                </button>
              </div>

              <div className="border border-[#E5E2D9] bg-white px-4 py-3">
                <h3 className="text-sm font-semibold">Event history (append-only)</h3>
                <ol className="mt-2 space-y-2 text-xs text-[#4A4A45]">
                  {events.map((ev) => (
                    <li key={ev.id} className="border-l-2 border-[#C6DDD0] pl-2">
                      <span className="font-medium">
                        {PI_REVIEW_ACTION_LABELS[ev.action]}
                      </span>
                      {" · "}
                      {PI_REVIEW_STATUS_LABELS[ev.from_status]} →{" "}
                      {PI_REVIEW_STATUS_LABELS[ev.to_status]}
                      {ev.rationale ? (
                        <span className="mt-0.5 block text-[#6B6B64]">{ev.rationale}</span>
                      ) : null}
                      <span className="block text-[10px] text-[#9CA3AF]">
                        {ev.actor_role} · {new Date(ev.created_at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                  {!events.length ? (
                    <li className="text-[#6B6B64]">No events yet — accept or challenge to append.</li>
                  ) : null}
                </ol>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#6B6B64]">Select a case to review.</p>
          )}
        </section>
      </div>
    </div>
  );
}
