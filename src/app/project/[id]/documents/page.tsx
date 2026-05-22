import { FileText } from "lucide-react";
import { listDocuments } from "@/services/governance";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DocumentForm } from "./document-form";

type Params = Promise<{ id: string }>;

export default async function ProjectDocumentsPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const documents = await listDocuments(id);

  return (
    <main className="p-6">
      <PageHeader
        title="Documents"
        description="Project document library and references."
        icon={FileText}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {documents.length === 0 ? (
            <EmptyState title="No documents yet" description="Add your first document." />
          ) : (
            documents.map((doc) => (
              <article
                key={doc.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold">{doc.title}</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-600">
                    {doc.doc_type.replace(/_/g, " ")}
                  </span>
                </div>
                {doc.content_text ? (
                  <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-slate-600">
                    {doc.content_text}
                  </p>
                ) : null}
                {doc.file_url ? (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-[#0F766E] hover:underline"
                  >
                    Open file
                  </a>
                ) : null}
              </article>
            ))
          )}
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">New document</h2>
          <DocumentForm projectId={id} />
        </div>
      </div>
    </main>
  );
}
