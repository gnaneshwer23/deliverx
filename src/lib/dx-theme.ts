/** DeliverX design tokens (Brief v2 — light SaaS dashboard) */
export const dx = {
  page: "#F8F9FB",
  ink: "#0D0D0B",
  ink2: "#1A1A17",
  ink3: "#2C2C28",
  mut: "#6B7280",
  fnt: "#9CA3AF",
  rul: "#E8EAED",
  rul2: "#F0F1F4",
  srf: "#F3F4F6",
  bas: "#F8F9FB",
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
  sbw: 248,
  radiusLg: 14,
  radiusXl: 16,
} as const;

export const dxClass = {
  display: "font-[family-name:var(--font-dx-display)]",
  sans: "font-[family-name:var(--font-dx-sans)]",
  mono: "font-[family-name:var(--font-dx-mono)]",
  pageBg: "bg-[var(--dx-page)]",
  navBar:
    "border-b border-[var(--dx-rul)] bg-white shadow-[var(--dx-shadow-nav)]",
  sidebar:
    "border-r border-[var(--dx-rul)]/60 bg-white shadow-[var(--dx-shadow-sidebar)]",
  navLinkActive:
    "mx-2 flex items-center gap-2.5 rounded-[var(--dx-radius-md)] bg-[#EEF5F1] px-3 py-2 text-[13px] font-medium text-[#1C4A2E] shadow-[var(--dx-shadow-sm)] transition",
  navLinkInactive:
    "mx-2 flex items-center gap-2.5 rounded-[var(--dx-radius-md)] px-3 py-2 text-[13px] text-[var(--dx-mut)] transition hover:bg-[var(--dx-srf)] hover:text-[#0D0D0B]",
  navLinkProminent:
    "mx-2 flex items-center gap-2.5 rounded-[var(--dx-radius-md)] px-3 py-2 text-[13px] font-medium text-[#2C2C28] transition hover:bg-[var(--dx-srf)] hover:text-[#0D0D0B]",
  navSectionLabel:
    "mb-1.5 px-4 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.2em] text-[var(--dx-fnt)]",
  workspaceContent: "dx-workspace-content",
  avatar:
    "bg-[#1C4A2E] font-[family-name:var(--font-dx-display)] text-white",
  filterActive: "bg-[#1C4A2E] text-white shadow-[var(--dx-shadow-sm)]",
  filterInactive:
    "bg-white text-[var(--dx-mut)] shadow-[var(--dx-shadow-sm)] hover:bg-[var(--dx-srf)]",
  caps: "font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--dx-mut)]",
  capsAcc: "font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.2em] text-[#1C4A2E]",
  pageTitle: "font-[family-name:var(--font-dx-display)] text-2xl tracking-tight text-[#0D0D0B] md:text-3xl",
  sectionTitle:
    "font-[family-name:var(--font-dx-display)] text-3xl leading-tight tracking-tight text-[#0D0D0B] md:text-4xl lg:text-5xl",
  btnPrimary:
    "inline-flex items-center justify-center gap-1.5 border-[1.5px] border-[#1C4A2E] bg-[#1C4A2E] px-5 py-2.5 font-[family-name:var(--font-dx-mono)] text-[11px] uppercase tracking-[0.12em] text-white transition hover:bg-[#2D7048]",
  btnGhost:
    "inline-flex items-center justify-center gap-1.5 border-[1.5px] border-[var(--dx-rul)] bg-white px-5 py-2.5 font-[family-name:var(--font-dx-mono)] text-[11px] uppercase tracking-[0.12em] text-[#0D0D0B] shadow-[var(--dx-shadow-sm)] transition hover:border-[#1C4A2E] hover:text-[#1C4A2E]",
  btnSm:
    "inline-flex items-center justify-center gap-1.5 border-[1.5px] border-[#1C4A2E] bg-[#1C4A2E] px-3.5 py-1.5 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.12em] text-white transition hover:bg-[#2D7048]",
  input:
    "w-full rounded-lg border border-[var(--dx-rul)] bg-white px-3 py-2.5 text-[15px] text-[#0D0D0B] shadow-[var(--dx-shadow-sm)] outline-none transition placeholder:text-[var(--dx-fnt)] focus:border-[#1C4A2E] focus:ring-2 focus:ring-[#1C4A2E]/10",
  label:
    "font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.18em] text-[var(--dx-mut)]",
  panelTitle:
    "font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.18em] text-[var(--dx-mut)]",
  stickyHeader:
    "sticky top-0 z-20 border-b border-[var(--dx-rul)]/80 bg-white/95 px-6 py-6 shadow-[var(--dx-shadow-nav)] backdrop-blur-md md:px-8",
  panelShellBody:
    "[&>div>h3.text-lg:first-child]:hidden [&>div>section>h3:first-child]:hidden",
  card: "rounded-[var(--dx-radius-lg)] border border-[var(--dx-rul)]/70 bg-white shadow-[var(--dx-shadow-card)]",
  cardPad:
    "rounded-[var(--dx-radius-lg)] border border-[var(--dx-rul)]/70 bg-white p-5 shadow-[var(--dx-shadow-card)] md:p-6",
  cardElevated:
    "rounded-[var(--dx-radius-lg)] border border-[var(--dx-rul)]/70 bg-white shadow-[var(--dx-shadow-card-hover)] transition hover:shadow-[0_4px_12px_rgba(15,23,42,0.07),0_12px_32px_rgba(15,23,42,0.05)]",
  widgetGrid: "grid gap-5 md:gap-6",
  panelHeader: "flex items-center justify-between border-b border-[var(--dx-rul2)] px-6 py-4",
  tableLight: "dx-table-light w-full text-xs",
} as const;
