import Link from "next/link";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { searchWorkspace } from "@/services/search";
import { dxClass } from "@/lib/dx-theme";
import { WorkspaceSearchForm } from "./search-form";

type SearchParams = Promise<{ q?: string }>;

const TYPE_LABEL: Record<string, string> = {
  project: "Project",
  task: "Task",
  raid: "RAID",
  document: "Document",
  memory: "Memory",
};

export default async function WorkspaceSearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchWorkspace(query) : null;

  return (
    <>
      <DxPageHeader breadcrumb="DeliverX · Search" title="Workspace" titleEm="search" />
      <div className="p-6 md:p-8">
        <WorkspaceSearchForm initialQuery={query} />

        {!query ? (
          <p className="mt-6 text-sm text-[#6B6B64]">
            Search projects, tasks, RAID items, documents, and semantic project memory across
            your organisation.
          </p>
        ) : results && results.items.length === 0 ? (
          <p className="mt-6 text-sm text-[#6B6B64]">No results for &ldquo;{query}&rdquo;.</p>
        ) : results ? (
          <ul className="mt-6 space-y-2">
            {results.items.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <Link
                  href={item.href}
                  className={`${dxClass.cardPad} flex items-center justify-between gap-4 transition hover:border-[#1C4A2E]/40`}
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-[#6B6B64]">{item.subtitle}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase text-[#A8A89E]">
                      {TYPE_LABEL[item.type] ?? item.type}
                    </span>
                    {item.similarity != null ? (
                      <span className="font-[family-name:var(--font-dx-mono)] text-[8px] text-[#1C4A2E]">
                        {Math.round(item.similarity * 100)}% match
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );
}
