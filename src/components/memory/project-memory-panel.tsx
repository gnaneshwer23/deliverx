"use client";

import { useState, useTransition } from "react";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import type { ProjectMemoryHit } from "@/services/projectMemoryRag";
import { dxClass } from "@/lib/dx-theme";

export function ProjectMemoryPanel({
  projectId,
  initialStats,
}: {
  projectId?: string;
  initialStats?: { totalChunks: number; bySource: Record<string, number> };
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProjectMemoryHit[]>([]);
  const [stats, setStats] = useState(initialStats);
  const [isPending, startTransition] = useTransition();
  const [syncing, setSyncing] = useState(false);

  function runSearch() {
    if (!projectId) return;
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/project/${projectId}/memory/search?q=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Search failed");
        setResults(data.results ?? []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Search failed");
      }
    });
  }

  async function syncMemory() {
    if (!projectId) return;
    setSyncing(true);
    try {
      const res = await fetch(`/api/project/${projectId}/memory/sync`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      if (data.skipped) {
        toast.message("Set OPENAI_API_KEY to enable semantic memory sync");
      } else {
        toast.success(`Indexed ${data.chunks} memory chunk${data.chunks === 1 ? "" : "s"}`);
        setStats({
          totalChunks: data.chunks,
          bySource: stats?.bySource ?? {},
        });
      }
      if (query.trim()) runSearch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  if (!projectId) {
    return (
      <div className={`${dxClass.card} p-6 text-sm text-[#6B6B64]`}>
        Select a project to search delivery memory.
      </div>
    );
  }

  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E4DC] px-6 py-4">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Project memory (RAG)</h3>
          <p className="text-sm text-[#6B6B64]">
            Have we done this before? Search requirements, meetings, decisions, and lessons.
          </p>
        </div>
        <button
          type="button"
          onClick={syncMemory}
          disabled={syncing}
          className={`${dxClass.btnGhost} inline-flex items-center gap-2 text-[10px]`}
        >
          {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          {syncing ? "Indexing…" : "Sync memory"}
        </button>
      </div>

      <div className="space-y-4 p-6">
        <div className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch();
            }}
            placeholder="e.g. payment integration risk, UAT sign-off…"
            className="flex-1 border border-[#E4E4DC] bg-[#FAFAF5] px-3 py-2 text-sm outline-none focus:border-[#1C4A2E]"
          />
          <button
            type="button"
            onClick={runSearch}
            disabled={isPending}
            className={`${dxClass.btnPrimary} inline-flex items-center gap-2 text-[10px]`}
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
            Search
          </button>
        </div>

        {stats && stats.totalChunks > 0 ? (
          <p className="text-xs text-[#A8A89E]">
            {stats.totalChunks} indexed chunk{stats.totalChunks === 1 ? "" : "s"} in project memory
          </p>
        ) : (
          <p className="text-xs text-[#A8A89E]">
            No indexed memory yet — sync to embed business case, requirements, and meetings.
          </p>
        )}

        <ul className="space-y-3">
          {results.length === 0 ? (
            <li className="text-sm text-[#6B6B64]">
              {query.trim()
                ? "No matches — try syncing memory or broadening your query."
                : "Run a search to retrieve similar past context."}
            </li>
          ) : (
            results.map((hit) => (
              <li
                key={hit.id}
                className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF5] p-4 text-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-[#1C4A2E]">
                  {hit.sourceType}
                  {hit.similarity != null
                    ? ` · ${Math.round(hit.similarity * 100)}% match`
                    : ""}
                </p>
                {hit.title ? <p className="mt-1 font-medium text-[#2C2C28]">{hit.title}</p> : null}
                <p className="mt-2 line-clamp-4 text-[#6B6B64]">{hit.content}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
