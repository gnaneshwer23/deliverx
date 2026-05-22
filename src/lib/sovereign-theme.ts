/** Sovereign AI–inspired design tokens (shared across marketing, app shell, onboarding) */
export const sovereign = {
  bgDark: "#0a0e14",
  bgPanel: "#111820",
  bgCream: "#f5f2ed",
  bgCard: "#ffffff",
  textLight: "#f8f6f2",
  textMuted: "#9ca3af",
  textDark: "#1a1a1a",
  textBody: "#4b5563",
  accent: "#6ee7c7",
  accentMuted: "rgba(110,231,199,0.12)",
  maroon: "#5c3333",
  borderDark: "rgba(255,255,255,0.12)",
  borderLight: "rgba(26,26,26,0.08)",
} as const;

export const sovereignClass = {
  display: "font-[family-name:var(--font-display)]",
  shell: "bg-[#0a0e14] text-[#f8f6f2]",
  main: "bg-[#f5f2ed] text-[#1a1a1a]",
  card: "rounded-2xl border border-[#1a1a1a]/8 bg-white shadow-sm",
  cardDark: "rounded-2xl border border-white/10 bg-[#111820] shadow-sm",
  pillPrimary:
    "inline-flex items-center justify-center rounded-full border border-[#1a1a1a]/20 px-6 text-[11px] font-medium uppercase tracking-[0.2em] text-[#1a1a1a] transition hover:border-[#6ee7c7] hover:text-[#0a0e14] hover:bg-[#6ee7c7]",
  pillGhost:
    "inline-flex items-center justify-center rounded-full border border-[#1a1a1a]/15 px-6 text-[11px] font-medium uppercase tracking-[0.2em] text-[#4b5563] transition hover:border-[#1a1a1a]/30 hover:text-[#1a1a1a]",
  pillDark:
    "inline-flex items-center justify-center rounded-full border border-[#f8f6f2]/30 px-6 text-[11px] font-medium uppercase tracking-[0.2em] text-[#f8f6f2] transition hover:border-[#6ee7c7] hover:text-[#6ee7c7]",
  label: "text-xs font-medium uppercase tracking-[0.15em] text-[#6b7280]",
  input:
    "mt-1 h-11 w-full rounded-lg border border-[#1a1a1a]/12 bg-white px-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6ee7c7]/60 focus:ring-2 focus:ring-[#6ee7c7]/20",
  sectionTitle: "font-[family-name:var(--font-display)] text-xl tracking-tight text-[#1a1a1a]",
  pageTitle: "font-[family-name:var(--font-display)] text-3xl tracking-tight text-[#1a1a1a] md:text-4xl",
  eyebrow: "text-[10px] font-medium uppercase tracking-[0.25em] text-[#5c3333]",
} as const;
