import type { ReactNode } from "react";
import { mktClass } from "@/lib/marketing/landing-theme";

type ProductMockVariant = "experience" | "launchpad" | "workspace";

const CHROME = {
  experience: {
    product: "Experience",
    accent: "var(--mkt-accent-purple)",
    accentSoft: "rgba(124,58,237,0.08)",
    accentBorder: "rgba(124,58,237,0.22)",
    company: "MediFlow Technologies",
    role: "Product Manager",
    rail: ["Home", "Projects", "Meetings", "Artefacts", "Evidence"],
    panels: [
      { title: "Active project", body: "Patient intake redesign · Sprint 4" },
      { title: "Next activity", body: "Stakeholder alignment brief" },
      { title: "Artefacts", body: "PRD draft · roadmap note" },
    ],
    footer: "Experience Record · provenance retained",
  },
  launchpad: {
    product: "Launchpad",
    accent: "var(--mkt-green-l)",
    accentSoft: "rgba(61,150,96,0.08)",
    accentBorder: "rgba(61,150,96,0.22)",
    company: "Career Intelligence",
    role: "Associate Product Manager",
    rail: ["Readiness", "Roadmap", "CV", "Interview", "Apps"],
    panels: [
      { title: "Readiness source", body: "ScoreRun projection · labelled" },
      { title: "Packaging", body: "CV + portfolio from evidence" },
      { title: "Interview lab", body: "STAR stories · practice notes" },
    ],
    footer: "No unexplained score · source always visible",
  },
  workspace: {
    product: "Professional Workspace",
    accent: "var(--mkt-accent-blue)",
    accentSoft: "rgba(37,99,235,0.08)",
    accentBorder: "rgba(37,99,235,0.22)",
    company: "Delivery project",
    role: "Product delivery",
    rail: ["Overview", "Team", "Tasks", "Meetings", "Decisions"],
    panels: [
      { title: "Today", body: "3 tasks · 1 meeting · 1 decision" },
      { title: "AI teammate", body: "Draft agenda · you approve" },
      { title: "Consent", body: "Observation default OFF" },
    ],
    footer: "AI drafts · humans decide and submit",
  },
} as const;

function ProductChromeFrame({
  variant,
  children,
}: {
  variant: ProductMockVariant;
  children: ReactNode;
}) {
  const cfg = CHROME[variant];
  return (
    <div className="mkt-hub-glow relative">
      <div
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] blur-2xl"
        style={{
          background: `radial-gradient(ellipse at center, ${cfg.accentSoft}, transparent 68%)`,
        }}
        aria-hidden
      />
      <div className="mkt-hub-panel overflow-hidden rounded-[1.35rem] border border-[var(--mkt-border)] bg-[var(--mkt-s1)] shadow-[0_24px_64px_-28px_rgba(13,13,11,0.28)]">
        <div className="flex items-center gap-2 border-b border-[var(--mkt-border)] bg-[var(--mkt-s2)]/80 px-3 py-2.5 sm:px-4">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2 rounded-full bg-[var(--mkt-border-l)]" />
            <span className="size-2 rounded-full bg-[var(--mkt-border-l)]" />
            <span className="size-2 rounded-full bg-[var(--mkt-border-l)]" />
          </span>
          <p
            className={`${mktClass.mono} ml-1 truncate text-[0.6rem] uppercase tracking-[0.12em] text-[var(--mkt-text3)]`}
          >
            deliverx.dev/{variant === "workspace" ? "workspace" : variant}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ProductDashboardMock({ variant }: { variant: ProductMockVariant }) {
  const cfg = CHROME[variant];

  return (
    <ProductChromeFrame variant={variant}>
      <div className="flex min-h-[340px] sm:min-h-[380px]">
        <aside className="hidden w-[108px] shrink-0 flex-col gap-1 border-r border-[var(--mkt-border)] bg-[var(--mkt-s2)]/60 p-2.5 sm:flex">
          <div
            className="mb-2 flex size-7 items-center justify-center rounded-lg text-[0.6rem] font-semibold text-white"
            style={{ background: cfg.accent }}
          >
            DX
          </div>
          {cfg.rail.map((item, i) => (
            <span
              key={item}
              className={`rounded-lg px-2 py-1.5 text-[0.6rem] leading-tight ${
                i === 0
                  ? "bg-white font-medium text-[var(--mkt-text1)] shadow-sm"
                  : "text-[var(--mkt-text3)]"
              }`}
            >
              {item}
            </span>
          ))}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-[var(--mkt-border)] bg-[var(--mkt-s2)]/50 px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={`${mktClass.mono} text-[0.6rem] uppercase tracking-[0.14em]`}
                  style={{ color: cfg.accent }}
                >
                  {cfg.product}
                </p>
                <p
                  className={`mt-1 truncate text-[0.95rem] tracking-tight text-[var(--mkt-text1)] ${mktClass.serif}`}
                >
                  {cfg.company}
                </p>
              </div>
              <span
                className="shrink-0 rounded-full border px-2.5 py-1 text-[0.65rem] font-medium"
                style={{
                  borderColor: cfg.accentBorder,
                  background: cfg.accentSoft,
                  color: cfg.accent,
                }}
              >
                {cfg.role}
              </span>
            </div>
          </div>

          <div className="space-y-3 p-4 sm:p-5">
            <ul className="grid gap-2.5">
              {cfg.panels.map((panel) => (
                <li
                  key={panel.title}
                  className="rounded-xl border border-[var(--mkt-border)] bg-[var(--mkt-s2)]/45 px-3.5 py-3"
                >
                  <p className="text-[0.75rem] font-medium text-[var(--mkt-text1)]">{panel.title}</p>
                  <p className="mt-0.5 text-[0.7rem] leading-snug text-[var(--mkt-text3)]">
                    {panel.body}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--mkt-border)] bg-white px-3.5 py-3 shadow-sm">
              <p className="min-w-0 truncate text-[0.7rem] text-[var(--mkt-text2)]">{cfg.footer}</p>
              <span
                className="shrink-0 rounded-full px-3 py-1.5 text-[0.65rem] font-medium text-white"
                style={{ background: "var(--mkt-green)" }}
              >
                Open
              </span>
            </div>
          </div>
        </div>
      </div>
    </ProductChromeFrame>
  );
}
