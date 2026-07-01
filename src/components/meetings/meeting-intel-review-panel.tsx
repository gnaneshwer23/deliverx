"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Loader2, Mic, X } from "lucide-react";
import { toast } from "sonner";
import type { ProposedActionRow } from "@/services/proposedActions";
import {
  groupMeetingProposalSummaries,
  MEETING_INTEL_REVIEW_ANCHOR,
  pmTasksKanbanUrl,
} from "@/lib/meeting-flow";
import { MeetingFlowBreadcrumb } from "@/components/meetings/meeting-flow-breadcrumb";

export function MeetingIntelReviewPanel({
  projectId,
  proposals,
  highlightReview = false,
}: {
  projectId: string;
  proposals: ProposedActionRow[];
  highlightReview?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!highlightReview) return;
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [highlightReview]);

  if (proposals.length === 0) return null;

  const groups = groupMeetingProposalSummaries(proposals);
  const hasGroupedSummary =
    groups.decisions.length > 0 || groups.actions.length > 0 || groups.risks.length > 0;

  return (
    <section
      ref={sectionRef}
      id={MEETING_INTEL_REVIEW_ANCHOR}
      className={`rounded-2xl border bg-white p-5 shadow-sm ${
        highlightReview
          ? "border-[#1C4A2E] ring-2 ring-[#C6DDD0]"
          : "border-[#E4E4DC]"
      }`}
    >
      <MeetingFlowBreadcrumb currentStep="actions" className="mb-4 border-0 bg-[#FAFAF7] p-3 shadow-none" />

      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#2C2C28]">Meeting intel review</h3>
          <p className="text-xs text-[#6B6B64]">
            Approve per-speaker extractions to distribute tasks and update RAID.
          </p>
        </div>
        <Link
          href={`/workspace/proposals?project=${projectId}`}
          className="text-xs font-medium text-[#1C4A2E] hover:underline"
        >
          Full queue →
        </Link>
      </div>

      {hasGroupedSummary ? (
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <ProposalGroupCard title="Decisions" items={groups.decisions} />
          <ProposalGroupCard title="Actions" items={groups.actions} />
          <ProposalGroupCard title="Risks" items={groups.risks} />
        </div>
      ) : null}

      <ul className="space-y-2">
        {proposals.slice(0, 5).map((proposal) => (
          <MeetingProposalRow key={proposal.id} projectId={projectId} proposal={proposal} />
        ))}
      </ul>
    </section>
  );
}

function ProposalGroupCard({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B6B64]">
        {title} · {items.length}
      </p>
      <ul className="mt-1 space-y-0.5">
        {items.slice(0, 3).map((item) => (
          <li key={item} className="truncate text-xs text-[#2C2C28]">
            {item}
          </li>
        ))}
        {items.length > 3 ? (
          <li className="text-[10px] text-[#6B6B64]">+{items.length - 3} more</li>
        ) : null}
      </ul>
    </div>
  );
}

function MeetingProposalRow({
  projectId,
  proposal,
}: {
  projectId: string;
  proposal: ProposedActionRow;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const assigneeRole = proposal.payload.assigneeRole
    ? String(proposal.payload.assigneeRole)
    : null;
  const speaker = proposal.payload.speaker ? String(proposal.payload.speaker) : null;

  function resolve(action: "approve_and_apply" | "reject") {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/proposals/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: proposal.id, action }),
        });
        const payload = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !payload.ok) {
          setError(payload.error ?? "Could not update proposal");
          return;
        }

        if (action === "approve_and_apply") {
          const tasksUrl = pmTasksKanbanUrl(projectId);
          toast.success("Meeting actions applied — tasks updated", {
            description: "View new tasks on the kanban board.",
            action: {
              label: "Open kanban",
              onClick: () => router.push(tasksUrl),
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
    <li className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] p-3">
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
      <p className="mt-1 text-sm font-medium text-[#2C2C28]">{proposal.title}</p>
      {proposal.summary ? (
        <p className="mt-0.5 line-clamp-2 text-xs text-[#6B6B64]">{proposal.summary}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => resolve("approve_and_apply")}
          className="inline-flex items-center gap-1 rounded bg-[#1C4A2E] px-2.5 py-1 text-[10px] font-medium text-white hover:bg-[#163d26] disabled:opacity-60"
        >
          {isPending ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
          Approve & distribute
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => resolve("reject")}
          className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
        >
          <X size={10} />
          Reject
        </button>
      </div>
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </li>
  );
}
