"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PI_EVIDENCE_PATH, PI_FINAL_PATH, PI_PROFILE_PATH } from "@/lib/pi-profile/paths";

type CurrentItem = {
  id: string;
  kind: string;
  slug: string;
  title: string;
  prompt: string;
  competencyCodes: string[];
  acceptsUpload?: boolean;
  selectionReason?: string | null;
  industry?: string | null;
  transfer?: boolean;
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
  experienceIndustry: string | null;
  transferIndustry: string | null;
  growthReport: {
    id: string;
    status: string;
    citationCount: number;
    report: {
      transferableStrengths?: string[];
      remainingLimitations?: string[];
      levels?: Array<{
        competencyId: string;
        baselineLevel: string | null;
        finalLevel: string | null;
        evidenceIds: string[];
      }>;
      nextAction?: { title: string; rationale: string; href: string };
      transferDiffersFromExperience?: boolean;
    };
  } | null;
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
      return "Post-project interview";
    case "work_sample":
      return "Independent work sample";
    case "reflection":
      return "Reflection";
    case "transfer":
      return "Transfer task (novel context)";
    default:
      return kind;
  }
}

export function FinalAssessmentApp() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [frameworkPin, setFrameworkPin] = useState<string | null>(null);
  const [experienceIndustry, setExperienceIndustry] = useState<string | null>(null);
  const [transferIndustry, setTransferIndustry] = useState<string | null>(null);
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
      const res = await fetch("/api/pi/assessment/final/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start final assessment");
      setSessionId(data.session.id);
      setFrameworkPin(
        `${data.session.frameworkSlug}@${data.session.frameworkVersion}${
          data.session.frameworkVersionId ? "" : " (in-code pin)"
        }`,
      );
      setExperienceIndustry(data.experienceIndustry ?? null);
      setTransferIndustry(data.transferIndustry ?? null);
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
      const res = await fetch("/api/pi/assessment/final/respond", {
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
      const res = await fetch("/api/pi/assessment/final/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, runScore: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not complete final assessment");
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
        experienceIndustry: data.experienceIndustry,
        transferIndustry: data.transferIndustry,
        growthReport: data.growthReport,
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
      <p className="p-8 text-sm text-[#6B6B64]">Starting final assessment…</p>
    );
  }

  if (completeResult) {
    const report = completeResult.growthReport?.report;
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
          Final assessment complete
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[#1A1A18]">
          Growth arc closed
        </h1>
        <p className="mt-2 text-sm text-[#4A4A45]">
          Transfer ran in{" "}
          <span className="font-medium text-[#1A1A18]">
            {(completeResult.transferIndustry ?? "novel context").replace(/_/g, " ")}
          </span>
          {completeResult.experienceIndustry
            ? ` — different from Experience (${completeResult.experienceIndustry.replace(/_/g, " ")})`
            : ""}
          . Levels come only from capability assessment under{" "}
          <span className="font-medium text-[#1A1A18]">
            {completeResult.frameworkSlug}@{completeResult.frameworkVersion}
          </span>
          . Verified badge stays off.
        </p>

        <dl className="mt-6 space-y-3 text-sm text-[#4A4A45]">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-[#6B6B64]">Evidence rows</dt>
            <dd>{completeResult.evidenceIds.length}</dd>
          </div>
          {completeResult.growthReport ? (
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-[#6B6B64]">
                Growth report
              </dt>
              <dd>
                {completeResult.growthReport.status} ·{" "}
                {completeResult.growthReport.citationCount} citation
                {completeResult.growthReport.citationCount === 1 ? "" : "s"}
              </dd>
            </div>
          ) : null}
          {report?.transferableStrengths?.length ? (
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-[#6B6B64]">
                Transferable strengths
              </dt>
              <dd>{report.transferableStrengths.join(" · ")}</dd>
            </div>
          ) : null}
          {report?.remainingLimitations?.length ? (
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-[#6B6B64]">
                Remaining limitations
              </dt>
              <dd>{report.remainingLimitations.slice(0, 4).join(" · ")}</dd>
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
              Continue
            </Link>
            <Link
              href={PI_PROFILE_PATH}
              className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
            >
              View Profile
            </Link>
            <Link
              href="/portfolio"
              className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
            >
              Portfolio eligibility
            </Link>
            <Link
              href="/launchpad/app"
              className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
            >
              Career readiness
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
          Final assessment · transfer validity
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[#1A1A18]">
          Prove movement in a novel context
        </h1>
        <p className="mt-2 text-sm text-[#4A4A45]">
          Post-project interview, independent work sample, and a transfer task outside your
          Experience industry. Descriptive only — not a pass/fail quiz.
        </p>
        {frameworkPin ? (
          <p className="mt-2 text-xs text-[#6B6B64]">Framework pin: {frameworkPin}</p>
        ) : null}
        {(experienceIndustry || transferIndustry) && (
          <p className="mt-1 text-xs text-[#6B6B64]">
            Experience: {(experienceIndustry ?? "unknown").replace(/_/g, " ")} · Transfer:{" "}
            {(transferIndustry ?? "pending").replace(/_/g, " ")}
          </p>
        )}
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
              {currentItem.transfer && currentItem.industry
                ? ` · ${(String(currentItem.industry)).replace(/_/g, " ")}`
                : ""}
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
            <label htmlFor="final-response" className="block text-xs font-medium text-[#4A4A45]">
              Your answer
            </label>
            <textarea
              id="final-response"
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
                Finish final &amp; growth report
              </button>
            ) : null}
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[#4A4A45]">
            {doneSelecting
              ? "You have enough responses including transfer. Finish to write ledger evidence, run a final capability assessment, and build a growth report."
              : "No current item. Refresh to resume or finish if ready."}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={submitting || !canComplete}
              onClick={() => void onComplete()}
              className="rounded-md bg-[#1C4A2E] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Completing…" : "Finish final & growth report"}
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
            <Link href={PI_FINAL_PATH} className="sr-only">
              Final
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
