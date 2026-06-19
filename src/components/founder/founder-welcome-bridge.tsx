"use client";

import { Sparkles } from "lucide-react";
import {
  buildFounderWelcomeBridgeChips,
  dismissFounderBridge,
} from "@/lib/founder-dashboard-mode";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { dxClass } from "@/lib/dx-theme";

export function FounderWelcomeBridge({
  projectId,
  summary,
  pendingDecisionsCount,
  pendingReviewCount,
  onDismiss,
}: {
  projectId: string;
  summary: ProjectBootstrapSummary;
  pendingDecisionsCount: number;
  pendingReviewCount: number;
  onDismiss: () => void;
}) {
  const chips = buildFounderWelcomeBridgeChips(summary, {
    pendingDecisionsCount,
    pendingReviewCount,
  });

  function handleDismiss() {
    dismissFounderBridge(projectId);
    onDismiss();
  }

  return (
    <div
      className="border-b border-[#A8D4BC] bg-gradient-to-r from-[#EEF5F1] via-[#E4F0EA] to-[#D8EBE2] px-6 py-4 md:px-8"
      data-testid="founder-welcome-bridge"
      role="region"
      aria-label="Welcome to your founder mission dashboard"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2 text-[#1C4A2E]">
            <Sparkles size={16} className="shrink-0" aria-hidden />
            <p className="font-[family-name:var(--font-dx-display)] text-base font-semibold">
              Built from your business case
            </p>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-[#2C4A38]">
            After your GO decision, DeliverX seeded this executive dashboard with portfolio
            health, funding signals, and strategic decisions. Start by reviewing AI outputs and
            confirming what matters most for the business.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1 rounded-full border border-[#C6DDD0] bg-white/70 px-2.5 py-1 text-xs font-medium text-[#1C4A2E]"
              >
                <strong className="font-semibold tabular-nums">{chip.count}</strong>
                {chip.label}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className={`${dxClass.btnPrimary} shrink-0 text-[10px]`}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
