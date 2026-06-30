"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";
import { formatHonestKpi } from "@/lib/honest-kpi";
import type { BrainClassification } from "@/services/aiBrainClassification";
import type { BrainDocumentRow } from "@/services/brainDocumentService";

function parseClassification(doc: BrainDocumentRow): BrainClassification {
  const raw = doc.classification;
  return {
    documentType: String(raw.documentType ?? "other"),
    confidence: typeof raw.confidence === "number" ? raw.confidence : 0,
    summary: String(raw.summary ?? "Review this document before saving."),
    personaRelevance: Array.isArray(raw.personaRelevance)
      ? raw.personaRelevance.map(String)
      : [],
    suggestedActions: Array.isArray(raw.suggestedActions)
      ? raw.suggestedActions.map(String)
      : [],
  };
}

export function ClassificationReviewCard({
  document,
  onClear,
}: {
  document: BrainDocumentRow | null;
  onClear?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<BrainClassification | null>(
    document ? parseClassification(document) : null,
  );

  if (!document) {
    return (
      <div className={`${dxClass.cardPad}`}>
        <p className={dxClass.panelTitle}>Classification review</p>
        <p className="mt-4 text-sm text-[#6B6B64]">
          Upload a document to see AI classification suggestions. Every suggestion requires review
          before it is saved.
        </p>
      </div>
    );
  }

  const classification = draft ?? parseClassification(document);
  const confidenceKpi = formatHonestKpi(
    classification.confidence > 0 ? `${Math.round(classification.confidence * 100)}%` : null,
    "Confidence available after classification runs",
  );

  function submit(action: "accept" | "edit" | "discard") {
    if (!document) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/brain/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: document.id,
            action,
            editedClassification: action === "edit" ? classification : undefined,
          }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          setError(data.error ?? "Action failed");
          return;
        }
        setEditing(false);
        onClear?.();
        router.refresh();
      } catch {
        setError("Could not reach the server");
      }
    });
  }

  return (
    <div className={`${dxClass.cardPad}`}>
      <p className={dxClass.panelTitle}>Classification review</p>
      <h3 className="mt-2 font-semibold text-[#0D0D0B]">{document.title}</h3>

      {editing ? (
        <div className="mt-4 space-y-3">
          <label className="block text-xs text-[#6B6B64]">
            Document type
            <input
              className="mt-1 w-full rounded border border-[#E4E4DC] px-2 py-1.5 text-sm"
              value={classification.documentType}
              onChange={(e) =>
                setDraft({ ...classification, documentType: e.target.value })
              }
            />
          </label>
          <label className="block text-xs text-[#6B6B64]">
            Summary
            <textarea
              className="mt-1 w-full rounded border border-[#E4E4DC] px-2 py-1.5 text-sm"
              rows={3}
              value={classification.summary}
              onChange={(e) => setDraft({ ...classification, summary: e.target.value })}
            />
          </label>
        </div>
      ) : (
        <p className="mt-2 text-sm text-[#6B6B64]">{classification.summary}</p>
      )}

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-[#F0F0E8] pb-2">
          <dt className="text-[#6B6B64]">Suggested type</dt>
          <dd className="font-medium">{classification.documentType}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-[#F0F0E8] pb-2">
          <dt className="text-[#6B6B64]">Confidence</dt>
          <dd className="font-medium">{confidenceKpi.value}</dd>
        </div>
        {classification.personaRelevance.length > 0 ? (
          <div className="flex justify-between gap-4 border-b border-[#F0F0E8] pb-2">
            <dt className="text-[#6B6B64]">Personas</dt>
            <dd className="font-medium">{classification.personaRelevance.join(", ")}</dd>
          </div>
        ) : null}
      </dl>

      {classification.suggestedActions.length > 0 ? (
        <ul className="mt-4 list-inside list-disc text-sm text-[#6B6B64]">
          {classification.suggestedActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className={dxClass.btnPrimary}
          disabled={isPending || document.status !== "review"}
          onClick={() => submit(editing ? "edit" : "accept")}
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          {editing ? "Save & approve" : "Approve classification"}
        </button>
        <button
          type="button"
          className={dxClass.btnGhost}
          disabled={isPending || document.status !== "review"}
          onClick={() => {
            setDraft(parseClassification(document));
            setEditing((v) => !v);
          }}
        >
          <Pencil size={14} />
          {editing ? "Cancel edit" : "Edit & retry"}
        </button>
        <button
          type="button"
          className={`${dxClass.btnGhost} text-rose-700`}
          disabled={isPending || document.status !== "review"}
          onClick={() => submit("discard")}
        >
          <Trash2 size={14} />
          Discard
        </button>
      </div>

      <p className="mt-3 text-xs text-[#A8A89E]">
        AI never auto-applies — review required before saving.
      </p>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
