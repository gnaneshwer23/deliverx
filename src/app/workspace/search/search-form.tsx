"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function WorkspaceSearchForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    router.push(
      trimmed ? `/workspace/search?q=${encodeURIComponent(trimmed)}` : "/workspace/search",
    );
  }

  return (
    <form onSubmit={onSubmit} className="pw-search-row" role="search">
      <div className="pw-field" style={{ flex: 1 }}>
        <input
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects, tasks, RAID, documents, memory…"
          autoComplete="off"
          aria-label="Search query"
        />
      </div>
      <button type="submit" className="pw-button">
        Search
      </button>
    </form>
  );
}
