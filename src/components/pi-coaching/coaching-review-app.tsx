"use client";

import { useCallback, useEffect, useState } from "react";
import { scheduleEffectWork } from "@/lib/react/schedule-effect-work";
import { CoachingReviewView } from "@/components/pi-coaching/coaching-review-view";
import type {
  CoachingReviewDecision,
  CoachingSubmissionRow,
  CoachingSubmissionReviewRow,
} from "@/lib/coaching-evidence/types";

type DecisionForm = {
  decision: CoachingReviewDecision;
  rationale: string;
  aiAssisted: boolean;
  citations: string;
};

const EMPTY_DECISION: DecisionForm = {
  decision: "confirm",
  rationale: "",
  aiAssisted: false,
  citations: "",
};

export function CoachingReviewApp() {
  const [queue, setQueue] = useState<CoachingSubmissionRow[]>([]);
  const [activeSubmission, setActiveSubmission] = useState<CoachingSubmissionRow | null>(null);
  const [reviews, setReviews] = useState<CoachingSubmissionReviewRow[]>([]);
  const [decisionForm, setDecisionForm] = useState<DecisionForm>(EMPTY_DECISION);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const loadQueue = useCallback(async () => {
    const res = await fetch("/api/pi/coaching/review");
    if (res.ok) {
      const json = await res.json();
      setQueue((json.data ?? []) as CoachingSubmissionRow[]);
    }
  }, []);

  useEffect(() => scheduleEffectWork(() => { void loadQueue(); }), [loadQueue]);

  const onSelect = useCallback(async (submissionId: string) => {
    setNotice("");
    setDecisionForm(EMPTY_DECISION);
    const res = await fetch(`/api/pi/coaching/review?submissionId=${encodeURIComponent(submissionId)}`);
    if (res.ok) {
      const json = await res.json();
      setActiveSubmission(json.data?.submission ?? null);
      setReviews((json.data?.reviews ?? []) as CoachingSubmissionReviewRow[]);
    }
  }, []);

  const onDecide = useCallback(async () => {
    if (!activeSubmission) return;
    setBusy(true);
    setNotice("");
    try {
      const citations = decisionForm.aiAssisted
        ? decisionForm.citations.split(",").map((c) => c.trim()).filter(Boolean)
        : undefined;
      const res = await fetch(`/api/pi/coaching/review/${activeSubmission.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: decisionForm.decision,
          rationale: decisionForm.rationale,
          aiAssisted: decisionForm.aiAssisted,
          citations,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setNotice(json.error ?? "Could not record decision.");
      } else {
        setNotice(
          json.data?.evidenceId
            ? "Confirmed — supported evidence recorded (not Verified, no capability written)."
            : "Decision recorded. No evidence appended.",
        );
        await loadQueue();
        await onSelect(activeSubmission.id);
      }
    } finally {
      setBusy(false);
    }
  }, [activeSubmission, decisionForm, loadQueue, onSelect]);

  return (
    <CoachingReviewView
      queue={queue}
      activeSubmission={activeSubmission}
      reviews={reviews}
      decisionForm={decisionForm}
      busy={busy}
      notice={notice}
      onSelect={onSelect}
      onDecisionChange={(patch) => setDecisionForm((d) => ({ ...d, ...patch }))}
      onDecide={onDecide}
    />
  );
}
