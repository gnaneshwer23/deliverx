"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PI_EVIDENCE_PATH, PI_PROFILE_PATH } from "@/lib/pi-profile/paths";

type CurrentItem = {
  id: string;
  kind: string;
  slug: string;
  title: string;
  prompt: string;
  competencyCodes: string[];
  acceptsUpload?: boolean;
  selectionReason?: string | null;
};

type CompleteResult = {
  evidenceIds: string[];
  scoreRunId: string | null;
  snapshotId: string | null;
  frameworkVersionId: string | null;
  frameworkSlug?: string;
  frameworkVersion?: string;
  readiness: number | null;
  strengths: string[];
  gaps: string[];
  recommendedNext: {
    title: string;
    rationale: string;
    href: string;
    kind: string;
  };
};

function kindLabel(kind: string): string {
  switch (kind) {
    case "interview":
      return "Adaptive interview";
    case "scenario":
      return "Scenario";
    case "work_sample":
      return "Work sample";
    case "reflection":
      return "Reflection";
    case "decision":
      return "Decision exercise";
    default:
      return kind;
  }
}

export function BaselineAssessmentApp() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [frameworkPin, setFrameworkPin] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<CurrentItem | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [canComplete, setCanComplete] = useState(false);
  const [doneSelecting, setDoneSelecting] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [completeResult, setCompleteResult] = useState<CompleteResult | null>(null);
  const [extracting, setExtracting] = useState(false);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pi/assessment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start baseline");
      setSessionId(data.session.id);
      setFrameworkPin(
        data.session.frameworkVersionId
          ? `${data.session.frameworkSlug}@${data.session.frameworkVersion}`
          : `${data.session.frameworkSlug}@${data.session.frameworkVersion} (in-code pin)`,
      );
      setCurrentItem(data.currentItem);
      if (!data.currentItem) {
        setDoneSelecting(true);
        setCanComplete(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Start failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  async function onSubmitResponse(e: FormEvent) {
    e.preventDefault();
    if (!sessionId || !currentItem) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/pi/assessment/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          itemId: currentItem.id,
          responseText,
          workSample:
            currentItem.kind === "work_sample"
              ? { extractedText: responseText, charCount: responseText.length }
              : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save response");
      setAnsweredCount(data.answeredCount ?? answeredCount + 1);
      setCanComplete(Boolean(data.canComplete));
      setResponseText("");
      if (data.nextItem) {
        setCurrentItem(data.nextItem);
        setDoneSelecting(false);
      } else {
        setCurrentItem(null);
        setDoneSelecting(true);
        setCanComplete(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Respond failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onExtractFile(file: File) {
    setExtracting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/documents/extract-text", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not extract text");
      setResponseText((prev) =>
        prev.trim()
          ? `${prev.trim()}\n\n---\n${data.text as string}`
          : (data.text as string),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extract failed");
    } finally {
      setExtracting(false);
    }
  }

  async function onComplete() {
    if (!sessionId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/pi/assessment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, runScore: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not complete baseline");
      setCompleteResult({
        evidenceIds: data.evidenceIds ?? [],
        scoreRunId: data.scoreRunId,
        snapshotId: data.snapshotId,
        frameworkVersionId: data.frameworkVersionId,
        frameworkSlug: data.frameworkSlug,
        frameworkVersion: data.frameworkVersion,
        readiness: data.readiness,
        strengths: data.strengths ?? [],
        gaps: data.gaps ?? [],
        recommendedNext: data.recommendedNext,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Complete failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <p className="p-8 text-sm text-[#6B6B64]">Starting baseline assessment…</p>
    );
  }

  if (completeResult) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
          Baseline complete
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[#1A1A18]">
          Starting picture captured
        </h1>
        <p className="mt-2 text-sm text-[#4A4A45]">
          Your answers are Evidence Ledger records with provenance — not a silent capability
          assignment. ScoreRun projected levels under{" "}
          <span className="font-medium text-[#1A1A18]">
            {completeResult.frameworkSlug}@{completeResult.frameworkVersion}
          </span>
          {completeResult.frameworkVersionId ? " (pinned)." : "."}
        </p>

        <dl className="mt-6 space-y-3 text-sm text-[#4A4A45]">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-[#6B6B64]">Evidence rows</dt>
            <dd>{completeResult.evidenceIds.length}</dd>
          </div>
          {completeResult.readiness != null ? (
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-[#6B6B64]">
                Readiness signal
              </dt>
              <dd>
                {Math.round(completeResult.readiness)} — labelled coverage/signal, not a credential
              </dd>
            </div>
          ) : null}
          {completeResult.strengths.length ? (
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-[#6B6B64]">Strengths</dt>
              <dd>{completeResult.strengths.join(" · ")}</dd>
            </div>
          ) : null}
          {completeResult.gaps.length ? (
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-[#6B6B64]">Priority gaps</dt>
              <dd>{completeResult.gaps.join(" · ")}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-6 rounded-md border border-[#E5E2D9] bg-white p-4">
          <p className="text-[11px] uppercase tracking-wide text-[#6B6B64]">Recommended next</p>
          <p className="mt-1 text-sm font-medium text-[#1A1A18]">
            {completeResult.recommendedNext.title}
          </p>
          <p className="mt-1 text-sm text-[#4A4A45]">
            {completeResult.recommendedNext.rationale}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={completeResult.recommendedNext.href}
              className="rounded-md bg-[#1C4A2E] px-3 py-2 text-xs font-medium text-white"
            >
              Open Experience
            </Link>
            <Link
              href={PI_PROFILE_PATH}
              className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
            >
              View Profile
            </Link>
            <Link
              href={PI_EVIDENCE_PATH}
              className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
            >
              Evidence Ledger
            </Link>
            <Link
              href="/pi/review"
              className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
            >
              Review findings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <header className="mb-6 border-b border-[#E5E2D9] pb-5">
        <p className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
          Baseline assessment · Product Manager (pm-core)
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[#1A1A18]">
          Establish a starting picture
        </h1>
        <p className="mt-2 text-sm text-[#4A4A45]">
          Interview, scenarios, a work sample, and reflection. Answers become ledger evidence with
          provenance. Self-reported ≠ verified. Learning ≠ competency.
        </p>
        {frameworkPin ? (
          <p className="mt-2 text-xs text-[#6B6B64]">Framework pin: {frameworkPin}</p>
        ) : null}
        <p className="mt-1 text-xs text-[#6B6B64]">
          Answered {answeredCount} ·{" "}
          <Link href={PI_PROFILE_PATH} className="underline">
            Back to Profile
          </Link>
        </p>
      </header>

      {error ? <p className="mb-4 text-sm text-red-700">{error}</p> : null}

      {currentItem ? (
        <form onSubmit={onSubmitResponse} className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[#6B6B64]">
              {kindLabel(currentItem.kind)}
            </p>
            <h2 className="mt-1 text-lg font-medium text-[#1A1A18]">{currentItem.title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-[#4A4A45]">{currentItem.prompt}</p>
            {currentItem.competencyCodes.length ? (
              <p className="mt-2 text-xs text-[#6B6B64]">
                Targets: {currentItem.competencyCodes.join(", ")}
              </p>
            ) : null}
          </div>

          {currentItem.acceptsUpload || currentItem.kind === "work_sample" ? (
            <div>
              <label className="block text-xs font-medium text-[#4A4A45]">
                Optional upload (PDF, DOCX, or text)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md,.csv"
                className="mt-1 block w-full text-xs text-[#4A4A45]"
                disabled={extracting || submitting}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onExtractFile(file);
                }}
              />
              {extracting ? (
                <p className="mt-1 text-xs text-[#6B6B64]">Extracting text…</p>
              ) : null}
            </div>
          ) : null}

          <div>
            <label htmlFor="baseline-response" className="block text-xs font-medium text-[#4A4A45]">
              Your answer
            </label>
            <textarea
              id="baseline-response"
              required
              minLength={20}
              rows={10}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm text-[#1A1A18]"
              placeholder="Be concrete. Cite decisions, trade-offs, and what evidence would change your mind."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={submitting || responseText.trim().length < 20}
              className="rounded-md bg-[#1C4A2E] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save & continue"}
            </button>
            {canComplete ? (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void onComplete()}
                className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
              >
                Finish baseline &amp; ScoreRun
              </button>
            ) : null}
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[#4A4A45]">
            {doneSelecting
              ? "You have enough responses for a starting picture. Finish to write ledger evidence and run ScoreRun."
              : "No current item. You can finish if you have enough answers, or refresh to resume."}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={submitting || !canComplete}
              onClick={() => void onComplete()}
              className="rounded-md bg-[#1C4A2E] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Completing…" : "Finish baseline & ScoreRun"}
            </button>
            <button
              type="button"
              onClick={() => void bootstrap()}
              className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
            >
              Refresh session
            </button>
            <button
              type="button"
              onClick={() => router.push(PI_PROFILE_PATH)}
              className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
