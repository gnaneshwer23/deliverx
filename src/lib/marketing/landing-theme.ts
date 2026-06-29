/** Light marketing landing palette — aligned with DeliverX brand (dx-theme) */
export const mkt = {
  ink: "#F8F9FB",
  s1: "#FFFFFF",
  s2: "#F3F4F6",
  s3: "#E8EAED",
  s4: "#D1D5DB",
  border: "#E8EAED",
  borderL: "#D1D5DB",
  text1: "#0D0D0B",
  text2: "#4B5563",
  text3: "#9CA3AF",
  green: "#1C4A2E",
  greenM: "#2D7048",
  greenL: "#3D9660",
  greenBright: "#3D9660",
  red: "#C0392B",
  amber: "#B7620A",
  blue: "#1A3F6B",
  purple: "#5B21B6",
  teal: "#0F766E",
  navH: 58,
  maxW: 1200,
} as const;

/** WCAG-friendly stat/KPI colour on light surfaces */
export const mktStat = {
  value: mkt.text1,
  accent: mkt.green,
  up: mkt.greenL,
  down: mkt.red,
  warn: mkt.amber,
  muted: mkt.text2,
} as const;

export const mktClass = {
  serif: "font-[family-name:var(--font-dx-display)]",
  sans: "font-[family-name:var(--font-mkt-sans)]",
  mono: "font-[family-name:var(--font-mkt-mono)]",
  label:
    "font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--mkt-text3)]",
  sectionTitle:
    "font-[family-name:var(--font-dx-display)] text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.02em] text-[var(--mkt-text1)]",
  sectionSub:
    "mt-4 max-w-2xl text-[clamp(0.9375rem,1.5vw,1.0625rem)] font-light leading-relaxed text-[var(--mkt-text2)]",
  statNumber:
    "font-[family-name:var(--font-dx-display)] text-[clamp(2.5rem,4vw,3.5rem)] tracking-[-0.04em] text-[var(--mkt-stat-accent)]",
  kpiValue:
    "font-[family-name:var(--font-dx-display)] text-xl leading-none tracking-[-0.02em] text-[var(--mkt-stat-value)]",
} as const;

export const mktCssVars = {
  "--mkt-ink": mkt.ink,
  "--mkt-s1": mkt.s1,
  "--mkt-s2": mkt.s2,
  "--mkt-s3": mkt.s3,
  "--mkt-border": mkt.border,
  "--mkt-border-l": mkt.borderL,
  "--mkt-text1": mkt.text1,
  "--mkt-text2": mkt.text2,
  "--mkt-text3": mkt.text3,
  "--mkt-green": mkt.green,
  "--mkt-green-m": mkt.greenM,
  "--mkt-green-l": mkt.greenL,
  "--mkt-green-bright": mkt.greenBright,
  "--mkt-stat-value": mktStat.value,
  "--mkt-stat-accent": mktStat.accent,
  "--mkt-stat-up": mktStat.up,
  "--mkt-stat-down": mktStat.down,
  "--mkt-stat-warn": mktStat.warn,
  "--mkt-navh": `${mkt.navH}px`,
} as const;
