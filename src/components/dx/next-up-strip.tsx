import Link from "next/link";
import { ArrowRight, CircleDot } from "lucide-react";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import type { MissionPersonaId } from "@/lib/mission-nav";
import type { NextUpItem } from "@/lib/next-up-items";
import { dxClass } from "@/lib/dx-theme";

const TONE_STYLES: Record<NextUpItem["tone"], { border: string; icon: string; label: string }> = {
  amber: {
    border: "border-l-[#B7620A]",
    icon: "text-[#B7620A]",
    label: "text-[#B7620A]",
  },
  green: {
    border: "border-l-[#1C4A2E]",
    icon: "text-[#1C4A2E]",
    label: "text-[#1C4A2E]",
  },
  blue: {
    border: "border-l-[#2563EB]",
    icon: "text-[#2563EB]",
    label: "text-[#2563EB]",
  },
  slate: {
    border: "border-l-[#6B6B64]",
    icon: "text-[#6B6B64]",
    label: "text-[#6B6B64]",
  },
};

export function NextUpStrip({
  items,
  personaLabel,
  personaId,
}: {
  items: NextUpItem[];
  personaLabel?: string;
  /** Applies persona accent to section label when provided */
  personaId?: MissionPersonaId;
}) {
  if (items.length === 0) return null;

  const accent = personaId ? getMissionPersonaAccent(personaId) : null;

  return (
    <section
      className={`${dxClass.card} border border-[#E4E4DC] bg-[#FAFAF7] p-3 md:p-4`}
      data-testid="next-up-strip"
      aria-label="Next up"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p
          className="text-[10px] font-semibold uppercase tracking-wide text-[#6B6B64]"
          style={accent ? { borderLeft: `3px solid ${accent.primary}`, paddingLeft: "0.5rem" } : undefined}
        >
          Next up
          {personaLabel ? (
            <>
              {" · "}
              <span style={accent ? { color: accent.primary } : undefined}>{personaLabel}</span>
            </>
          ) : null}
        </p>
      </div>
      <ul className="divide-y divide-[#ECECE4]">
        {items.map((item) => {
          const tone = TONE_STYLES[item.tone];
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`group flex items-start gap-2 border-l-2 py-2 pl-3 pr-1 transition-colors hover:bg-[#F3F3EE] ${tone.border}`}
              >
                <CircleDot size={14} className={`mt-0.5 shrink-0 ${tone.icon}`} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-medium ${tone.label}`}>{item.label}</span>
                  {item.detail ? (
                    <span className="mt-0.5 block truncate text-xs text-[#6B6B64]">{item.detail}</span>
                  ) : null}
                </span>
                <ArrowRight
                  size={14}
                  className="mt-1 shrink-0 text-[#A8A89E] transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
