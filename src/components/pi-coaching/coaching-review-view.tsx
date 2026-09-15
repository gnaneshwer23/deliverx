"use client";

import {
  COACHING_DOES_NOT_GRANT_VERIFIED,
} from "@/lib/coaching-evidence/trust-guards";
import {
  COACHING_REVIEW_DECISION_LABELS,
  COACHING_SUBMISSION_STATUS_LABELS,
  type CoachingReviewDecision,
  type CoachingSubmissionRow,
  type CoachingSubmissionReviewRow,
} from "@/lib/coaching-evidence/types";

export type CoachingReviewViewProps = {
  queue: CoachingSubmissionRow[];
  activeSubmission?: CoachingSubmissionRow | null;
  reviews?: CoachingSubmissionReviewRow[];
  notice?: string;
  busy?: boolean;
  decisionForm: {
    decision: CoachingReviewDecision;
    rationale: string;
    aiAssisted: boolean;
    citations: string;
  };
  onSelect?: (submissionId: string) => void;
  onDecisionChange?: (patch: Partial<CoachingReviewViewProps["decisionForm"]>) => void;
  onDecide?: () => void;
};

export function CoachingReviewView({
  queue,
  activeSubmission,
  reviews = [],
  notice,
  busy,
  decisionForm,
  onSelect,
  onDecisionChange,
  onDecide,
}: CoachingReviewViewProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-12">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B64]">
          Professional Intelligence · Coach queue
        </p>
        <h1 className="font-[family-name:var(--font-dx-display)] text-2xl text-[#1A1A18]">
          Confirm coaching submissions
        </h1>
        <p className="text-sm text-[#4A4A45]">
          You are the human in the loop. Confirming records <strong>supported</strong> evidence for
          the learner. AI may assist, but only you can confirm.
        </p>
        <p className="rounded-md border border-[#E5E2D9] bg-white px-3 py-2 text-sm text-[#4A4A45]">
          {COACHING_DOES_NOT_GRANT_VERIFIED}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[#1A1A18]">Open queue</h2>
          {queue.length === 0 ? (
            <p className="text-sm text-[#6B6B64]">No submissions awaiting review.</p>
          ) : (
            <ul className="space-y-2">
              {queue.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onSelect?.(s.id)}
                    className={`w-full rounded-md border px-3 py-2 text-left ${
                      activeSubmission?.id === s.id
                        ? "border-[#1C4A2E] bg-[#F3F6F1]"
                        : "border-[#E5E2D9] bg-white"
                    }`}
                  >
                    <p className="text-sm text-[#1A1A18]">Submission · attempt {s.attempt}</p>
                    <p className="text-xs text-[#6B6B64]">
                      {COACHING_SUBMISSION_STATUS_LABELS[s.status]} ·{" "}
                      {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-[#1A1A18]">Decision</h2>
          {!activeSubmission ? (
            <p className="text-sm text-[#6B6B64]">Select a submission to review.</p>
          ) : (
            <div className="space-y-4 rounded-lg border border-[#E5E2D9] bg-white p-5">
              <div className="space-y-1">
                <p className="text-sm text-[#1A1A18]">
                  Attempt {activeSubmission.attempt} ·{" "}
                  {COACHING_SUBMISSION_STATUS_LABELS[activeSubmission.status]}
                </p>
                <p className="text-xs text-[#6B6B64]">
                  Learner self-confidence:{" "}
                  {activeSubmission.self_confidence
                    ? `${activeSubmission.self_confidence}/5 (a claim)`
                    : "not stated"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#4A4A45]" htmlFor="decision">
                  Decision
                </label>
                <select
                  id="decision"
                  className="w-full rounded-md border border-[#D9D6CC] bg-white px-3 py-2 text-sm text-[#1A1A18]"
                  value={decisionForm.decision}
                  onChange={(e) =>
                    onDecisionChange?.({ decision: e.target.value as CoachingReviewDecision })
                  }
                >
                  {(Object.keys(COACHING_REVIEW_DECISION_LABELS) as CoachingReviewDecision[]).map(
                    (d) => (
                      <option key={d} value={d}>
                        {COACHING_REVIEW_DECISION_LABELS[d]}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#4A4A45]" htmlFor="rationale">
                  Rationale (required, min 8 chars)
                </label>
                <textarea
                  id="rationale"
                  rows={3}
                  className="w-full rounded-md border border-[#D9D6CC] bg-white px-3 py-2 text-sm text-[#1A1A18]"
                  value={decisionForm.rationale}
                  onChange={(e) => onDecisionChange?.({ rationale: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-[#4A4A45]">
                <input
                  type="checkbox"
                  checked={decisionForm.aiAssisted}
                  onChange={(e) => onDecisionChange?.({ aiAssisted: e.target.checked })}
                />
                This decision was AI-assisted (citations required)
              </label>
              {decisionForm.aiAssisted ? (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#4A4A45]" htmlFor="citations">
                    Citations (comma-separated source ids)
                  </label>
                  <input
                    id="citations"
                    className="w-full rounded-md border border-[#D9D6CC] bg-white px-3 py-2 text-sm text-[#1A1A18]"
                    value={decisionForm.citations}
                    onChange={(e) => onDecisionChange?.({ citations: e.target.value })}
                  />
                </div>
              ) : null}

              <button
                type="button"
                disabled={busy}
                onClick={() => onDecide?.()}
                className="rounded-md bg-[#1C4A2E] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {busy ? "Recording…" : "Record decision"}
              </button>
              {notice ? <p className="text-xs text-[#6B6B64]">{notice}</p> : null}

              {reviews.length > 0 ? (
                <div className="space-y-2 border-t border-[#EDEAE1] pt-3">
                  <p className="text-xs font-semibold text-[#4A4A45]">Decision history</p>
                  <ul className="space-y-1">
                    {reviews.map((r) => (
                      <li key={r.id} className="text-xs text-[#6B6B64]">
                        {COACHING_REVIEW_DECISION_LABELS[r.decision]} —{" "}
                        {r.evidence_id ? "supported evidence recorded" : "no evidence"}
                        {r.ai_assisted ? " · AI-assisted" : ""}
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
