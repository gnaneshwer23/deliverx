"use client";

import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import type { MissionPersonaAccent } from "@/config/mission-persona-accent";
import { ClampableSummary } from "@/components/dx/clampable-summary";
import { dxClass } from "@/lib/dx-theme";

/** Role-specific AI one-liner with persona accent — distinct from PM teal / founder green. */
export function PersonaAiSynthesis({
  title,
  summary,
  accent,
  children,
}: {
  title: string;
  summary: string;
  accent: MissionPersonaAccent;
  children?: ReactNode;
}) {
  return (
    <div
      className={`${dxClass.cardElevated} p-5`}
      style={{ borderColor: accent.border, backgroundColor: accent.bg }}
      data-panel="persona-ai-synthesis"
    >
      <div
        className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
        style={{ color: accent.text }}
      >
        <Sparkles size={14} aria-hidden />
        {title}
      </div>
      <ClampableSummary text={summary} className="text-sm text-[#0D0D0B] line-clamp-3" />
      {children}
    </div>
  );
}
