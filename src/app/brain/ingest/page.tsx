import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { BrainIngestWorkspace } from "@/components/brain/brain-ingest-workspace";
import { dxClass } from "@/lib/dx-theme";
import { listBrainDocumentsByStatus } from "@/services/brainDocumentService";
import { getBrainIngestHealth } from "@/services/brainIngestService";

export const dynamic = "force-dynamic";

export default async function BrainIngestPage() {
  const [reviewQueue, health] = await Promise.all([
    listBrainDocumentsByStatus("review").catch(() => []),
    Promise.resolve(getBrainIngestHealth()),
  ]);

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX · Delivery Brain · Ingest"
        title="Document"
        titleEm="ingest"
      />
      <div className="space-y-6 p-6 md:p-8">
        <Link
          href="/brain"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B6B64] hover:text-[#1C4A2E]"
        >
          <ArrowLeft size={14} />
          Back to Brain Studio
        </Link>

        {!health.storageConfigured ? (
          <p className={`${dxClass.cardPad} text-sm text-[#6B6B64]`}>
            Brain ingest storage is not configured in this environment. Upload is disabled until
            Supabase storage and migration 0060 are applied.
          </p>
        ) : null}

        <BrainIngestWorkspace reviewQueue={reviewQueue} health={health} />
      </div>
    </>
  );
}
