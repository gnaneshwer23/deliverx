import type { ReactNode } from "react";
import { MarketingBadge } from "@/components/marketing/marketing-badge";
import { mkt, mktClass, mktStat } from "@/lib/marketing/landing-theme";
import type { RoleDashboard } from "@/lib/marketing/landing-data";

const DELTA_CLASS: Record<string, string> = {
  up: "text-[var(--mkt-stat-up)]",
  dn: "text-[var(--mkt-stat-down)]",
  warn: "text-[var(--mkt-stat-warn)]",
  "": "text-[var(--mkt-text3)]",
};

const SPARK_HEIGHTS = [42, 58, 48, 72, 65, 78, 84];

export function DashboardPreview({
  role,
  accentBorder,
  showSparkline = true,
}: {
  role: RoleDashboard;
  accentBorder?: string;
  showSparkline?: boolean;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-[var(--mkt-s1)] shadow-[0_12px_40px_rgba(0,0,0,.6)] transition duration-400"
      style={{ borderColor: accentBorder ?? `${role.accent}55` }}
      role="img"
      aria-label={`${role.title} dashboard preview`}
    >
      <div className="flex h-[38px] items-center gap-2 border-b border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3.5">
        <span className="size-[9px] rounded-full bg-[#FF5F57]" aria-hidden />
        <span className="size-[9px] rounded-full bg-[#FFBD2E]" aria-hidden />
        <span className="size-[9px] rounded-full bg-[#28CA41]" aria-hidden />
        <span className="ml-2 text-[0.6875rem] font-medium text-[var(--mkt-text3)]">{role.title}</span>
        <MarketingBadge tone="badge-g" className="ml-auto !text-[0.6rem]">
          {role.badge}
        </MarketingBadge>
      </div>
      <div className="p-4">
        <div className="mb-3 grid grid-cols-3 gap-2">
          {role.kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-2.5 py-2.5"
              style={{ borderTopColor: role.accent, borderTopWidth: 2 }}
            >
              <div className="text-[0.6rem] font-medium uppercase tracking-[0.06em] text-[var(--mkt-text3)]">
                {kpi.label}
              </div>
              <div className={mktClass.kpiValue}>{kpi.val}</div>
              <div className={`mt-1 text-[0.65rem] font-medium ${DELTA_CLASS[kpi.dir] ?? DELTA_CLASS[""]}`}>
                {kpi.delta}
              </div>
            </div>
          ))}
        </div>

        {showSparkline ? (
          <div className="mb-3 rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3 py-2.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.06em] text-[var(--mkt-text2)]">
                Delivery confidence
              </span>
              <span className="text-[0.65rem] font-medium text-[var(--mkt-stat-up)]">+3% this week</span>
            </div>
            <div className="flex h-10 items-end gap-1">
              {SPARK_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${h}%`,
                    background:
                      i === SPARK_HEIGHTS.length - 1
                        ? mkt.greenL
                        : `rgba(61,150,96,${0.25 + i * 0.08})`,
                  }}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid gap-2 md:grid-cols-2">
          <DashCard title={role.feedTitle} accent={role.accent} pulse>
            {role.feeds.map((feed) => (
              <div key={feed.text} className="flex gap-2.5 py-2 first:pt-0 last:pb-0">
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full"
                  style={{ background: feed.dot }}
                  aria-hidden
                />
                <div>
                  <p className="text-[0.8125rem] leading-snug text-[var(--mkt-text1)]">{feed.text}</p>
                  <p className="mt-0.5 text-[0.6875rem] text-[var(--mkt-text3)]">{feed.from}</p>
                </div>
              </div>
            ))}
          </DashCard>
          <DashCard title={role.loopTitle}>
            {role.loopItems.map((item) => (
              <div
                key={`${item.name}-${item.status}`}
                className="flex items-center gap-2 py-2 first:pt-0 last:pb-0"
              >
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-md font-[family-name:var(--font-mkt-mono)] text-[0.6rem] font-semibold"
                  style={{ background: item.bg, color: item.color }}
                >
                  {item.code}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.75rem] font-medium text-[var(--mkt-text1)]">{item.name}</p>
                  <p className="text-[0.6875rem] leading-snug text-[var(--mkt-text3)]">{item.status}</p>
                </div>
                <MarketingBadge tone={item.badgeCls}>{item.badge}</MarketingBadge>
              </div>
            ))}
          </DashCard>
        </div>
      </div>
    </div>
  );
}

function DashCard({
  title,
  accent,
  pulse,
  children,
}: {
  title: string;
  accent?: string;
  pulse?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)]">
      <div className="flex items-center gap-2 border-b border-[var(--mkt-border)] px-3 py-2">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[var(--mkt-text2)]">
          {title}
        </span>
        {pulse ? (
          <span
            className="size-1.5 animate-pulse rounded-full"
            style={{ background: accent ?? mktStat.accent }}
            aria-hidden
          />
        ) : null}
      </div>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}
