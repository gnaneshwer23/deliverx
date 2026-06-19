import Link from "next/link";
import { Sparkles } from "lucide-react";
import { buildBootstrapParityHighlights } from "@/lib/bootstrap-checklist";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { dxClass } from "@/lib/dx-theme";

export function BootstrapParityBanner({
  summary,
  proposalsHref = "/workspace/proposals",
}: {
  summary: ProjectBootstrapSummary;
  proposalsHref?: string;
}) {
  const highlights = buildBootstrapParityHighlights(summary);
  if (highlights.length === 0) return null;

  return (
    <div
      className={`${dxClass.card} flex flex-wrap items-center gap-2 border-[#C6DDD0] bg-[#EEF5F1] px-4 py-3 text-sm text-[#1C4A2E]`}
      data-testid="bootstrap-parity-banner"
    >
      <Sparkles size={14} className="shrink-0" aria-hidden />
      <span>
        Live from your project GO bootstrap
        {highlights.map((highlight, index) => (
          <span key={highlight.label}>
            {index === 0 ? " · " : " · "}
            <strong className="font-semibold">{highlight.count}</strong> {highlight.label}
          </span>
        ))}
        {" · "}
        <Link href={proposalsHref} className="underline underline-offset-2 hover:text-[#163d26]">
          Review outputs
        </Link>
      </span>
    </div>
  );
}
