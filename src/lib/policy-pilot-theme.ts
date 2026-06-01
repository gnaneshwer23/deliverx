/**
 * PolicyPilot-inspired marketing tokens (Dribbble 26511886).
 * Dark ops canvas, cream bands, teal signal accents, rounded glass cards.
 */
export const pp = {
  canvas: "#0a0e14",
  canvasDeep: "#060910",
  cream: "#f5f2ed",
  creamMuted: "#ebe6de",
  card: "#111820",
  cardBorder: "rgba(255,255,255,0.08)",
  text: "#f8f6f2",
  textMuted: "rgba(248,246,242,0.55)",
  textDim: "rgba(248,246,242,0.35)",
  teal: "#6ee7c7",
  tealDim: "rgba(110,231,199,0.15)",
  tealGlow: "rgba(110,231,199,0.45)",
  green: "#3D9660",
  red: "#f87171",
  radius: "1rem",
  radiusLg: "1.25rem",
} as const;

export const ppClass = {
  shell: "landing-page landing-page--pp min-h-screen bg-[#0a0e14] text-[#f8f6f2] antialiased",
  hero: "landing-pp-hero relative overflow-hidden bg-[#0a0e14]",
  creamSection: "bg-[#f5f2ed] text-[#0a0e14]",
  cardDark:
    "rounded-2xl border border-white/[0.08] bg-[#111820]/90 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.65)] backdrop-blur-sm",
  cardLight:
    "rounded-2xl border border-[#0a0e14]/[0.08] bg-white shadow-[0_20px_60px_-24px_rgba(10,14,20,0.12)]",
  eyebrow:
    "font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.22em] text-[#6ee7c7]",
  eyebrowDark:
    "font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.22em] text-[#1C4A2E]",
  display:
    "font-[family-name:var(--font-dx-display)] tracking-tight",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-[#6ee7c7] px-7 py-3 font-[family-name:var(--font-dx-mono)] text-[11px] font-medium uppercase tracking-[0.14em] text-[#0a0e14] transition hover:bg-[#5dd4b6] hover:shadow-[0_0_32px_-4px_rgba(110,231,199,0.55)]",
  btnGhost:
    "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-7 py-3 font-[family-name:var(--font-dx-mono)] text-[11px] uppercase tracking-[0.14em] text-[#f8f6f2] transition hover:border-white/40 hover:bg-white/[0.08]",
  btnPrimaryOnCream:
    "inline-flex items-center justify-center gap-2 rounded-full bg-[#0a0e14] px-7 py-3 font-[family-name:var(--font-dx-mono)] text-[11px] uppercase tracking-[0.14em] text-[#f8f6f2] transition hover:bg-[#111820]",
  statValue:
    "font-[family-name:var(--font-dx-display)] text-4xl leading-none tracking-tight text-[#6ee7c7] md:text-5xl",
  statValueCream:
    "font-[family-name:var(--font-dx-display)] text-4xl leading-none tracking-tight text-[#0a0e14] md:text-5xl",
} as const;
