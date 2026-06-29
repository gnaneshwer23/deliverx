import { mktClass } from "@/lib/marketing/landing-theme";
import type { RoleDashboard } from "@/lib/marketing/landing-data";
import { PreviewCard, PreviewLabel } from "./role-preview-chrome";

/** Sparse board memo — narrative-led, no kanban or task lists. */
export function FounderPreview({ role }: { role: RoleDashboard }) {
  return (
    <div data-layout="founder-board-memo" className="space-y-4">
      <PreviewCard className="p-4">
        <PreviewLabel>Board memo · Week 24</PreviewLabel>
        <p className="font-[family-name:var(--font-dx-display)] text-[0.9375rem] leading-relaxed text-[var(--mkt-text1)]">
          Portfolio delivery confidence is{" "}
          <span className="text-[var(--mkt-green-l)]">84%</span>, up 3pts. NHS EHR vendor
          delay threatens Q3 go-live — decision on API budget required this week. Platform v2
          release blocked by 2 critical defects.
        </p>
        <p className="mt-2 text-[0.6875rem] text-[var(--mkt-text3)]">
          AI draft · Awaiting your review before publishing to stakeholders
        </p>
      </PreviewCard>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Runway", value: "14 mo", hint: "Aug 2027", accent: role.accent },
          { label: "Portfolio", value: "10/12", hint: "On track", accent: role.accent },
          { label: "Decisions", value: "4", hint: "2 urgent", accent: "#DC2626" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3 py-2.5"
            style={{ borderTopColor: stat.accent, borderTopWidth: 2 }}
          >
            <div className="text-[0.6rem] font-medium uppercase tracking-[0.06em] text-[var(--mkt-text3)]">
              {stat.label}
            </div>
            <div className={mktClass.kpiValue}>{stat.value}</div>
            <div className="mt-0.5 text-[0.6rem] text-[var(--mkt-text3)]">{stat.hint}</div>
          </div>
        ))}
      </div>

      <PreviewCard>
        <div className="border-b border-[var(--mkt-border)] px-3 py-2">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[var(--mkt-text2)]">
            Decision centre
          </span>
        </div>
        <div className="divide-y divide-[var(--mkt-border)] px-3">
          {role.loopItems.slice(0, 2).map((item) => (
            <div key={item.code} className="flex items-center gap-2 py-2">
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-md font-[family-name:var(--font-mkt-mono)] text-[0.6rem] font-semibold"
                style={{ background: item.bg, color: item.color }}
              >
                {item.code}
              </span>
              <p className="min-w-0 flex-1 text-[0.75rem] text-[var(--mkt-text1)]">{item.status}</p>
            </div>
          ))}
        </div>
      </PreviewCard>
    </div>
  );
}
