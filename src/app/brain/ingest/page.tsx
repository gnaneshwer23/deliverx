import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { ClassificationReviewCard } from "@/components/brain/classification-review-card";
import { dxClass } from "@/lib/dx-theme";

export default function BrainIngestPage() {
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

        <div className="grid gap-6 lg:grid-cols-2">
          <section className={`${dxClass.cardPad}`}>
            <div className="mb-4 flex items-center gap-2">
              <Upload size={18} className="text-[#1C4A2E]" />
              <h2 className="font-semibold">Upload zone</h2>
            </div>
            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#C6DDD0] bg-[#EEF5F1]/40 px-6 py-12 text-center">
              <p className="text-sm font-medium text-[#0D0D0B]">Drop delivery documents here</p>
              <p className="mt-2 max-w-sm text-xs text-[#6B6B64]">
                PDF, Word, and markdown supported. Storage wiring ships next sprint — this is a
                placeholder upload zone.
              </p>
              <button type="button" className={`${dxClass.btnGhost} mt-6`} disabled>
                Choose files (coming soon)
              </button>
            </div>
          </section>

          <section>
            <ClassificationReviewCard
              title="Sample classification preview"
              suggestedType="Delivery playbook"
              confidence={null}
              summary="Upload a document to see AI classification suggestions. Every suggestion requires review before it is saved."
            />
          </section>
        </div>
      </div>
    </>
  );
}
