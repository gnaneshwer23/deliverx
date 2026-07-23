/** Light marketing landing palette — aligned with DeliverX brand (dx-theme) */
export const mkt = {
  ink: "#F7F9F7",
  s1: "#FFFFFF",
  s2: "#F1F4F2",
  s3: "#E6EBE8",
  s4: "#D0D7D2",
  border: "#E4E9E5",
  borderL: "#D0D7D2",
  text1: "#0D0D0B",
  text2: "#3F4A43",
  text3: "#7A857E",
  green: "#1C4A2E",
  greenM: "#2D7048",
  greenL: "#3D9660",
  greenBright: "#3D9660",
  cream: "#F3F6F3",
  red: "#C0392B",
  amber: "#B7620A",
  blue: "#1A3F6B",
  purple: "#5B21B6",
  teal: "#0F766E",
  navH: 60,
  maxW: 1120,
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
    "font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--mkt-text3)]",
  sectionTitle:
    "font-[family-name:var(--font-dx-display)] text-[clamp(1.875rem,4.2vw,2.875rem)] leading-[1.06] tracking-[-0.025em] text-[var(--mkt-text1)]",
  sectionSub:
    "mt-4 max-w-[36rem] text-[clamp(0.9375rem,1.4vw,1.0625rem)] font-light leading-[1.7] text-[var(--mkt-text2)]",
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
  "--mkt-cream": mkt.cream,
  "--mkt-stat-value": mktStat.value,
  "--mkt-stat-accent": mktStat.accent,
  "--mkt-stat-up": mktStat.up,
  "--mkt-stat-down": mktStat.down,
  "--mkt-stat-warn": mktStat.warn,
  "--mkt-navh": `${mkt.navH}px`,
} as const;
