"use client";

import { useEffect, useRef, useState } from "react";
import { AiCitationStrip } from "@/components/dx/ai-citation-strip";
import type { ExperienceSimState, HiringInterviewTurn } from "@/lib/experience-sim/types";
import {
  canFinishHiringInterview,
  candidateAnswerCount,
  HIRING_INTERVIEW_MAX_ANSWERS,
  HIRING_PLACEMENT_HONESTY,
} from "@/lib/xperience/hiring-interview";

type Claims = {
  background?: string;
  targetRole?: string;
  selectedSkill?: string;
  workStyle?: string;
};

export function HiringInterview({
  enrolmentId,
  state,
  firstName,
  claims,
  onState,
  onContinue,
}: {
  enrolmentId: string;
  state: ExperienceSimState | null;
  firstName: string;
  claims: Claims;
  onState: (state: ExperienceSimState) => void;
  onContinue: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const opened = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const interview = state?.hiringInterview ?? null;
  const finished = interview?.status === "completed" || interview?.status === "skipped";
  const placement = interview?.placement;
  const answers = candidateAnswerCount(interview ?? undefined);
  const canFinish = canFinishHiringInterview(interview ?? undefined);

  useEffect(() => {
    headingRef.current?.focus();
  }, [interview?.turns.length, finished]);

  useEffect(() => {
    if (!enrolmentId || opened.current) return;
    opened.current = true;
    void post({ action: "open" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once per mount
  }, [enrolmentId]);

  async function post(body: { action: "open" | "turn" | "complete" | "skip"; text?: string }) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/xperience/sim/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrolmentId,
          ...body,
          claims,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        state?: ExperienceSimState;
      };
      if (!response.ok || !result.state) {
        if (
          result.error === "hiring_interview_not_offered" ||
          result.error === "hiring_interview_disabled"
        ) {
          onContinue();
          return;
        }
        setError(
          result.error === "answer_too_short"
            ? "Say a little more so the panel can respond."
            : result.error === "hiring_interview_too_short"
              ? "Answer two questions, or skip to join without the interview."
              : "The panel could not continue. You can skip and still join.",
        );
        return;
      }
      onState(result.state);
      if (body.action === "skip" && !result.state.hiringInterview) {
        onContinue();
        return;
      }
      if (body.action === "turn") setDraft("");
    } catch {
      setError("The panel could not continue. You can skip and still join.");
    } finally {
      setBusy(false);
    }
  }

  const company = state?.company.name ?? "your company";
  const manager = interview?.panel.manager;
  const stakeholder = interview?.panel.stakeholder;

  return (
    <main className="xp-root min-h-screen bg-stone-50 text-stone-950">
      <div className="xp-onboarding-layout xp-ceremony">
        <aside className="xp-onboarding-sidebar">
          <p className="xp-brand">Joining {company}</p>
          <p className="xp-eyebrow">Hiring conversation</p>
          <h2>Meet your panel, {firstName}.</h2>
          <p>
            A short practice interview for this simulated role. Skip is always
            allowed. This is not a real hiring decision.
          </p>
          <div className="xp-readiness-card">
            <p className="xp-eyebrow">Your panel</p>
            {manager ? (
              <p>
                <strong>{manager.name}</strong>
                <span> · {manager.role}</span>
              </p>
            ) : null}
            {stakeholder ? (
              <p>
                <strong>{stakeholder.name}</strong>
                <span> · {stakeholder.role}</span>
              </p>
            ) : null}
            <p className="xp-honesty-note">{HIRING_PLACEMENT_HONESTY}</p>
          </div>
        </aside>

        <section className="xp-onboarding-main">
          <div className="xp-onboarding-content">
            <p className="xp-eyebrow">Practice placement</p>
            <h1 ref={headingRef} tabIndex={-1}>
              {finished ? "You have a place on the team." : "The panel would like to hear from you."}
            </h1>

            {finished && placement ? (
              <div className="xp-hire-placement" role="status">
                <p className="xp-eyebrow">Placement</p>
                <p>
                  <strong>
                    {placement.roleTitle} · {placement.companyName}
                  </strong>
                </p>
                <p>{placement.projectName}</p>
                <p>{placement.teamSummary}</p>
                <p>
                  First week focus: <strong>{placement.firstWeekFocus}</strong>
                </p>
                <p className="xp-honesty-note">{placement.honesty}</p>
              </div>
            ) : (
              <ol className="xp-hire-transcript" aria-live="polite">
                {(interview?.turns ?? []).map((turn) => (
                  <TurnItem key={turn.id} turn={turn} />
                ))}
              </ol>
            )}

            {error ? (
              <div className="xp-ceremony-alert" role="alert">
                {error}
              </div>
            ) : null}

            {!finished ? (
              <form
                className="xp-hire-compose"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (busy || draft.trim().length < 8) return;
                  void post({ action: "turn", text: draft });
                }}
              >
                <label className="xp-field" htmlFor="hiring-answer">
                  Your answer
                  <textarea
                    id="hiring-answer"
                    rows={4}
                    value={draft}
                    disabled={busy}
                    maxLength={4000}
                    onChange={(event) => setDraft(event.target.value)}
                  />
                </label>
                <div className="xp-onboarding-actions">
                  <span>
                    {answers} of {HIRING_INTERVIEW_MAX_ANSWERS} answers
                  </span>
                  <button type="submit" disabled={busy || draft.trim().length < 8}>
                    {busy ? "Waiting for the panel" : "Send answer"}
                  </button>
                  <button
                    type="button"
                    className="xp-button secondary"
                    disabled={busy || !canFinish}
                    onClick={() => void post({ action: "complete" })}
                  >
                    Finish interview
                  </button>
                </div>
              </form>
            ) : (
              <div className="xp-onboarding-actions">
                <button type="button" onClick={onContinue}>
                  Continue to your first day
                </button>
              </div>
            )}

            {!finished ? (
              <button
                type="button"
                className="xp-ceremony-skip"
                onClick={() => void post({ action: "skip" })}
              >
                Skip interview and join anyway
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function TurnItem({ turn }: { turn: HiringInterviewTurn }) {
  const isCandidate = turn.role === "candidate";
  return (
    <li className={isCandidate ? "is-candidate" : "is-panel"}>
      <p className="xp-eyebrow">
        {isCandidate ? "You" : `${turn.speakerName} · ${turn.role === "manager" ? "Hiring manager" : "Stakeholder"}`}
      </p>
      <p>{turn.text}</p>
      {!isCandidate ? (
        <AiCitationStrip citations={turn.citations} emptyLabel={null} />
      ) : null}
    </li>
  );
}
