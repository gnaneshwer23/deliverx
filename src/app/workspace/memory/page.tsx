import Link from "next/link";
import { Brain } from "lucide-react";
import { searchMemory, listMemory, type MemoryRow } from "@/services/memory";
import { SearchForm } from "./search-form";

type Search = Promise<{ q?: string }>;

const TYPE_LABEL: Record<MemoryRow["type"], string> = {
  risk_pattern: "Risk pattern",
  lesson: "Lesson",
  success_pattern: "Success pattern",
  governance: "Governance",
};

const TYPE_TONE: Record<MemoryRow["type"], string> = {
  risk_pattern: "bg-red-50 text-red-700",
  lesson: "bg-amber-50 text-amber-700",
  success_pattern: "bg-emerald-50 text-emerald-700",
  governance: "bg-slate-100 text-slate-700",
};

export default async function MemoryPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { q = "" } = await searchParams;

  const rows = q ? await searchMemory(q) : await listMemory({ limit: 50 });

  return (
    <main className="p-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Brain size={20} className="text-[#0F766E]" /> Organisational Memory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Patterns, lessons, and governance signals distilled from your delivery history.
          </p>
        </div>
        <SearchForm defaultValue={q} />
      </header>

      {rows.length === 0 ? (
        <EmptyState query={q} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <article
              key={row.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-wide ${TYPE_TONE[row.type]}`}
                >
                  {TYPE_LABEL[row.type]}
                </span>
                <span className="text-xs text-slate-400">
                  {Math.round(row.confidence * 100)}%
                </span>
              </div>
              <p className="text-sm text-slate-800">{row.insight}</p>
              {row.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  {row.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function EmptyState({ query }: { query: string }) {
  if (query) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        No memory matched <span className="font-medium">{query}</span> yet.
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
      <p className="font-medium text-slate-700">No memory captured yet.</p>
      <p className="mt-1">
        Open a project and click{" "}
        <span className="font-medium text-[#0F766E]">Extract insights</span> to
        distil signals from delivery into reusable memory.
      </p>
      <Link
        href="/workspace/dashboard"
        className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
      >
        Go to projects
      </Link>
    </div>
  );
}
