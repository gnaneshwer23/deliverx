import type { RoleDashboard } from "@/lib/marketing/landing-data";
import { PreviewCard, PreviewLabel } from "./role-preview-chrome";

const BURNDOWN_IDEAL = [80, 72, 64, 56, 48, 40, 32, 24];
const BURNDOWN_ACTUAL = [80, 75, 70, 68, 62, 58, 58, 58];

/** Burndown chart + impediment board. */
export function ScrumPreview({ role }: { role: RoleDashboard }) {
  const maxPts = 80;

  return (
    <div data-layout="scrum-burndown" className="space-y-4">
      <PreviewCard className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--mkt-text3)]">
            Sprint burndown · 58 / 80 pts
          </p>
          <span className="text-[0.6875rem] font-medium text-[var(--mkt-stat-warn)]">Behind ideal</span>
        </div>
        <div className="relative h-28">
          <svg className="h-full w-full" viewBox="0 0 280 100" preserveAspectRatio="none" aria-hidden>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="280"
                y2={y}
                stroke="var(--mkt-border)"
                strokeWidth="0.5"
              />
            ))}
            {/* Ideal line */}
            <polyline
              fill="none"
              stroke="var(--mkt-text3)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              points={BURNDOWN_IDEAL.map((v, i) => {
                const x = (i / (BURNDOWN_IDEAL.length - 1)) * 280;
                const y = 100 - (v / maxPts) * 100;
                return `${x},${y}`;
              }).join(" ")}
            />
            {/* Actual line */}
            <polyline
              fill="none"
              stroke={role.accent}
              strokeWidth="2"
              points={BURNDOWN_ACTUAL.map((v, i) => {
                const x = (i / (BURNDOWN_ACTUAL.length - 1)) * 280;
                const y = 100 - (v / maxPts) * 100;
                return `${x},${y}`;
              }).join(" ")}
            />
          </svg>
          <div className="mt-1 flex justify-between text-[0.55rem] text-[var(--mkt-text3)]">
            <span>Day 1</span>
            <span>Day 8</span>
          </div>
        </div>
        <div className="mt-2 flex gap-4 text-[0.6rem]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 border-t border-dashed border-[var(--mkt-text3)]" />
            Ideal
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4" style={{ background: role.accent }} />
            Actual
          </span>
        </div>
      </PreviewCard>

      <PreviewCard>
        <div className="border-b border-[var(--mkt-border)] px-3 py-2">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[var(--mkt-text2)]">
            Impediment board
          </span>
        </div>
        <div className="divide-y divide-[var(--mkt-border)] px-3">
          {role.feeds.map((feed) => (
            <div key={feed.text} className="flex gap-2 py-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: feed.dot }} />
              <div>
                <p className="text-[0.8125rem] leading-snug text-[var(--mkt-text1)]">{feed.text}</p>
                <p className="mt-0.5 text-[0.6875rem] text-[var(--mkt-text3)]">{feed.from}</p>
              </div>
            </div>
          ))}
        </div>
      </PreviewCard>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3 py-2 text-center">
          <div className="text-[0.6rem] uppercase text-[var(--mkt-text3)]">Team health</div>
          <div className="font-[family-name:var(--font-dx-display)] text-xl" style={{ color: role.accent }}>
            8.1
          </div>
        </div>
        <div className="rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3 py-2 text-center">
          <div className="text-[0.6rem] uppercase text-[var(--mkt-text3)]">Blockers</div>
          <div className="font-[family-name:var(--font-dx-display)] text-xl text-[var(--mkt-stat-down)]">
            3
          </div>
        </div>
      </div>
    </div>
  );
}
