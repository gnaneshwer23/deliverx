import Link from "next/link";
import { searchWorkspace } from "@/services/search";
import { WorkspaceSearchForm } from "./search-form";
import {
  WorkspacePageHeader,
  WorkspaceProductShell,
} from "@/components/professional-workspace/workspace-product-shell";

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
    <WorkspaceProductShell
      aside={
        <>
          <section>
            <h2>What this searches</h2>
            <p style={{ marginTop: 8 }}>
              Projects, tasks, RAID items, documents, and semantic project memory across your
              organisation.
            </p>
          </section>
          <section>
            <h2>Related</h2>
            <ul className="pw-link-list" style={{ listStyle: "none", padding: 0 }}>
              <li>
                <Link href="/help">Suite help &amp; Cmd/Ctrl+K</Link>
              </li>
              <li>
                <Link href="/workspace">Workspace home</Link>
              </li>
            </ul>
          </section>
        </>
      }
    >
      <WorkspacePageHeader
        eyebrow="Professional Workspace · Search"
        title="Workspace search"
        lead="Find delivery artefacts and memory in your organisation. Suite-wide Cmd/Ctrl+K remains available from the top bar."
      />

      <WorkspaceSearchForm initialQuery={query} />

      {!query ? (
        <p className="pw-lead" style={{ marginTop: 20 }}>
          Enter a query to search projects, tasks, RAID, documents, and memory.
        </p>
      ) : results && results.items.length === 0 ? (
        <div className="pw-empty" role="status" style={{ marginTop: 20 }}>
          <strong>No results</strong>
          Nothing matched &ldquo;{query}&rdquo;.
        </div>
      ) : results ? (
        <ul className="pw-module-grid" style={{ listStyle: "none", padding: 0, marginTop: 20 }}>
          {results.items.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <Link href={item.href} className="pw-module">
                <span className="kind">{TYPE_LABEL[item.type] ?? item.type}</span>
                <strong>{item.title}</strong>
                <p>{item.subtitle}</p>
                {item.similarity != null ? (
                  <span className="meta">{Math.round(item.similarity * 100)}% lexical match</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </WorkspaceProductShell>
  );
}
