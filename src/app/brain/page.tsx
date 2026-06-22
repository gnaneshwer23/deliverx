import Link from "next/link";
import { BrainCircuit, Upload } from "lucide-react";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";
import { formatHonestKpi } from "@/lib/honest-kpi";
import {
  countBrainDocumentsByStatus,
  listBrainDocuments,
} from "@/services/brainDocumentService";
import { listPlaybooks } from "@/services/playbookService";

export const dynamic = "force-dynamic";

const STATUS_TILES = [
  { key: "pending" as const, label: "Pending ingest", hint: "Upload documents to begin" },
  { key: "review" as const, label: "Awaiting review", hint: "Classifications need human review" },
  { key: "classified" as const, label: "Classified", hint: "Approved and ready for playbooks" },
  { key: "archived" as const, label: "Archived", hint: "Retired from active use" },
];

export default async function BrainStudioPage() {
  const [documents, playbooks] = await Promise.all([
    listBrainDocuments().catch(() => []),
    listPlaybooks().catch(() => []),
  ]);

  const counts = countBrainDocumentsByStatus(documents);
  const hasData = documents.length > 0 || playbooks.length > 0;

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX · Delivery Brain"
        title="Brain"
        titleEm="Studio"
      />
      <div className="space-y-6 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-2xl text-sm text-[#6B6B64]">
            Capture delivery knowledge, classify documents, and build playbooks. AI suggestions
            always land in the review queue — nothing is auto-applied.
          </p>
          <Link href="/brain/ingest" className={dxClass.btnPrimary}>
            <Upload size={14} />
            Ingest documents
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATUS_TILES.map((tile) => {
            const kpi = formatHonestKpi(
              hasData ? counts[tile.key] : null,
              tile.hint,
            );
            return (
              <div key={tile.key} className={`${dxClass.cardPad}`}>
                <p className={dxClass.panelTitle}>{tile.label}</p>
                <p className="mt-2 font-[family-name:var(--font-dx-display)] text-3xl text-[#0D0D0B]">
                  {kpi.value}
                </p>
                {kpi.hint ? (
                  <p className="mt-1 text-xs text-[#6B6B64]">{kpi.hint}</p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className={`${dxClass.cardPad}`}>
            <div className="mb-4 flex items-center gap-2">
              <BrainCircuit size={18} className="text-[#1C4A2E]" />
              <h2 className="font-semibold">Recent documents</h2>
            </div>
            {documents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#E4E4DC] bg-[#FAFAF7] px-6 py-10 text-center">
                <p className="text-sm text-[#6B6B64]">No documents ingested yet.</p>
                <Link href="/brain/ingest" className={`${dxClass.btnSm} mt-4 inline-flex`}>
                  Upload your first document
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[#F0F0E8]">
                {documents.slice(0, 8).map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between py-3 text-sm">
                    <span className="font-medium">{doc.title}</span>
                    <span className={dxClass.caps}>{doc.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={`${dxClass.cardPad}`}>
            <h2 className="mb-4 font-semibold">Playbooks</h2>
            {playbooks.length === 0 ? (
              <p className="text-sm text-[#6B6B64]">
                Playbooks will appear here after documents are reviewed and approved.
              </p>
            ) : (
              <ul className="divide-y divide-[#F0F0E8]">
                {playbooks.slice(0, 8).map((pb) => (
                  <li key={pb.id} className="py-3 text-sm font-medium">
                    {pb.name}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
