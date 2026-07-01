"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Check, Copy, ExternalLink, Loader2, UserPlus } from "lucide-react";
import {
  BusinessCaseUploadZone,
  type UploadProgressStage,
} from "@/components/workspace-flow/business-case-upload-zone";
import { WorkspaceFlowStageBar } from "@/components/workspace-flow/workspace-flow-stage-bar";
import { DxWidgetHeader } from "@/components/dx/dx-widget-header";
import { dxClass } from "@/lib/dx-theme";
import { resolveWorkspaceFlowStage } from "@/lib/workspace-flow-stages";
import type { ProjectBusinessCaseStatus } from "@/services/projectBusinessCaseFlow";
import type { ExtractionSummaryCounts } from "@/lib/workspace-flow-extraction";
import type { OrganisationIndustryInput } from "@/lib/ai/prompts/business-case-industry";
import {
  businessCaseUploadCopy,
  resolveBusinessCaseIndustryKey,
} from "@/lib/ai/prompts/business-case-industry";

function proposalsHref(projectId: string, reviewId?: string | null): string {
  const params = new URLSearchParams({ persona: "pm-mission", project: projectId });
  if (reviewId) params.set("review", reviewId);
  return `/workspace/proposals?${params.toString()}`;
}

function extractionLabel(status: ProjectBusinessCaseStatus["extractionStatus"]): string {
  switch (status) {
    case "queued":
      return "In AI Review Queue";
    case "pending":
      return "Analysis pending";
    case "complete":
      return "Analysis complete";
    default:
      return "Not started";
  }
}

