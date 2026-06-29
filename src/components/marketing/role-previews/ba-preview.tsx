import type { RoleDashboard } from "@/lib/marketing/landing-data";
import { PreviewCard, PreviewLabel } from "./role-preview-chrome";

const MATRIX_ROWS = [
  { req: "FR-001", story: "US-12", status: "linked" as const },
  { req: "FR-003", story: "US-18", status: "gap" as const },
  { req: "FR-004", story: "US-22", status: "partial" as const },
  { req: "FR-006", story: "—", status: "missing" as const },
  { req: "FR-008", story: "US-31", status: "linked" as const },
];

const STATUS_CELL: Record<string, { symbol: string; color: string; bg: string }> = {
  linked: { symbol: "✓", color: "#3D9660", bg: "rgba(61,150,96,.12)" },
  partial: { symbol: "◐", color: "#D97706", bg: "rgba(217,119,6,.12)" },
  gap: { symbol: "!", color: "#DC2626", bg: "rgba(220,38,38,.1)" },
  missing: { symbol: "—", color: "#9CA3AF", bg: "rgba(156,163,175,.1)" },
};

/** Traceability matrix hero — requirements ↔ stories grid. */
export function BaPreview({ role }: { role: RoleDashboard }) {
  return (
    <div data-layout="ba-traceability" className="space-y-4">
      <PreviewCard>
        <div className="flex items-center justify-between border-b border-[var(--mkt-border)] px-3 py-2">
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--mkt-text3)]">
            Traceability matrix
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[0.6rem] font-semibold"
            style={{ background: role.accentBg, color: role.accent }}
          >
            78% coverage
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.6875rem]">
            <thead>
              <tr className="border-b border-[var(--mkt-border)] text-left text-[var(--mkt-text3)]">
                <th className="px-3 py-2 font-medium">Requirement</th>
                <th className="px-3 py-2 font-medium">User story</th>
                <th className="px-3 py-2 font-medium">Link</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {MATRIX_ROWS.map((row) => {
                const cell = STATUS_CELL[row.status];
                return (
                  <tr key={row.req} className="border-b border-[var(--mkt-border)] last:border-b-0">
                    <td className="px-3 py-2 font-[family-name:var(--font-mkt-mono)] text-[var(--mkt-text1)]">
                      {row.req}
                    </td>
                    <td className="px-3 py-2 font-[family-name:var(--font-mkt-mono)] text-[var(--mkt-text2)]">
                      {row.story}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-flex size-5 items-center justify-center rounded font-semibold"
                        style={{ background: cell.bg, color: cell.color }}
                      >
                        {cell.symbol}
                      </span>
                    </td>
                    <td className="px-3 py-2 capitalize text-[var(--mkt-text3)]">{row.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PreviewCard>

      <div className="grid gap-2 md:grid-cols-2">
        <PreviewCard>
          <div className="border-b border-[var(--mkt-border)] px-3 py-2">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[var(--mkt-text2)]">
              Clarification gaps
            </span>
          </div>
          <div className="px-3 py-2">
            {role.feeds.slice(0, 2).map((feed) => (
              <div key={feed.text} className="flex gap-2 py-1.5">
                <span className="mt-1 size-1.5 shrink-0 rounded-full" style={{ background: feed.dot }} />
                <p className="text-[0.75rem] leading-snug text-[var(--mkt-text1)]">{feed.text}</p>
              </div>
            ))}
          </div>
        </PreviewCard>
        <PreviewCard className="flex flex-col justify-center p-4 text-center">
          <div className="text-[0.6rem] uppercase tracking-[0.06em] text-[var(--mkt-text3)]">
            Requirements approved
          </div>
          <div className="font-[family-name:var(--font-dx-display)] text-3xl text-[var(--mkt-text1)]">
            22<span className="text-lg text-[var(--mkt-text3)]">/46</span>
          </div>
        </PreviewCard>
      </div>
    </div>
  );
}
