export const brand = {
  primary: "#0F766E",
  primaryHover: "#0E6B62",
  primaryRing: "#0F766E33",
  primaryMuted: "#0F766E1A",
  bg: "#F8FAFC",
  fg: "#0F172A",
  muted: "#64748B",
  surface: "#FFFFFF",
  border: "#E2E8F0",
} as const;

/** Tailwind class bundles for consistent accent usage */
export const brandClass = {
  text: "text-[#0F766E]",
  textHover: "hover:text-[#0E6B62]",
  bg: "bg-[#0F766E]",
  bgHover: "hover:bg-[#0E6B62]",
  bgMuted: "bg-[#0F766E]/10",
  ring: "focus-visible:ring-[#0F766E]/40 focus-visible:border-[#0F766E]",
  activeNav: "bg-[#0F766E]/10 font-semibold text-[#0F766E]",
} as const;
