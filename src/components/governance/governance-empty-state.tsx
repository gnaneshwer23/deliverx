import Link from "next/link";
import { dxClass } from "@/lib/dx-theme";
import type { GovernanceEmptyStateConfig } from "@/lib/governance-tabs";

export function GovernanceEmptyState({ config }: { config: GovernanceEmptyStateConfig }) {
  return (
    <div className={`${dxClass.cardPad} text-center`} data-panel="governance-empty-state">
      <p className={`${dxClass.display} text-lg`}>{config.title}</p>
      <p className="mt-2 text-sm text-[#6B6B64]">{config.description}</p>
      {config.href && config.actionLabel ? (
        <Link
          href={config.href}
          className={`${dxClass.btnPrimary} mt-5 inline-flex text-[10px]`}
        >
          {config.actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
