"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { AiStatusBanner } from "@/components/ai/ai-status-banner";
import { aiErrorMessage, postAi } from "@/lib/ai/client-fetch";
import type { MeetingSummaryResult } from "@/services/aiGovernance";
import { saveMeetingSummaryAction, type ActionState } from "../ai/actions";
import { MeetingAlignmentPreview } from "@/components/alignment/meeting-alignment-preview";
import { MeetingAudioUpload } from "@/components/meetings/meeting-audio-upload";

const initial: ActionState = { ok: false };

type SummarizeResponse = {
  ok: true;
  result: MeetingSummaryResult;
};

export function MeetingAiPanel({
  projectId,
  meetingId,
  title,
  notes,
  hasSummary,
}: {
  projectId: string;
  meetingId: string;
  title: string;
  notes: string | null;
  hasSummary: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<MeetingSummaryResult | null>(null);
  const [createDecisions, setCreateDecisions] = useState(true);
  const [createRisks, setCreateRisks] = useState(true);
  const [queueToApproval, setQueueToApproval] = useState(true);
  const [state, formAction, pending] = useActionState(saveMeetingSummaryAction, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  async function generate() {
    if (!notes?.trim()) {
      setError("Add notes or upload a recording before generating a summary.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await postAi<SummarizeResponse>("/api/ai/meetings/summarize", {
      projectId,
      meetingId,
    });

    setLoading(false);

    if (!res.ok) {
      setError(aiErrorMessage(res));
      return;
    }

    setDraft(res.data.result);
  }

  if (state.ok) {
    const delta =
      state.alignmentDelta != null
        ? `${state.alignmentDelta >= 0 ? "+" : ""}${state.alignmentDelta} pts`
        : null;

    return (
      <p className="mt-2 text-xs font-medium text-[#0F766E]">
        Summary saved{hasSummary ? " (updated)" : ""}.
        {state.queuedProposals ? (
          <>
            {" "}
            {state.queuedProposals} proposal(s) queued for approval —{" "}
            <a href="/workspace/proposals" className="underline">
              review queue
            </a>
            .
          </>
        ) : null}
        {state.alignmentScore != null ? (
          <>
            {" "}
            Charter alignment {state.alignmentScore}%
            {delta ? ` (${delta})` : ""}.
          </>
        ) : null}
      </p>
    );
  }

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <MeetingAudioUpload projectId={projectId} meetingId={meetingId} />
      {!draft ? (
        <>
          <button
            type="button"
            disabled={loading || !notes?.trim()}
            onClick={generate}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#0F766E]/30 bg-[#0F766E]/5 px-2.5 py-1.5 text-xs font-medium text-[#0F766E] transition hover:bg-[#0F766E]/10 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles size={12} /> Generate AI summary
              </>
            )}
          </button>
          {error ? (
            <div className="mt-2">
              <AiStatusBanner message={error} />
            </div>
          ) : null}
        </>
      ) : (
        <form action={formAction} className="space-y-3 rounded-lg bg-slate-50 p-3">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="meetingId" value={meetingId} />
          <input type="hidden" name="meetingTitle" value={title} />
          <input type="hidden" name="payload" value={JSON.stringify(draft)} />
          <p className="text-xs font-semibold uppercase text-slate-400">AI preview</p>
          <textarea
            name="summary"
            defaultValue={draft.summary}
            rows={4}
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          />
          {draft.actions.length > 0 ? (
            <div className="text-xs text-slate-600">
              <span className="font-medium">Actions:</span> {draft.actions.join("; ")}
            </div>
          ) : null}
          <MeetingAlignmentPreview
            projectId={projectId}
            meetingId={meetingId}
            meetingContext={draft.summary}
          />
          {draft.proposals && draft.proposals.length > 0 ? (
            <ul className="space-y-1 text-xs text-slate-600">
              {draft.proposals.map((p, i) => (
                <li key={i}>
                  <span className="font-medium capitalize">{p.actionType.replace("_", " ")}:</span>{" "}
                  {p.title}
                </li>
              ))}
            </ul>
          ) : null}
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              name="queueToApproval"
              checked={queueToApproval}
              onChange={(e) => setQueueToApproval(e.target.checked)}
            />
            Queue follow-ups to approval (recommended — nothing auto-applies)
          </label>
          {queueToApproval ? (
            <input type="hidden" name="queueToApproval" value="on" />
          ) : (
            <input type="hidden" name="queueToApproval" value="off" />
          )}
          {!queueToApproval ? (
            <>
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  name="createDecisions"
                  checked={createDecisions}
                  onChange={(e) => setCreateDecisions(e.target.checked)}
                />
                Create {draft.decisions.length} proposed decision(s) immediately
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  name="createRisks"
                  checked={createRisks}
                  onChange={(e) => setCreateRisks(e.target.checked)}
                />
                Create {draft.risks.length} RAID item(s) immediately
              </label>
            </>
          ) : null}
          {state.error ? (
            <p className="text-xs text-red-600">{state.error}</p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-[#0F766E] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
            >
              {pending ? "Saving…" : "Approve & save"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-md px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
            >
              Discard
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
