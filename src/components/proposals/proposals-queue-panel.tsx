"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Check, ExternalLink, Loader2, X } from "lucide-react";
import {
  ACTION_TYPE_LABELS,
  type ProposalActionType,
} from "@/services/proposedActionEngine";
import type { ProposedActionRow } from "@/services/proposedActions";

const TYPE_ICON: Partial<Record<ProposalActionType, typeof Calendar>> = {
  calendar_event: Calendar,
};

function formatWhen(iso: string | undefined): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

function ProposalRow({
  proposal,
  showProject = false,
}: {
  proposal: ProposedActionRow & { project_name?: string };
  showProject?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(
    proposal.apply_result,
  );
  const [isPending, startTransition] = useTransition();

  function resolve(action: "approve" | "reject") {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/proposals/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: proposal.id,
            action: action === "approve" ? "approve_and_apply" : "reject",
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          proposal?: ProposedActionRow;
        };
        if (!res.ok || !data.ok) {
          setError(data.error ?? "Action failed");
          return;
        }
        if (data.proposal?.apply_result) {
          setResult(data.proposal.apply_result);
        }
        router.refresh();
      } catch {
        setError("Could not reach the server");
      }
    });
  }

  const Icon = TYPE_ICON[proposal.action_type];
  const when = formatWhen(String(proposal.payload.scheduledAt ?? ""));
  const calendarUrl =
    result?.calendarUrl && typeof result.calendarUrl === "string"
      ? result.calendarUrl
      : null;
  const outlookCalendarUrl =
    result?.outlookCalendarUrl && typeof result.outlookCalendarUrl === "string"
      ? result.outlookCalendarUrl
      : null;

  return (
    <li className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            {Icon ? <Icon size={12} /> : null}
            {ACTION_TYPE_LABELS[proposal.action_type]}
          </p>
          <p className="mt-1 font-medium text-slate-900">{proposal.title}</p>
          {showProject && proposal.project_name ? (
            <Link
              href={`/project/${proposal.project_id}`}
              className="text-sm text-teal-700 hover:underline"
            >
              {proposal.project_name}
            </Link>
          ) : null}
          <p className="mt-1 text-sm text-slate-600">{proposal.summary}</p>
          {when ? (
            <p className="mt-1 text-xs text-slate-500">Scheduled: {when}</p>
          ) : null}
        </div>
        {proposal.status === "pending" ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => resolve("approve")}
              className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              Approve & apply
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => resolve("reject")}
              className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
            >
              <X size={12} />
              Reject
            </button>
          </div>
        ) : (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-700">
            {proposal.status}
          </span>
        )}
      </div>
      {calendarUrl || outlookCalendarUrl ? (
        <div className="mt-3 flex flex-wrap gap-3">
          {calendarUrl ? (
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900"
            >
              Google Calendar
              <ExternalLink size={12} />
            </a>
          ) : null}
          {outlookCalendarUrl ? (
            <a
              href={outlookCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900"
            >
              Outlook Calendar
              <ExternalLink size={12} />
            </a>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </li>
  );
}

export function ProposalsQueuePanel({
  proposals,
  showProject = true,
  emptyMessage = "No pending proposals. Generate a meeting summary to queue follow-ups.",
}: {
  proposals: (ProposedActionRow & { project_name?: string })[];
  showProject?: boolean;
  emptyMessage?: string;
}) {
  if (proposals.length === 0) {
    return (
      <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">{emptyMessage}</p>
    );
  }

  return (
    <ul className="space-y-3">
      {proposals.map((p) => (
        <ProposalRow key={p.id} proposal={p} showProject={showProject} />
      ))}
    </ul>
  );
}
