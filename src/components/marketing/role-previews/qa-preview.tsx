import type { RoleDashboard } from "@/lib/marketing/landing-data";
import { PreviewCard, PreviewLabel } from "./role-preview-chrome";

const DEFECTS = [
  { id: "BUG-142", severity: "Critical", status: "Fixing" },
  { id: "BUG-167", severity: "Critical", status: "Open" },
  { id: "BUG-158", severity: "Medium", status: "In Review" },
];

/** Release gate summary — critical defects drive the call. */
export function QaPreview({ role }: { role: RoleDashboard }) {
  return (
    <div data-layout="qa-readiness" className="space-y-4">
      <div className="flex items-center gap-6">
        <div
          className="flex size-[120px] shrink-0 flex-col items-center justify-center rounded-full border-8 border-[var(--mkt-border)]"
          style={{ borderColor: role.accent }}
        >
          <span className="font-[family-name:var(--font-dx-display)] text-lg text-[var(--mkt-text1)]">
            Hold
          </span>
          <span className="text-[0.6rem] uppercase tracking-[0.06em] text-[var(--mkt-text3)]">
            Conditional
          </span>
        </div>

        <div className="flex-1 space-y-2">
          <PreviewLabel>Release gate</PreviewLabel>
          <p className="text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">
            Conditional go: 2 critical defects blocking full release. UAT due May 22.
          </p>
          <div className="flex gap-2">
            {[
              { label: "Critical", count: 2, color: "#DC2626" },
              { label: "Medium", count: 8, color: "#D97706" },
              { label: "Low", count: 13, color: "#9CA3AF" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-1 rounded-md border border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-2 py-1.5 text-center"
              >
                <div className="font-[family-name:var(--font-dx-display)] text-lg" style={{ color: s.color }}>
                  {s.count}
                </div>
                <div className="text-[0.6rem] text-[var(--mkt-text3)]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PreviewCard>
        <div className="border-b border-[var(--mkt-border)] px-3 py-2">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[var(--mkt-text2)]">
            Defect board
          </span>
        </div>
        <div className="divide-y divide-[var(--mkt-border)]">
          {DEFECTS.map((bug) => (
            <div key={bug.id} className="flex items-center gap-3 px-3 py-2">
              <span className="font-[family-name:var(--font-mkt-mono)] text-[0.6875rem] text-[var(--mkt-text1)]">
                {bug.id}
              </span>
              <span
                className="rounded px-1.5 py-0.5 text-[0.6rem] font-semibold"
                style={{
                  background: bug.severity === "Critical" ? "rgba(220,38,38,.1)" : "rgba(217,119,6,.1)",
                  color: bug.severity === "Critical" ? "#DC2626" : "#D97706",
                }}
              >
                {bug.severity}
              </span>
              <span className="ml-auto text-[0.6875rem] text-[var(--mkt-text3)]">{bug.status}</span>
            </div>
          ))}
        </div>
      </PreviewCard>
    </div>
  );
}
