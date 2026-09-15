"use client";

import {
  COACHING_SUBMISSION_STATUS_LABELS,
  COACH_CONFIRMATION_IS_NOT_VERIFICATION,
  type CoachingIntakeMethod,
  type CoachingSubmissionRow,
} from "@/lib/coaching-evidence/types";
import type { ProgrammeWithExercises } from "@/lib/coaching-evidence/store";

export type CoachingSubmitViewProps = {
  programmes: ProgrammeWithExercises[];
  submissions: CoachingSubmissionRow[];
  notice?: string;
  busy?: boolean;
  form: {
    programmeId: string;
    exerciseId: string;
    title: string;
    intakeMethod: CoachingIntakeMethod;
    body: string;
    selfConfidence: number | null;
    aiAssisted: boolean;
  };
  onFormChange?: (patch: Partial<CoachingSubmitViewProps["form"]>) => void;
  onSubmit?: () => void;
};

const STATUS_TONE: Record<string, string> = {
  submitted: "bg-[#EEF1EA] text-[#3C5A3C]",
  under_review: "bg-[#EDF0F5] text-[#33507A]",
  confirmed: "bg-[#E7F0E8] text-[#1C4A2E]",
  rejected: "bg-[#F3ECEC] text-[#7A3B3B]",
  changes_requested: "bg-[#F4F0E6] text-[#7A6321]",
  withdrawn: "bg-[#EEEEEA] text-[#5A5A54]",
};

export function CoachingSubmitView({
  programmes,
  submissions,
  notice,
  busy,
  form,
  onFormChange,
  onSubmit,
}: CoachingSubmitViewProps) {
  const activeProgramme = programmes.find((p) => p.id === form.programmeId) ?? programmes[0];
  const exercises = activeProgramme?.exercises ?? [];
  const activeExercise = exercises.find((e) => e.id === form.exerciseId) ?? exercises[0];

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B64]">
          Professional Intelligence · Coaching
        </p>
        <h1 className="font-[family-name:var(--font-dx-display)] text-2xl text-[#1A1A18]">
          Submit work for coach confirmation
        </h1>
        <p className="text-sm text-[#4A4A45]">
          Submit a piece of practice. A human coach reviews it and, if they confirm it, it is
          recorded as <strong>supported</strong> evidence in your ledger.
        </p>
        <p className="rounded-md border border-[#E5E2D9] bg-white px-3 py-2 text-sm text-[#4A4A45]">
          {COACH_CONFIRMATION_IS_NOT_VERIFICATION}
        </p>
      </header>

      <section className="space-y-4 rounded-lg border border-[#E5E2D9] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#1A1A18]">New submission</h2>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#4A4A45]" htmlFor="programme">
            Programme
          </label>
          <select
            id="programme"
            className="w-full rounded-md border border-[#D9D6CC] bg-white px-3 py-2 text-sm text-[#1A1A18]"
            value={activeProgramme?.id ?? ""}
            onChange={(e) => onFormChange?.({ programmeId: e.target.value, exerciseId: "" })}
          >
            {programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} · {p.framework_version_ref}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#4A4A45]" htmlFor="exercise">
            Exercise
          </label>
          <select
            id="exercise"
            className="w-full rounded-md border border-[#D9D6CC] bg-white px-3 py-2 text-sm text-[#1A1A18]"
            value={activeExercise?.id ?? ""}
            onChange={(e) => onFormChange?.({ exerciseId: e.target.value })}
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>
          {activeExercise?.instructions ? (
            <p className="pt-1 text-xs text-[#6B6B64]">{activeExercise.instructions}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#4A4A45]" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className="w-full rounded-md border border-[#D9D6CC] bg-white px-3 py-2 text-sm text-[#1A1A18]"
            value={form.title}
            placeholder="e.g. Discovery interview synthesis"
            onChange={(e) => onFormChange?.({ title: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#4A4A45]" htmlFor="body">
            Your work
          </label>
          <textarea
            id="body"
            rows={5}
            className="w-full rounded-md border border-[#D9D6CC] bg-white px-3 py-2 text-sm text-[#1A1A18]"
            value={form.body}
            placeholder="Describe what you did, or paste a link / summary."
            onChange={(e) => onFormChange?.({ body: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#4A4A45]" htmlFor="confidence">
              Self-reported confidence (a claim, not evidence)
            </label>
            <select
              id="confidence"
              className="rounded-md border border-[#D9D6CC] bg-white px-3 py-2 text-sm text-[#1A1A18]"
              value={form.selfConfidence ?? ""}
              onChange={(e) =>
                onFormChange?.({
                  selfConfidence: e.target.value ? Number(e.target.value) : null,
                })
              }
            >
              <option value="">Not stated</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} / 5
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-end gap-2 pb-2 text-xs text-[#4A4A45]">
            <input
              type="checkbox"
              checked={form.aiAssisted}
              onChange={(e) => onFormChange?.({ aiAssisted: e.target.checked })}
            />
            This draft was AI-assisted
          </label>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => onSubmit?.()}
          className="rounded-md bg-[#1C4A2E] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "Submitting…" : "Submit for coach confirmation"}
        </button>
        {notice ? <p className="text-xs text-[#6B6B64]">{notice}</p> : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#1A1A18]">Your submissions</h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-[#6B6B64]">No submissions yet.</p>
        ) : (
          <ul className="space-y-2">
            {submissions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-md border border-[#E5E2D9] bg-white px-3 py-2"
              >
                <div className="space-y-0.5">
                  <p className="text-sm text-[#1A1A18]">Attempt {s.attempt}</p>
                  <p className="text-xs text-[#6B6B64]">
                    {new Date(s.created_at).toLocaleDateString()}
                    {s.evidence_id ? " · supported evidence recorded" : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_TONE[s.status] ?? "bg-[#EEEEEA] text-[#5A5A54]"
                  }`}
                >
                  {COACHING_SUBMISSION_STATUS_LABELS[s.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
