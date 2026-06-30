"use client";

import { useState } from "react";
import { BrainUploadZone } from "@/components/brain/brain-upload-zone";
import { ClassificationReviewCard } from "@/components/brain/classification-review-card";
import type { BrainDocumentRow } from "@/services/brainDocumentService";
import type { BrainIngestHealth } from "@/services/brainIngestService";

export function BrainIngestWorkspace({
  reviewQueue,
  health,
}: {
  reviewQueue: BrainDocumentRow[];
  health: BrainIngestHealth;
}) {
  const [activeDocument, setActiveDocument] = useState<BrainDocumentRow | null>(
    reviewQueue[0] ?? null,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <BrainUploadZone
        healthMessage={health.message}
        disabled={!health.storageConfigured}
        onUploaded={(doc) => setActiveDocument(doc)}
      />

      <section className="space-y-4">
        <ClassificationReviewCard
          key={activeDocument?.id ?? "empty"}
          document={activeDocument}
          onClear={() => setActiveDocument(null)}
        />

        {reviewQueue.length > 1 ? (
          <div className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B64]">
              Review queue ({reviewQueue.length})
            </p>
            <ul className="mt-2 divide-y divide-[#F0F0E8]">
              {reviewQueue.map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    className={`w-full py-2 text-left text-sm ${
                      activeDocument?.id === doc.id
                        ? "font-semibold text-[#1C4A2E]"
                        : "text-[#2C2C28] hover:text-[#1C4A2E]"
                    }`}
                    onClick={() => setActiveDocument(doc)}
                  >
                    {doc.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
