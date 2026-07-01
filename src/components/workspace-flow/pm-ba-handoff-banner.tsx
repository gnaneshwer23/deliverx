"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Check, Copy, UserCheck, UserPlus } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";
import type { ProjectBusinessCaseStatus } from "@/services/projectBusinessCaseFlow";

export function PmBaHandoffBanner({
  projectId,
  status,
  inviteUrl,
}: {
  projectId: string;
  status: ProjectBusinessCaseStatus;
  inviteUrl?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const effectiveInviteUrl = inviteUrl ?? status.baInviteJoinUrl;

  const copyInvite = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  if (!status.hasBusinessCase) return null;

  if (status.baMember) {
    return (
      <div
        className="mb-4 flex flex-col gap-3 rounded-lg border border-[#C6DDD0] bg-[#EEF5F1] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        data-banner="ba-joined"
      >
        <div className="flex items-start gap-3">
          <UserCheck size={18} className="mt-0.5 shrink-0 text-[#1A6B3A]" aria-hidden />
          <div>
            <p className="text-sm font-medium text-[#1C4A2E]">
              {status.baMember.name ?? "Business Analyst"} joined the workspace
            </p>
            <p className="mt-0.5 text-xs text-[#6B6B64]">
              Requirements handoff is active — review AI extractions together.
            </p>
          </div>
        </div>
        <Link
          href={`/workspace/ba?project=${projectId}`}
          className={`${dxClass.btnSm} shrink-0 self-start sm:self-center`}
        >
          View BA workspace
        </Link>
      </div>
    );
  }

  if (effectiveInviteUrl || status.baInviteActive) {
    return (
      <div
        id="ba-invite"
        className="mb-4 flex flex-col gap-3 rounded-lg border border-[#F0D4B0] bg-[#FEF6EC] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        data-banner="ba-invite-pending"
      >
        <div className="flex items-start gap-3">
          <UserPlus size={18} className="mt-0.5 shrink-0 text-[#B7620A]" aria-hidden />
          <div>
            <p className="text-sm font-medium text-[#B7620A]">BA invite pending</p>
            <p className="mt-0.5 text-xs text-[#6B6B64]">
              Share the join link so your Business Analyst can review extracted requirements.
            </p>
          </div>
        </div>
        {effectiveInviteUrl ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[280px] sm:flex-row">
            <input
              readOnly
              value={effectiveInviteUrl}
              className={`${dxClass.input} text-xs`}
              aria-label="BA invite link"
            />
            <button
              type="button"
              onClick={() => void copyInvite(effectiveInviteUrl)}
              className={dxClass.btnSm}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        ) : (
          <p className="text-xs text-[#6B6B64]">Generate an invite in the business case panel below.</p>
        )}
      </div>
    );
  }

  return null;
}
