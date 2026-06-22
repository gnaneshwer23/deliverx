"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, GitBranch, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { ExternalTaskLinkRow } from "@/services/githubIntegration";
import { dxClass } from "@/lib/dx-theme";

export function GitHubActivityPanel({
  projectId,
  configured,
  lastSyncAt,
  openPullRequests,
}: {
  projectId: string;
  configured: boolean;
  lastSyncAt: string | null;
  openPullRequests: ExternalTaskLinkRow[];
}) {
  const [syncing, setSyncing] = useState(false);
  const [prs, setPrs] = useState(openPullRequests);

  async function syncNow() {
    setSyncing(true);
    try {
      const res = await fetch(`/api/project/${projectId}/integrations/github/sync`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      setPrs(data.snapshot?.openPullRequests ?? []);
      toast.success("GitHub synced");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className={`${dxClass.card} p-6`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className={`${dxClass.display} flex items-center gap-2 text-lg`}>
          <GitBranch size={18} />
          GitHub activity
        </h3>
        <div className="flex items-center gap-2">
          {lastSyncAt ? (
            <span className="text-xs text-[#A8A89E]">
              Last sync {new Date(lastSyncAt).toLocaleString()}
            </span>
          ) : null}
          <button
            type="button"
            onClick={syncNow}
            disabled={!configured || syncing}
            className={`${dxClass.btnGhost} inline-flex items-center gap-1.5 text-xs`}
          >
            {syncing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Sync
          </button>
        </div>
      </div>

      {!configured ? (
        <p className="text-sm text-[#6B6B64]">
          Connect GitHub in{" "}
          <Link href="/settings/profile" className="font-medium text-[#0F766E] underline">
            Settings
          </Link>{" "}
          — add an org token and map this project to a repository.
        </p>
      ) : prs.length === 0 ? (
        <p className="text-sm text-[#6B6B64]">
          No open pull requests. Run sync to pull the latest from GitHub.
        </p>
      ) : (
        <ul className="space-y-2">
          {prs.map((pr) => (
            <li
              key={pr.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{pr.title ?? `PR #${pr.external_id}`}</p>
                <p className="text-xs text-[#6B6B64]">
                  {pr.status ?? "open"}
                  {typeof pr.metadata.author === "string" ? ` · @${pr.metadata.author}` : ""}
                  {pr.task_id ? " · linked to task" : ""}
                </p>
              </div>
              <a
                href={pr.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#0F766E]"
              >
                View
                <ExternalLink size={12} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
