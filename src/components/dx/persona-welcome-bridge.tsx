"use client";

import { Sparkles } from "lucide-react";
import type { MissionPersonaAccent } from "@/config/mission-persona-accent";
import { personaBtnPrimary } from "@/config/mission-persona-accent";
import type { WelcomeBridgeChip } from "@/lib/persona-dashboard-mode-shared";

export type PersonaWelcomeBridgeProps = {
  testId: string;
  ariaLabel: string;
  accent: MissionPersonaAccent;
  headline: string;
  body: string;
  chips: WelcomeBridgeChip[];
  onDismiss: () => void;
};

export function PersonaWelcomeBridge({
  testId,
  ariaLabel,
  accent,
  headline,
  body,
  chips,
  onDismiss,
}: PersonaWelcomeBridgeProps) {
  const btn = personaBtnPrimary(accent);

  return (
    <div
      className={`border-b bg-gradient-to-r px-6 py-4 md:px-8 ${accent.bridgeGradient}`}
      style={{ borderColor: accent.border }}
      data-testid={testId}
      role="region"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2" style={{ color: accent.text }}>
            <Sparkles size={16} className="shrink-0" aria-hidden />
            <p className="font-[family-name:var(--font-dx-display)] text-base font-semibold">
              {headline}
            </p>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed" style={{ color: accent.textMuted }}>
            {body}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1 rounded-full border bg-white/70 px-2.5 py-1 text-xs font-medium"
                style={{ borderColor: accent.border, color: accent.text }}
              >
                <strong className="font-semibold tabular-nums">{chip.count}</strong>
                {chip.label}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className={`${btn.className} shrink-0 text-[10px]`}
          style={btn.style}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