export function PmBusinessCaseFlowPanel({
  projectId,
  projectName,
  initialStatus,
  extractionCounts,
  requirementsExtracted = 0,
  storiesReady = 0,
  elevated = false,
  orgContext,
}: {
  projectId: string;
  projectName: string;
  initialStatus: ProjectBusinessCaseStatus;
  extractionCounts?: ExtractionSummaryCounts;
  requirementsExtracted?: number;
  storiesReady?: number;
  elevated?: boolean;
  orgContext?: OrganisationIndustryInput;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [brief, setBrief] = useState("");
  const [baEmail, setBaEmail] = useState("");
  const [baInviteUrl, setBaInviteUrl] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressStage, setProgressStage] = useState<UploadProgressStage>("idle");
  const [isPending, startTransition] = useTransition();

  const effectiveInviteUrl = baInviteUrl ?? status.baInviteJoinUrl;
  const orgInput = orgContext ?? {};
  const uploadCopy = businessCaseUploadCopy(orgInput);
  const industryKey = resolveBusinessCaseIndustryKey(orgInput);

  const stage = useMemo(
    () =>
      resolveWorkspaceFlowStage({
        hasBusinessCase: status.hasBusinessCase,
        extractionStatus: status.extractionStatus,
        baInviteActive: status.baInviteActive || Boolean(effectiveInviteUrl),
        baJoined: Boolean(status.baMember),
        requirementsExtracted,
        storiesReady,
      }),
    [status, effectiveInviteUrl, requirementsExtracted, storiesReady],
  );

  const copyInvite = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy link — select and copy manually.");
    }
  }, []);

  function submitBusinessCase() {
    const trimmed = brief.trim();
    if (!trimmed && !status.hasBusinessCase) {
      setError("Paste or upload a business case to continue.");
      return;
    }
    if (!trimmed) {
      setError("Add updated business case content before submitting.");
      return;
    }

    setError(null);
    setProgressStage("uploading");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/project/${projectId}/business-case`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: trimmed, title: `${projectName} — business case` }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          status?: ProjectBusinessCaseStatus;
          baInviteUrl?: string | null;
        };
        if (!res.ok || !data.ok || !data.status) {
          setError(data.error ?? "Upload failed.");
          setProgressStage("idle");
          return;
        }
        setStatus(data.status);
        if (data.baInviteUrl) setBaInviteUrl(data.baInviteUrl);
        setBrief("");
        setProgressStage("success");
        router.refresh();

        if (data.status.extractionStatus === "queued" && data.status.pendingReviewId) {
          router.push(proposalsHref(projectId, data.status.pendingReviewId));
        }
      } catch {
        setError("Upload failed. Try again.");
        setProgressStage("idle");
      }
    });
  }

  function generateBaInvite() {
    setError(null);
    setEmailStatus(null);
    const email = baEmail.trim().toLowerCase();
    startTransition(async () => {
      try {
        const res = await fetch("/api/invites/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, role: "ba", email: email || undefined }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          joinUrl?: string;
          emailSent?: boolean;
          emailReason?: string;
          error?: string;
        };
        if (!res.ok || !data.ok || !data.joinUrl) {
          setError(data.error ?? "Could not generate BA invite.");
          return;
        }
        setBaInviteUrl(data.joinUrl);
        setStatus((prev) => ({ ...prev, baInviteActive: true }));
        if (email) {
          setEmailStatus(
            data.emailSent
              ? `Invite emailed to ${email}`
              : data.emailReason
                ? `Link created — email not sent (${data.emailReason})`
                : "Link created — email not configured",
          );
        }
      } catch {
        setError("Could not generate BA invite.");
      }
    });
  }

  return (
    <div
      className={`space-y-4 ${elevated ? "rounded-2xl ring-2 ring-[#1C4A2E]/15" : ""}`}
      data-panel="pm-business-case-flow"
      data-elevated={elevated ? "true" : undefined}
    >
      <WorkspaceFlowStageBar stage={stage} />

      <div className={`${dxClass.card} overflow-hidden p-0`}>
        <DxWidgetHeader
          title={elevated ? "Start here — upload your brief" : "Upload business case"}
          subtitle={
            elevated
              ? `${uploadCopy.industryLabel} brief → invite BA → review in AI Queue — your PM onboarding path`
              : industryKey !== "enterprise"
                ? `${uploadCopy.industryLabel} — AI extracts sector-aware requirements and RAID patterns`
                : "PM-first flow — AI extracts signals, BA invite generated automatically"
          }
        />

        <div className="space-y-5 px-5 py-5 md:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-lg border border-[var(--dx-rul)] bg-[var(--dx-bas)] p-4">
              <p className={dxClass.panelTitle}>Business case status</p>
              {status.hasBusinessCase ? (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium text-[#2C2C28]">Brief on file</p>
                  {status.charterExcerpt ? (
                    <p className="text-xs leading-relaxed text-[#6B6B64]">{status.charterExcerpt}</p>
                  ) : null}
                  <p className="text-xs text-[#6B6B64]">
                    AI Review Queue:{" "}
                    <span className="font-medium text-[#1C4A2E]">
                      {extractionLabel(status.extractionStatus)}
                    </span>
                  </p>
                  {status.pendingReviewId ? (
                    <Link
                      href={proposalsHref(projectId, status.pendingReviewId)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#1C4A2E] hover:underline"
                    >
                      Open in AI Review Queue
                      <ExternalLink size={12} aria-hidden />
                    </Link>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-sm text-[#6B6B64]">
                  No business case yet — upload or paste your brief below.
                </p>
              )}
            </section>

            <section
              id="ba-invite"
              className="rounded-lg border border-[var(--dx-rul)] bg-[var(--dx-bas)] p-4"
            >
              <p className={dxClass.panelTitle}>BA workspace</p>
              {status.baMember ? (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium text-[#2C2C28]">
                    {status.baMember.name ?? "Business Analyst"} joined
                  </p>
                  <Link
                    href={`/workspace/ba?project=${projectId}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#1C4A2E] hover:underline"
                  >
                    View BA workspace
                    <ExternalLink size={12} aria-hidden />
                  </Link>
                </div>
              ) : effectiveInviteUrl ? (
                <div className="mt-2 space-y-3">
                  <p className="text-sm text-[#6B6B64]">
                    Share this link with your BA — they&apos;ll land in a workspace built from this
                    business case.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      readOnly
                      value={effectiveInviteUrl}
                      className={`${dxClass.input} text-xs`}
                      aria-label="BA invite link"
                    />
                    <button
                      type="button"
                      onClick={() => void copyInvite(effectiveInviteUrl)}
                      className={dxClass.btnGhost}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 space-y-3">
                  <p className="text-sm text-[#6B6B64]">
                    Upload a business case to auto-generate a BA invite, or create one manually.
                  </p>
                  <input
                    type="email"
                    placeholder="BA email (optional)"
                    value={baEmail}
                    onChange={(e) => setBaEmail(e.target.value)}
                    className={`${dxClass.input} text-xs`}
                    aria-label="BA invite email"
                  />
                  <button
                    type="button"
                    disabled={isPending || !status.hasBusinessCase}
                    onClick={generateBaInvite}
                    className={dxClass.btnSm}
                  >
                    {isPending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <UserPlus size={12} aria-hidden />
                    )}
                    {baEmail.trim() ? "Send BA invite" : "Generate BA invite link"}
                  </button>
                  {emailStatus ? (
                    <p className="text-xs text-[#6B6B64]">{emailStatus}</p>
                  ) : null}
                </div>
              )}
            </section>
          </div>

          {extractionCounts ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(
                [
                  ["Requirements", extractionCounts.requirements],
                  ["Gaps", extractionCounts.gaps],
                  ["Objectives", extractionCounts.objectives],
                  ["Traceability", extractionCounts.traceability],
                  ["Risks", extractionCounts.risks],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-[var(--dx-rul)] bg-white px-2 py-2 text-center"
                >
                  <p className={dxClass.panelTitle}>{label}</p>
                  <p className={`${dxClass.display} mt-1 text-lg text-[#0D0D0B]`}>
                    {value == null ? "—" : label === "Traceability" ? `${value}%` : value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          <BusinessCaseUploadZone
            brief={brief}
            onBriefChange={setBrief}
            onSubmit={submitBusinessCase}
            disabled={isPending}
            progressStage={progressStage}
            error={error}
            orgContext={orgContext}
          />
        </div>
      </div>
    </div>
  );
}
