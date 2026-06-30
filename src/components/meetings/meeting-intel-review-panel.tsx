"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Loader2, Mic, X } from "lucide-react";
import type { ProposedActionRow } from "@/services/proposedActions";

export function MeetingIntelReviewPanel({
  projectId,
  proposals,
}: {
  projectId: string;
  proposals: ProposedActionRow[];
}) {
  if (proposals.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#E4E4DC] bg-white p-5 shadow-sm">
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
      <ul className="space-y-2">
        {proposals.slice(0, 5).map((proposal) => (
          <MeetingProposalRow key={proposal.id} proposal={proposal} />
        ))}
      </ul>
    </section>
  );
}

function MeetingProposalRow({ proposal }: { proposal: ProposedActionRow }) {
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
