import Link from "next/link";
import { ArrowRight, CircleDot } from "lucide-react";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import type { MissionPersonaId } from "@/lib/mission-nav";
import type { NextUpItem } from "@/lib/next-up-items";
import { dxClass } from "@/lib/dx-theme";

const TONE_STYLES: Record<
  NextUpItem["tone"],
  { accent: string; bg: string; icon: string; label: string; dot: string }
> = {
  amber: {
    accent: "#B7620A",
    bg: "#FEF6EC",
    icon: "text-[#B7620A]",
    label: "text-[#B7620A]",
    dot: "bg-[#B7620A]",
  },
  green: {
    accent: "#1C4A2E",
    bg: "#EEF5F1",
    icon: "text-[#1C4A2E]",
    label: "text-[#1C4A2E]",
    dot: "bg-[#1C4A2E]",
  },
  blue: {
    accent: "#1A3F6B",
    bg: "#EDF2F9",
    icon: "text-[#1A3F6B]",
    label: "text-[#1A3F6B]",
    dot: "bg-[#1A3F6B]",
  },
  slate: {
    accent: "#6B7280",
    bg: "#F3F4F6",
    icon: "text-[#6B7280]",
    label: "text-[#2C2C28]",
    dot: "bg-[#6B7280]",
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
      className={`${dxClass.card} overflow-hidden p-0`}
      data-testid="next-up-strip"
      aria-label="Next up"
    >
      <div className="border-b border-[var(--dx-rul2)] px-4 py-3 md:px-5">
        <p
          className={`${dxClass.caps} flex items-center gap-2`}
          style={accent ? { color: accent.primary } : undefined}
        >
          {accent ? (
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: accent.primary }}
              aria-hidden
            />
          ) : null}
          Next up
          {personaLabel ? (
            <>
              <span className="text-[var(--dx-fnt)]">·</span>
              <span style={accent ? { color: accent.text } : undefined}>{personaLabel}</span>
            </>
          ) : null}
        </p>
      </div>
      <ul className="flex flex-col gap-2 p-3 md:gap-2.5 md:p-4">
        {items.map((item) => {
          const tone = TONE_STYLES[item.tone];
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group flex min-h-11 touch-manipulation items-center gap-3 rounded-[var(--dx-radius-md)] border border-[var(--dx-rul)]/80 bg-white px-3 py-2.5 shadow-[var(--dx-shadow-sm)] transition hover:border-[var(--dx-acr)] hover:shadow-[var(--dx-shadow-card)] md:px-4 md:py-3"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: tone.bg }}
                  aria-hidden
                >
                  <CircleDot size={16} className={tone.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`size-1.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden />
                    <span className={`block truncate text-sm font-medium ${tone.label}`}>{item.label}</span>
                  </span>
                  {item.detail ? (
                    <span className="mt-0.5 block truncate text-xs text-[var(--dx-mut)]">{item.detail}</span>
                  ) : null}
                </span>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-[var(--dx-fnt)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--dx-acc)]"
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
