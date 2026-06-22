/** DeliverX design tokens (from product prototype) */
export const dx = {
  ink: "#0D0D0B",
  ink2: "#1A1A17",
  ink3: "#2C2C28",
  mut: "#6B6B64",
  fnt: "#A8A89E",
  rul: "#E4E4DC",
  rul2: "#F0F0E8",
  srf: "#F7F7F2",
  bas: "#FAFAF5",
  wht: "#FFFFFF",
  acc: "#1C4A2E",
  acm: "#2D7048",
  acl: "#3D9660",
  accLight: "#3D9660",
  acb: "#EEF5F1",
  acr: "#C6DDD0",
  red: "#C0392B",
  statusDanger: "#C0392B",
  rdb: "#FDF1F0",
  amb: "#B7620A",
  statusWarning: "#B7620A",
  abb: "#FEF6EC",
  grn: "#1A6B3A",
  statusSuccess: "#1A6B3A",
  gnb: "#EDF7F1",
  blu: "#1A3F6B",
  statusInfo: "#1A3F6B",
  blb: "#EDF2F9",
  navh: 60,
  sbw: 220,
} as const;

export const dxClass = {
  display: "font-[family-name:var(--font-dx-display)]",
  sans: "font-[family-name:var(--font-dx-sans)]",
  mono: "font-[family-name:var(--font-dx-mono)]",
  caps: "font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.2em] text-[#6B6B64]",
  capsAcc: "font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.2em] text-[#1C4A2E]",
  pageTitle: "font-[family-name:var(--font-dx-display)] text-2xl tracking-tight text-[#0D0D0B] md:text-3xl",
  sectionTitle:
    "font-[family-name:var(--font-dx-display)] text-3xl leading-tight tracking-tight text-[#0D0D0B] md:text-4xl lg:text-5xl",
  btnPrimary:
    "inline-flex items-center justify-center gap-1.5 border-[1.5px] border-[#1C4A2E] bg-[#1C4A2E] px-5 py-2.5 font-[family-name:var(--font-dx-mono)] text-[11px] uppercase tracking-[0.12em] text-white transition hover:bg-[#2D7048]",
  btnGhost:
    "inline-flex items-center justify-center gap-1.5 border-[1.5px] border-[#E4E4DC] bg-transparent px-5 py-2.5 font-[family-name:var(--font-dx-mono)] text-[11px] uppercase tracking-[0.12em] text-[#0D0D0B] transition hover:border-[#0D0D0B]",
  btnSm:
    "inline-flex items-center justify-center gap-1.5 border-[1.5px] border-[#1C4A2E] bg-[#1C4A2E] px-3.5 py-1.5 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.12em] text-white transition hover:bg-[#2D7048]",
  input:
    "w-full border-[1.5px] border-[#E4E4DC] bg-white px-3 py-2.5 text-[15px] text-[#0D0D0B] outline-none transition placeholder:text-[#A8A89E] focus:border-[#1C4A2E]",
  label:
    "font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.18em] text-[#6B6B64]",
  panelTitle:
    "font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.18em] text-[#6B6B64]",
  stickyHeader:
    "sticky top-0 z-20 border-b border-[#E4E4DC] bg-white/85 px-6 py-5 shadow-[0_1px_0_rgba(28,74,46,0.06)] backdrop-blur-md md:px-8",
  panelShellBody:
    "[&>div>h3.text-lg:first-child]:hidden [&>div>section>h3:first-child]:hidden",
  card: "rounded-xl border border-[#E4E4DC] bg-white shadow-[0_1px_3px_rgba(13,13,11,0.04),0_4px_16px_rgba(13,13,11,0.03)]",
  cardPad:
    "rounded-xl border border-[#E4E4DC] bg-white p-5 shadow-[0_1px_3px_rgba(13,13,11,0.04),0_4px_16px_rgba(13,13,11,0.03)] md:p-6",
  cardElevated:
    "rounded-xl border border-[#E4E4DC] bg-white shadow-[0_2px_8px_rgba(13,13,11,0.05),0_8px_24px_rgba(13,13,11,0.04)] transition hover:shadow-[0_4px_12px_rgba(13,13,11,0.07),0_12px_32px_rgba(13,13,11,0.05)]",
  widgetGrid: "grid gap-5 md:gap-6",
} as const;
