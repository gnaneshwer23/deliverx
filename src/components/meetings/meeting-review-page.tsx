"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Check, Loader2, Mic, Pencil, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { MeetingFlowBreadcrumb } from "@/components/meetings/meeting-flow-breadcrumb";
import { pmTasksKanbanUrl } from "@/lib/meeting-flow";
import type { SpeakerTranscriptBlock } from "@/lib/meeting-review";
import type { ProposedActionRow } from "@/services/proposedActions";

export function MeetingReviewPage({
  projectId,
  meetingId,
  meetingTitle,
  scheduledAt,
  ceremonyType,
  speakerBlocks,
  executiveDigest,
  proposals,
}: {
  projectId: string;
  meetingId: string;
  meetingTitle: string;
  scheduledAt: string | null;
  ceremonyType: string;
  speakerBlocks: SpeakerTranscriptBlock[];
  executiveDigest: string;
  proposals: ProposedActionRow[];
}) {
  const router = useRouter();
  const [isBatchPending, startBatchTransition] = useTransition();
  const [batchError, setBatchError] = useState<string | null>(null);
  const pendingCount = proposals.length;

  const scheduledLabel = useMemo(() => {
    if (!scheduledAt) return null;
    try {
      return new Date(scheduledAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  }, [scheduledAt]);

  function approveAll() {
    if (pendingCount === 0) return;
    setBatchError(null);
    startBatchTransition(async () => {
      let applied = 0;
      for (const proposal of proposals) {
        try {
          const res = await fetch("/api/proposals/resolve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: proposal.id, action: "approve_and_apply" }),
          });
          const payload = (await res.json()) as { ok?: boolean; error?: string };
          if (!res.ok || !payload.ok) {
            setBatchError(payload.error ?? "Could not approve all proposals");
            router.refresh();
            return;
          }
          applied += 1;
        } catch {
          setBatchError("Could not reach the server");
          router.refresh();
          return;
        }
      }

      toast.success(`Approved ${applied} meeting action${applied === 1 ? "" : "s"}`, {
        description: "Tasks and RAID updates are now on the board.",
        action: {
          label: "Open kanban",
          onClick: () => router.push(pmTasksKanbanUrl(projectId)),
        },
      });
      router.refresh();
    });
  }

  return (
    <main className="p-6" data-testid="meeting-review-page">
      <Link
        href={`/project/${projectId}/meetings`}
        className="text-sm font-medium text-[#1C4A2E] hover:underline"
      >
        ← Back to meetings
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">
            Meeting review
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#2C2C28]">{meetingTitle}</h1>
          <p className="mt-1 text-sm text-[#6B6B64]">
            {ceremonyType}
            {scheduledLabel ? ` · ${scheduledLabel}` : ""}
          </p>
        </div>
        <Link
          href={`/workspace/proposals?project=${projectId}`}
          className="text-xs font-medium text-[#1C4A2E] hover:underline"
        >
          Full proposal queue →
        </Link>
      </div>

      <MeetingFlowBreadcrumb currentStep="actions" className="mt-6" />

      <section className="mt-6 rounded-2xl border border-[#E4E4DC] bg-white p-5 shadow-sm">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[#2C2C28]">Speaker transcript</h2>
            <p className="text-xs text-[#6B6B64]">
              Per-speaker blocks extracted from the meeting recording or paste.
            </p>
          </div>
          <span className="rounded-full bg-[#EEF5F1] px-2.5 py-0.5 text-[10px] font-medium text-[#1C4A2E]">
            {speakerBlocks.length} speaker{speakerBlocks.length === 1 ? "" : "s"}
          </span>
        </header>

        {speakerBlocks.length === 0 ? (
          <p className="text-sm text-[#6B6B64]">No speaker-labelled transcript is available yet.</p>
        ) : (
          <ul className="space-y-3">
            {speakerBlocks.map((block) => (
              <li
                key={block.speaker}
                className="rounded-xl border border-[#E4E4DC] bg-[#FAFAF7] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#2C2C28]">
                    <Mic size={14} className="text-[#1C4A2E]" />
                    {block.speaker}
                  </span>
                  {block.targetRole ? (
                    <span className="rounded bg-white px-2 py-0.5 text-[10px] font-medium uppercase text-[#6B6B64]">
                      {block.targetRole}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 space-y-1.5">
                  {block.lines.map((line, index) => (
                    <p key={`${block.speaker}-${index}`} className="text-sm text-[#2C2C28]">
                      {line}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-[#E4E4DC] bg-white p-5 shadow-sm">
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#2C2C28]">Tasks to distribute</h2>
            <p className="text-xs text-[#6B6B64]">
              AI suggests — you approve, edit, or remove before anything hits the board.
            </p>
          </div>
          {pendingCount > 0 ? (
            <button
              type="button"
              disabled={isBatchPending}
              onClick={approveAll}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C4A2E] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#163d26] disabled:opacity-60"
            >
              {isBatchPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              Approve all ({pendingCount})
            </button>
          ) : null}
        </header>

        {batchError ? <p className="mb-3 text-xs text-rose-600">{batchError}</p> : null}

        {pendingCount === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E4E4DC] bg-[#FAFAF7] px-4 py-6 text-center">
            <p className="text-sm font-medium text-[#2C2C28]">All meeting actions reviewed</p>
            <p className="mt-1 text-xs text-[#6B6B64]">
              Nothing pending for this meeting. Head to kanban to track distributed work.
            </p>
            <Link
              href={pmTasksKanbanUrl(projectId)}
              className="mt-3 inline-flex text-xs font-medium text-[#1C4A2E] hover:underline"
            >
              Open tasks kanban →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {proposals.map((proposal) => (
              <MeetingProposalReviewRow
                key={proposal.id}
                projectId={projectId}
                proposal={proposal}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-[#E4E4DC] bg-[#FAFAF7] p-5 shadow-sm">
        <header className="mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-[#1C4A2E]" />
          <div>
            <h2 className="text-sm font-semibold text-[#2C2C28]">Executive digest</h2>
            <p className="text-xs text-[#6B6B64]">Read-only sponsor summary for this meeting.</p>
          </div>
        </header>
        {executiveDigest ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#2C2C28]">
            {executiveDigest}
          </p>
        ) : (
          <p className="text-sm text-[#6B6B64]">
            No executive summary yet — run meeting intel or add a summary on the meetings page.
          </p>
        )}
      </section>
    </main>
  );
}

function MeetingProposalReviewRow({
  projectId,
  proposal,
}: {
  projectId: string;
  proposal: ProposedActionRow;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(proposal.title);
  const [summary, setSummary] = useState(proposal.summary);
  const assigneeRole = proposal.payload.assigneeRole
    ? String(proposal.payload.assigneeRole)
    : null;
  const speaker = proposal.payload.speaker ? String(proposal.payload.speaker) : null;

  function resolve(action: "approve_and_apply" | "reject" | "update") {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/proposals/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: proposal.id,
            action,
            title: action === "update" || action === "approve_and_apply" ? title : undefined,
            summary: action === "update" || action === "approve_and_apply" ? summary : undefined,
          }),
        });
        const payload = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !payload.ok) {
          setError(payload.error ?? "Could not update proposal");
          return;
        }

        if (action === "update") {
          setIsEditing(false);
          toast.success("Proposal updated");
          router.refresh();
          return;
        }

        if (action === "approve_and_apply") {
          toast.success("Meeting action applied", {
            action: {
              label: "Open kanban",
              onClick: () => router.push(pmTasksKanbanUrl(projectId)),
            },
          });
        }

        router.refresh();
      } catch {
        setError("Could not reach the server");
      }
    });
  }

  return (
    <li className="rounded-xl border border-[#E4E4DC] bg-[#FAFAF7] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-[#EEF5F1] px-1.5 py-0.5 text-[10px] font-medium uppercase text-[#1C4A2E]">
          {proposal.action_type.replace("create_", "")}
        </span>
        {speaker ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-[#6B6B64]">
            <Mic size={10} /> {speaker}
          </span>
        ) : null}
        {assigneeRole ? (
          <span className="text-[10px] text-[#6B6B64]">→ {assigneeRole}</span>
        ) : null}
      </div>

      {isEditing ? (
        <div className="mt-3 space-y-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-md border border-[#E4E4DC] bg-white px-2.5 py-1.5 text-sm"
          />
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={3}
            className="w-full rounded-md border border-[#E4E4DC] bg-white px-2.5 py-1.5 text-sm"
          />
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm font-medium text-[#2C2C28]">{title}</p>
          {summary ? (
            <p className="mt-1 text-xs leading-relaxed text-[#6B6B64]">{summary}</p>
          ) : null}
        </>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {isEditing ? (
          <>
            <button
              type="button"
              disabled={isPending || !title.trim()}
              onClick={() => resolve("update")}
              className="inline-flex items-center gap-1 rounded bg-[#1C4A2E] px-2.5 py-1 text-[10px] font-medium text-white hover:bg-[#163d26] disabled:opacity-60"
            >
              {isPending ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
              Save edit
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setTitle(proposal.title);
                setSummary(proposal.summary);
                setIsEditing(false);
              }}
              className="inline-flex items-center gap-1 rounded border border-[#E4E4DC] bg-white px-2.5 py-1 text-[10px] font-medium text-[#6B6B64] hover:bg-[#FAFAF7] disabled:opacity-60"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={() => resolve("approve_and_apply")}
              className="inline-flex items-center gap-1 rounded bg-[#1C4A2E] px-2.5 py-1 text-[10px] font-medium text-white hover:bg-[#163d26] disabled:opacity-60"
            >
              {isPending ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
              Approve
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1 rounded border border-[#E4E4DC] bg-white px-2.5 py-1 text-[10px] font-medium text-[#2C2C28] hover:bg-white disabled:opacity-60"
            >
              <Pencil size={10} />
              Edit
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => resolve("reject")}
              className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
            >
              <X size={10} />
              Remove
            </button>
          </>
        )}
      </div>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </li>
  );
}
