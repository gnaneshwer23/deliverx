"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { dxClass } from "@/lib/dx-theme";

export function WorkspaceSearchForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    router.push(trimmed ? `/workspace/search?q=${encodeURIComponent(trimmed)}` : "/workspace/search");
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl gap-2">
      <div className="relative flex-1">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A89E]"
        />
        <input
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects, tasks, RAID, documents, memory…"
          className={`${dxClass.input} h-10 pl-9`}
        />
      </div>
      <button type="submit" className={dxClass.btnPrimary}>
        Search
      </button>
    </form>
  );
}
