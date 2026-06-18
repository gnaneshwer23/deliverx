/** Dark marketing landing palette (#0C0C0A prototype) */
export const mkt = {
  ink: "#0C0C0A",
  s1: "#111110",
  s2: "#18181A",
  s3: "#222224",
  s4: "#2C2C2E",
  border: "#2E2E30",
  borderL: "#3A3A3C",
  text1: "#F0EDE8",
  text2: "#B8B5AF",
  text3: "#7A7874",
  green: "#1C4A2E",
  greenM: "#2D7048",
  greenL: "#3D9660",
  navH: 58,
  maxW: 1200,
} as const;

export const mktClass = {
  serif: "font-[family-name:var(--font-dx-display)]",
  sans: "font-[family-name:var(--font-mkt-sans)]",
  mono: "font-[family-name:var(--font-mkt-mono)]",
  label:
    "font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[#7A7874]",
  sectionTitle:
    "font-[family-name:var(--font-dx-display)] text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.02em] text-[#F0EDE8]",
  sectionSub: "mt-4 max-w-2xl text-[clamp(0.9375rem,1.5vw,1.0625rem)] font-light leading-relaxed text-[#B8B5AF]",
} as const;
