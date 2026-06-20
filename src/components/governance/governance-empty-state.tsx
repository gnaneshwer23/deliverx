import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";
import type { GovernanceEmptyStateConfig } from "@/lib/governance-tabs";

export function GovernanceEmptyState({ config }: { config: GovernanceEmptyStateConfig }) {
  return (
    <div
      className={`${dxClass.cardPad} flex flex-col items-center py-10 text-center`}
      data-panel="governance-empty-state"
    >
      <span
        className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#EEF5F1] text-[#1C4A2E]"
        aria-hidden
      >
        <ClipboardList size={22} strokeWidth={1.75} />
      </span>
      <p className={`${dxClass.display} text-xl`}>{config.title}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#6B6B64]">{config.description}</p>
      {config.href && config.actionLabel ? (
        <Link
          href={config.href}
          className={`${dxClass.btnPrimary} mt-6 inline-flex rounded-full px-6 text-[10px]`}
        >
          {config.actionLabel}
        </Link>
      ) : (
        <p className="mt-4 text-xs text-[#A8A89E]">Nothing to action right now — check back after your next stand-up.</p>
      )}
    </div>
  );
}
