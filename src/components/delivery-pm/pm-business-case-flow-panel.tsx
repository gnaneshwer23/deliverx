"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Sparkles,
  Upload,
  UserPlus,
} from "lucide-react";
import { DxWidgetHeader } from "@/components/dx/dx-widget-header";
import { dxClass } from "@/lib/dx-theme";
import type { ProjectBusinessCaseStatus } from "@/services/projectBusinessCaseFlow";

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
}: {
  projectId: string;
  projectName: string;
  initialStatus: ProjectBusinessCaseStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [brief, setBrief] = useState("");
  const [baInviteUrl, setBaInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const effectiveInviteUrl = baInviteUrl ?? status.baInviteJoinUrl;

  const copyInvite = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy link — select and copy manually.");
    }
  }, []);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const textLocal = [".txt", ".md", ".csv"];
    const serverExtract = [".pdf", ".docx"];

    if (!textLocal.includes(ext) && !serverExtract.includes(ext)) {
      setError("Upload PDF, DOCX, TXT, MD, or CSV — or paste content directly.");
      return;
    }

    setError(null);

    if (textLocal.includes(ext)) {
      const reader = new FileReader();
      reader.onload = () => {
        setBrief(String(reader.result ?? ""));
      };
      reader.readAsText(file);
      return;
    }

    setExtracting(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/documents/extract-text", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { ok?: boolean; text?: string; error?: string };
      if (!res.ok || !data.text) {
        setError(data.error ?? "Could not extract text from file.");
        return;
      }
      setBrief(data.text);
    } catch {
      setError("Upload failed. Try a smaller file or paste text directly.");
    } finally {
      setExtracting(false);
      event.target.value = "";
    }
  }

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
          return;
        }
        setStatus(data.status);
        if (data.baInviteUrl) setBaInviteUrl(data.baInviteUrl);
        setBrief("");
        router.refresh();
      } catch {
        setError("Upload failed. Try again.");
      }
    });
  }

  function generateBaInvite() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/invites/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, role: "ba" }),
        });
        const data = (await res.json()) as { ok?: boolean; joinUrl?: string; error?: string };
        if (!res.ok || !data.ok || !data.joinUrl) {
          setError(data.error ?? "Could not generate BA invite.");
          return;
        }
        setBaInviteUrl(data.joinUrl);
        setStatus((prev) => ({ ...prev, baInviteActive: true }));
      } catch {
        setError("Could not generate BA invite.");
      }
    });
  }

  return (
    <div className={`${dxClass.card} overflow-hidden p-0`} data-panel="pm-business-case-flow">
      <DxWidgetHeader
        title="Business case & BA onboarding"
        subtitle="Upload your brief, queue AI analysis, and invite your BA to the same project"
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
                ) : status.hasBusinessCase ? (
                  <p className="text-xs text-[#6B6B64]">
                    No proposals queued yet — upload or re-run analysis below.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-[#6B6B64]">
                No business case on this project yet. Paste or upload your brief below to start the
                PM-first flow.
              </p>
            )}
          </section>

          <section className="rounded-lg border border-[var(--dx-rul)] bg-[var(--dx-bas)] p-4">
            <p className={dxClass.panelTitle}>BA workspace</p>
            {status.baMember ? (
              <div className="mt-2 space-y-2">
                <p className="text-sm font-medium text-[#2C2C28]">
                  {status.baMember.name ?? "Business Analyst"} joined
                </p>
                <p className="text-xs text-[#6B6B64]">
                  Joined {new Date(status.baMember.joinedAt).toLocaleDateString()}
                </p>
                <Link
                  href={`/workspace/ba?project=${projectId}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#1C4A2E] hover:underline"
                >
                  View BA workspace summary
                  <ExternalLink size={12} aria-hidden />
                </Link>
              </div>
            ) : effectiveInviteUrl ? (
              <div className="mt-2 space-y-3">
                <p className="text-sm text-[#6B6B64]">
                  Share this link with your BA. They&apos;ll register and land in a workspace built
                  from the same business case.
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
            ) : status.baInviteActive ? (
              <div className="mt-2 space-y-3">
                <p className="text-sm text-[#6B6B64]">
                  A BA invite is active
                  {status.baInviteExpiresAt
                    ? ` until ${new Date(status.baInviteExpiresAt).toLocaleDateString()}`
                    : ""}
                  . Generate a fresh link to copy and share.
                </p>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={generateBaInvite}
                  className={dxClass.btnSm}
                >
                  {isPending ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                  Generate BA invite link
                </button>
              </div>
            ) : (
              <div className="mt-2 space-y-3">
                <p className="text-sm text-[#6B6B64]">
                  Upload a business case to auto-generate a BA invite, or create one manually.
                </p>
                <button
                  type="button"
                  disabled={isPending || !status.hasBusinessCase}
                  onClick={generateBaInvite}
                  className={dxClass.btnSm}
                >
                  {isPending ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                  Generate BA invite link
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="border-t border-[var(--dx-rul)] pt-5">
          <p className={dxClass.label}>Upload or update business case</p>
          <p className="mt-1 text-sm text-[#6B6B64]">
            Paste scope, budget, stakeholders, and success criteria. AI proposals go to the AI
            Review Queue — nothing is applied automatically.
          </p>

          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={6}
            placeholder="Paste your business case or brief…"
            className={`${dxClass.input} mt-3 resize-y`}
          />

          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-[#1C4A2E]">
            <Upload size={14} aria-hidden />
            <span>
              {extracting ? "Extracting document…" : "Upload PDF, DOCX, TXT, MD, or CSV"}
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md,.csv,application/pdf"
              className="sr-only"
              disabled={extracting || isPending}
              onChange={handleFileUpload}
            />
          </label>

          {error ? (
            <p className="mt-3 border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            disabled={isPending || extracting}
            onClick={submitBusinessCase}
            className={`${dxClass.btnPrimary} mt-4 w-full sm:w-auto`}
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Processing…
              </>
            ) : (
              <>
                <Sparkles size={14} aria-hidden />
                Upload &amp; queue AI analysis
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
