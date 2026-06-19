/**
 * Per-persona accent tokens for Mission Control chrome — variations on DeliverX green,
 * not a rainbow palette. Used for header strip, CTAs, welcome bridges, and NextUpStrip.
 */

import type { CSSProperties } from "react";
import type { MissionPersonaId } from "@/lib/mission-nav";

export type MissionPersonaAccent = {
  /** Primary accent — CTAs, title emphasis, icon tint */
  primary: string;
  /** Mid tone — gradient stops, hover states */
  mid: string;
  /** Border on chips, bridges, project pills */
  border: string;
  /** Subtle background wash */
  bg: string;
  /** Welcome bridge gradient (Tailwind arbitrary value) */
  bridgeGradient: string;
  /** Body text on light accent surfaces */
  text: string;
  /** Muted supporting text on accent surfaces */
  textMuted: string;
};

const FOUNDER_GREEN: MissionPersonaAccent = {
  primary: "#1C4A2E",
  mid: "#3D9660",
  border: "#C6DDD0",
  bg: "#EEF5F1",
  bridgeGradient: "from-[#EEF5F1] via-[#E4F0EA] to-[#D8EBE2]",
  text: "#1C4A2E",
  textMuted: "#2C4A38",
};

export const MISSION_PERSONA_ACCENT: Record<MissionPersonaId, MissionPersonaAccent> = {
  founder: FOUNDER_GREEN,
  "pm-mission": {
    primary: "#1A5C5C",
    mid: "#2A8A8A",
    border: "#B8D8D8",
    bg: "#EDF7F7",
    bridgeGradient: "from-[#EDF7F7] via-[#E2F2F2] to-[#D4EBEB]",
    text: "#1A5C5C",
    textMuted: "#2C5A5A",
  },
  ba: {
    primary: "#B7620A",
    mid: "#D4863A",
    border: "#F0D4B0",
    bg: "#FEF6EC",
    bridgeGradient: "from-[#FEF6EC] via-[#FDF0E0] to-[#FAE8D0]",
    text: "#8B4A08",
    textMuted: "#6B4423",
  },
  engineer: {
    primary: "#1A3F6B",
    mid: "#3A6BA0",
    border: "#B8CCE0",
    bg: "#EDF2F9",
    bridgeGradient: "from-[#EDF2F9] via-[#E4EBF5] to-[#D8E4F0]",
    text: "#1A3F6B",
    textMuted: "#2C4A6B",
  },
  qa: {
    primary: "#6B3FA0",
    mid: "#9B6BC7",
    border: "#D4C0E8",
    bg: "#F5EDFA",
    bridgeGradient: "from-[#F5EDFA] via-[#EEE4F8] to-[#E6DAF4]",
    text: "#5A3488",
    textMuted: "#4A3A6B",
  },
  product: {
    primary: "#8B4A3A",
    mid: "#C07060",
    border: "#E8C8C0",
    bg: "#FAF0ED",
    bridgeGradient: "from-[#FAF0ED] via-[#F8E8E4] to-[#F4DDD8]",
    text: "#7A3F32",
    textMuted: "#6B4A42",
  },
  scrum: {
    primary: "#2D6B4A",
    mid: "#4A9A6E",
    border: "#B8DDD0",
    bg: "#EDF7F2",
    bridgeGradient: "from-[#EDF7F2] via-[#E4F2EA] to-[#D8EBE2]",
    text: "#2D6B4A",
    textMuted: "#3A5A48",
  },
};

export function getMissionPersonaAccent(personaId: MissionPersonaId): MissionPersonaAccent {
  return MISSION_PERSONA_ACCENT[personaId];
}

const BTN_PRIMARY_BASE =
  "inline-flex items-center justify-center gap-1.5 border-[1.5px] px-5 py-2.5 font-[family-name:var(--font-dx-mono)] text-[11px] uppercase tracking-[0.12em] text-white transition hover:brightness-110";

/** Primary CTA class + inline accent colors (Tailwind cannot safelist dynamic arbitrary values). */
export function personaBtnPrimary(accent: MissionPersonaAccent): {
  className: string;
  style: { borderColor: string; backgroundColor: string };
} {
  return {
    className: BTN_PRIMARY_BASE,
    style: { borderColor: accent.primary, backgroundColor: accent.primary },
  };
}

/** Top header gradient strip inline style. */
export function personaHeaderStripStyle(accent: MissionPersonaAccent): CSSProperties {
  return {
    background: `linear-gradient(to right, ${accent.primary}, ${accent.mid}, ${accent.primary})`,
  };
}

