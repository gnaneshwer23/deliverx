import type { RoleDashboard } from "@/lib/marketing/landing-data";
import { PreviewLabel } from "./role-preview-chrome";

const COLUMNS = [
  {
    title: "Now",
    color: "#A78BFA",
    items: [
      { name: "AI Workspace Gen", rice: 280, sprint: "S4–6" },
      { name: "Meeting Intelligence", rice: 250, sprint: "S5" },
    ],
  },
  {
    title: "Next",
    color: "#60A5FA",
    items: [{ name: "Portfolio Dashboard", rice: 140, sprint: "Q3" }],
  },
  {
    title: "Later",
    color: "#9CA3AF",
    items: [
      { name: "Mobile approvals", rice: 95, sprint: "Q4" },
      { name: "SSO / SAML", rice: 80, sprint: "2027" },
    ],
  },
];

/** Roadmap kanban — Now · Next · Later columns. */
export function ProductPreview({ role }: { role: RoleDashboard }) {
  return (
    <div data-layout="product-roadmap" className="space-y-3">
      <PreviewLabel>Product roadmap · RICE scored</PreviewLabel>
      <div className="grid grid-cols-3 gap-2">
        {COLUMNS.map((col) => (
          <div
            key={col.title}
            className="rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)]"
          >
            <div
              className="border-b border-[var(--mkt-border)] px-2.5 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.06em]"
              style={{ color: col.color }}
            >
              {col.title}
            </div>
            <div className="space-y-2 p-2">
              {col.items.map((item) => (
                <div
                  key={item.name}
                  className="rounded-md border border-[var(--mkt-border)] bg-[var(--mkt-s1)] p-2"
                >
                  <p className="text-[0.75rem] font-medium leading-snug text-[var(--mkt-text1)]">
                    {item.name}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[0.6rem] text-[var(--mkt-text3)]">
                    <span>RICE {item.rice}</span>
                    <span>{item.sprint}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3 py-2">
        {[
          { label: "NPS", value: "52", target: "target 60" },
          { label: "Retention", value: "Watch", target: "90-day" },
          { label: "Churn", value: "3%", target: "+0.5%" },
        ].map((m) => (
          <div key={m.label} className="flex-1 text-center">
            <div className="text-[0.6rem] uppercase tracking-[0.06em] text-[var(--mkt-text3)]">
              {m.label}
            </div>
            <div
              className="font-[family-name:var(--font-dx-display)] text-lg"
              style={{ color: role.accent }}
            >
              {m.value}
            </div>
            <div className="text-[0.6rem] text-[var(--mkt-text3)]">{m.target}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
