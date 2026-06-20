import Link from "next/link";
import { listOrgDocuments } from "@/services/governance";
import { OrgListPage, OrgListTable, projectLink } from "@/components/workspace/org-list-shell";

export const dynamic = "force-dynamic";

export default async function WorkspaceDocumentsPage() {
  const documents = await listOrgDocuments(200);

  const rows = documents.map((doc) => [
    projectLink(doc.project_id, doc.project_name),
    <Link
      key="title"
      href={`/project/${doc.project_id}/documents`}
      className="font-medium text-[#0D0D0B] hover:text-[#1C4A2E] hover:underline"
    >
      {doc.title}
    </Link>,
    <span key="type" className="capitalize">
      {doc.doc_type.replace(/_/g, " ")}
    </span>,
    doc.file_url ? (
      <a
        key="file"
        href={doc.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#1C4A2E] hover:underline"
      >
        Open file
      </a>
    ) : (
      "Text only"
    ),
    new Date(doc.created_at).toLocaleDateString(),
  ]);

  return (
    <OrgListPage
      breadcrumb="DeliverX · Intelligence"
      title="Documents"
      titleEm="library"
      stats={[{ label: "Total documents", value: documents.length }]}
      empty={
        rows.length === 0
          ? {
              title: "No documents uploaded",
              description: "Upload charters, business cases, and delivery artefacts from a project.",
              href: "/workspace/projects",
              actionLabel: "View projects",
            }
          : undefined
      }
    >
      <OrgListTable headers={["Project", "Document", "Type", "File", "Uploaded"]} rows={rows} />
    </OrgListPage>
  );
}
