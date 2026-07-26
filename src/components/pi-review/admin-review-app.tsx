"use client";

import { useCallback, useEffect, useState } from "react";
import { scheduleEffectWork } from "@/lib/react/schedule-effect-work";
import Link from "next/link";
import {
  ADMIN_ACTIONS,
  PI_REVIEW_ACTION_LABELS,
  PI_REVIEW_STATUS_LABELS,
  PI_REVIEW_SUBJECT_LABELS,
  type PiReviewAction,
  type PiReviewStatus,
  type PiReviewSubjectKind,
} from "@/lib/pi-review/types";
import { availableActions } from "@/lib/pi-review/status-machine";

type CaseRow = {
  id: string;
  user_id: string;
  subject_kind: PiReviewSubjectKind;
  subject_label: string;
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
  evidence_ids: string[];
  proposed_revision: Record<string, unknown>;
  created_at: string;
  actor_role: string;
};

export function PiReviewAdminApp() {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [active, setActive] = useState<CaseRow | null>(null);
  const [notice, setNotice] = useState("Admin queue: uphold, revise, or escalate.");
  const [busy, setBusy] = useState(false);
  const [action, setAction] = useState<PiReviewAction>("start_review");
  const [rationale, setRationale] = useState("");
  const [evidenceIdsRaw, setEvidenceIdsRaw] = useState("");
  const [proposedLevel, setProposedLevel] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/pi/review/admin");
    const json = await res.json();
    if (!res.ok) {
      setNotice(json.error || "Could not load admin queue");
      return;
    }
    setCases(json.data ?? []);
    setNotice(`${(json.data ?? []).length} case(s) in admin queue.`);
  }, []);

  useEffect(() => scheduleEffectWork(() => { void load(); }), [load]);

  async function openCase(id: string) {
    setActiveId(id);
    setBusy(true);
    try {
      const res = await fetch(`/api/pi/review/admin?caseId=${encodeURIComponent(id)}`);
      const json = await res.json();
      if (!res.ok) {
        setNotice(json.error || "Could not load case");
        return;
      }
      setActive(json.data.case);
      setEvents(json.data.events ?? []);
      const acts = availableActions(json.data.case.current_status, "admin_reviewer");
      if (acts.length) setAction(acts[0]!);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!activeId) return;
    setBusy(true);
    try {
      const evidenceIds = evidenceIdsRaw
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const proposedRevision: Record<string, unknown> = {};
      if (proposedLevel.trim()) {
        proposedRevision.levelProposed = proposedLevel.trim();
      }
      const res = await fetch("/api/pi/review/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: activeId,
          action,
          rationale,
          evidenceIds,
          proposedRevision,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setNotice(json.error || "Admin action failed");
        return;
      }
      setNotice(
        `Admin ${PI_REVIEW_ACTION_LABELS[action]} → ${PI_REVIEW_STATUS_LABELS[json.data.toStatus as PiReviewStatus]}. Capability tables untouched.`,
      );
      setRationale("");
      setEvidenceIdsRaw("");
      setProposedLevel("");
      await load();
      await openCase(activeId);
    } finally {
      setBusy(false);
    }
  }

  const adminActs = active
    ? availableActions(active.current_status, "admin_reviewer")
    : [...ADMIN_ACTIONS];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="space-y-2 border-b border-[#E5E2D9] pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B64]">
          PI Admin
        </p>
        <h1 className="font-[family-name:var(--font-dx-display)] text-2xl text-[#1A1A18]">
          Human review queue
        </h1>
        <p className="max-w-2xl text-sm text-[#4A4A45]">
          Uphold, revise (with evidence), or escalate. Revising never silently rewrites verified
          capability — it records a new event and signals reassessment.
        </p>
        <Link href="/pi/review" className="text-sm text-[#1C4A2E] underline">
          User review queue
        </Link>
      </header>

      <p className="text-sm text-[#4A4A45]" role="status">
        {notice}
      </p>

      <button
        type="button"
        onClick={() => void load()}
        className="rounded-md border border-[#D6D3C8] bg-white px-3 py-1.5 text-xs font-medium"
      >
        Refresh
      </button>

      <div className="grid gap-6 md:grid-cols-2">
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
                <span className="block font-medium">{c.subject_label}</span>
                <span className="mt-1 block text-xs text-[#6B6B64]">
                  {PI_REVIEW_SUBJECT_LABELS[c.subject_kind]} ·{" "}
                  {PI_REVIEW_STATUS_LABELS[c.current_status]} · SLA{" "}
                  {c.sla_due_at ? new Date(c.sla_due_at).toLocaleDateString() : "—"}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <section className="space-y-4">
          {active ? (
            <>
              <div className="border border-[#E5E2D9] bg-white px-4 py-3 text-sm">
                <p className="font-semibold">{active.subject_label}</p>
                <p className="mt-1 text-xs text-[#6B6B64]">
                  User {active.user_id.slice(0, 8)}… · {PI_REVIEW_STATUS_LABELS[active.current_status]}
                </p>
              </div>

              <div className="space-y-3 border border-[#E5E2D9] bg-white px-4 py-3">
                <label className="block text-xs text-[#6B6B64]">
                  Admin action
                  <select
                    className="mt-1 w-full rounded-md border border-[#D6D3C8] px-2 py-1.5 text-sm"
                    value={action}
                    onChange={(e) => setAction(e.target.value as PiReviewAction)}
                  >
                    {adminActs.map((a) => (
                      <option key={a} value={a}>
                        {PI_REVIEW_ACTION_LABELS[a]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs text-[#6B6B64]">
                  Rationale (required for uphold / revise / escalate)
                  <textarea
                    className="mt-1 w-full rounded-md border border-[#D6D3C8] px-2 py-1.5 text-sm"
                    rows={3}
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                  />
                </label>
                <label className="block text-xs text-[#6B6B64]">
                  Evidence IDs (required if proposing a level change)
                  <input
                    className="mt-1 w-full rounded-md border border-[#D6D3C8] px-2 py-1.5 text-sm font-[family-name:var(--font-dx-mono)]"
                    value={evidenceIdsRaw}
                    onChange={(e) => setEvidenceIdsRaw(e.target.value)}
                  />
                </label>
                <label className="block text-xs text-[#6B6B64]">
                  Proposed level (revise only — queues reassessment; does not write scores)
                  <input
                    className="mt-1 w-full rounded-md border border-[#D6D3C8] px-2 py-1.5 text-sm"
                    value={proposedLevel}
                    onChange={(e) => setProposedLevel(e.target.value)}
                    placeholder="e.g. developing"
                  />
                </label>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void submit()}
                  className="rounded-md bg-[#1C4A2E] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Apply admin decision"}
                </button>
              </div>

              <ol className="space-y-2 border border-[#E5E2D9] bg-white px-4 py-3 text-xs">
                {events.map((ev) => (
                  <li key={ev.id} className="border-l-2 border-[#C6DDD0] pl-2">
                    <span className="font-medium">{PI_REVIEW_ACTION_LABELS[ev.action]}</span>
                    {" · "}
                    {PI_REVIEW_STATUS_LABELS[ev.from_status]} →{" "}
                    {PI_REVIEW_STATUS_LABELS[ev.to_status]}
                    {ev.rationale ? (
                      <span className="mt-0.5 block text-[#6B6B64]">{ev.rationale}</span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="text-sm text-[#6B6B64]">Select a case.</p>
          )}
        </section>
      </div>
    </div>
  );
}
