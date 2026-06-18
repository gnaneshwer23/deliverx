/** Dark marketing landing palette — aligned with DeliverX brand (dx-theme teal accents) */
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
  text3: "#94918B",
  green: "#1C4A2E",
  greenM: "#2D7048",
  greenL: "#3D9660",
  greenBright: "#6EE7B7",
  red: "#F87171",
  amber: "#FBBF24",
  blue: "#93C5FD",
  purple: "#C4B5FD",
  teal: "#5EEAD4",
  navH: 58,
  maxW: 1200,
} as const;

/** WCAG-friendly stat/KPI colour on dark surfaces (#111110 / #18181A) */
export const mktStat = {
  value: mkt.text1,
  accent: mkt.greenBright,
  up: "#86EFAC",
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
