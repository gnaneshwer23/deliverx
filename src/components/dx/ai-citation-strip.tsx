/**
 * Calm, human-readable AI citation strip for PI / coach / career surfaces.
 * Shows source type + id only — never confidential raw evidence content.
 * Suitable for authenticated product UI; do NOT mount on public portfolio/share.
 */

import type { AiCitation } from "@/lib/ai-orchestration/types";
import { formatCitationLabels } from "@/lib/ai-orchestration/citations";

export type CitationStripItem =
  | AiCitation
  | { sourceType?: string; sourceId: string; label?: string }
  | string;

function toCitations(items: CitationStripItem[]): AiCitation[] {
  return items
    .map((item): AiCitation | null => {
      if (typeof item === "string") {
        const id = item.trim();
        return id ? { sourceType: "evidence", sourceId: id } : null;
      }
      const sourceId = typeof item.sourceId === "string" ? item.sourceId.trim() : "";
      if (!sourceId) return null;
      return {
        sourceType: (item.sourceType as AiCitation["sourceType"]) ?? "evidence",
        sourceId,
        label: typeof item.label === "string" ? item.label : undefined,
      };
    })
    .filter((c): c is AiCitation => c !== null);
}

export function AiCitationStrip({
  citations,
  emptyLabel = "Uncited — no evidence or context attached",
  className,
}: {
  citations: CitationStripItem[] | null | undefined;
  /** Shown when citations are empty (required class without grounding). */
  emptyLabel?: string | null;
  className?: string;
}) {
  const normalised = toCitations(citations ?? []);
  if (normalised.length === 0) {
    if (!emptyLabel) return null;
    return (
      <p
        className={
          className ??
          "mt-1 text-[10px] uppercase tracking-wide text-[#B7620A]"
        }
        data-testid="ai-citation-strip-empty"
      >
        {emptyLabel}
      </p>
    );
  }

  const labels = formatCitationLabels(normalised);
  return (
    <div
      className={className ?? "mt-1 text-[10px] text-[#6B6B64]"}
      data-testid="ai-citation-strip"
    >
      <span className="uppercase tracking-wide text-[#6B6B64]">Sources: </span>
      <ul className="mt-0.5 list-none space-y-0.5">
        {labels.map((label) => (
          <li key={label} className="font-mono text-[10px] text-[#1C4A2E]">
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
