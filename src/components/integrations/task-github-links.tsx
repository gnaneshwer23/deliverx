"use client";

import { useState } from "react";
import { ExternalLink, GitBranch, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ExternalTaskLinkRow } from "@/services/githubIntegration";

export function TaskGitHubLinks({
  projectId,
  taskId,
  links,
}: {
  projectId: string;
  taskId: string;
  links: ExternalTaskLinkRow[];
}) {
  const [items, setItems] = useState(links);
  const [prUrl, setPrUrl] = useState("");
  const [linking, setLinking] = useState(false);

  async function linkPr(e: React.FormEvent) {
    e.preventDefault();
    if (!prUrl.trim()) return;
    setLinking(true);
    try {
      const res = await fetch(
        `/api/project/${projectId}/tasks/${taskId}/github/link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prUrl: prUrl.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Link failed");
      setItems((prev) => {
        const next = data.link as ExternalTaskLinkRow;
        const exists = prev.some((l) => l.id === next.id);
        return exists ? prev.map((l) => (l.id === next.id ? next : l)) : [next, ...prev];
      });
      setPrUrl("");
      toast.success("Pull request linked");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Link failed");
    } finally {
      setLinking(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
        <GitBranch size={18} />
        GitHub links
      </h3>

      {items.length > 0 ? (
        <ul className="mb-4 space-y-2">
          {items.map((link) => (
            <li key={link.id}>
              <a
                href={link.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#0F766E] hover:underline"
              >
                {link.title ?? `PR #${link.external_id}`}
                <ExternalLink size={14} />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-slate-500">No linked pull requests yet.</p>
      )}

      <form onSubmit={linkPr} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={prUrl}
          onChange={(e) => setPrUrl(e.target.value)}
          placeholder="https://github.com/org/repo/pull/123"
          className="h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm"
        />
        <button
          type="submit"
          disabled={linking || !prUrl.trim()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
        >
          {linking ? <Loader2 size={14} className="animate-spin" /> : null}
          Link PR
        </button>
      </form>
    </div>
  );
}
