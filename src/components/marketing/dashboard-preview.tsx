import type { ReactNode } from "react";
import { MarketingBadge } from "@/components/marketing/marketing-badge";
import type { RoleDashboard } from "@/lib/marketing/landing-data";

const DELTA_CLASS: Record<string, string> = {
  up: "text-[#3D9660]",
  dn: "text-[#DC2626]",
  warn: "text-[#D97706]",
  "": "text-[#7A7874]",
};

export function DashboardPreview({
  role,
  accentBorder,
}: {
  role: RoleDashboard;
  accentBorder?: string;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-[#111110] shadow-[0_12px_40px_rgba(0,0,0,.6)] transition duration-400"
      style={{ borderColor: accentBorder ?? `${role.accent}44` }}
    >
      <div className="flex h-[38px] items-center gap-2 border-b border-[#2E2E30] bg-[#18181A] px-3.5">
        <span className="size-[9px] rounded-full bg-[#FF5F57]" aria-hidden />
        <span className="size-[9px] rounded-full bg-[#FFBD2E]" aria-hidden />
        <span className="size-[9px] rounded-full bg-[#28CA41]" aria-hidden />
        <span className="ml-2 text-[0.6875rem] font-medium text-[#7A7874]">{role.title}</span>
        <MarketingBadge tone="badge-g" className="ml-auto !text-[0.6rem]">
          {role.badge}
        </MarketingBadge>
      </div>
      <div className="p-4">
        <div className="mb-3 grid grid-cols-3 gap-2">
          {role.kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg border border-[#2E2E30] bg-[#18181A] px-2.5 py-2.5"
            >
              <div className="text-[0.6rem] font-medium uppercase tracking-[0.06em] text-[#7A7874]">
                {kpi.label}
              </div>
              <div
                className="mt-1 font-[family-name:var(--font-dx-display)] text-xl leading-none tracking-[-0.02em] text-[#F0EDE8]"
                style={{ color: role.accent }}
              >
                {kpi.val}
              </div>
              <div className={`mt-1 text-[0.65rem] ${DELTA_CLASS[kpi.dir] ?? DELTA_CLASS[""]}`}>
                {kpi.delta}
              </div>
            </div>
          ))}
        </div>
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
                  <p className="text-[0.8125rem] leading-snug text-[#F0EDE8]">{feed.text}</p>
                  <p className="mt-0.5 text-[0.6875rem] text-[#7A7874]">{feed.from}</p>
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
                  className="flex size-6 shrink-0 items-center justify-center rounded-md text-sm"
                  style={{ background: item.bg, color: item.color }}
                >
                  {item.sym}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.75rem] font-medium text-[#F0EDE8]">{item.name}</p>
                  <p className="text-[0.6875rem] leading-snug text-[#7A7874]">{item.status}</p>
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
    <div className="rounded-lg border border-[#2E2E30] bg-[#18181A]">
      <div className="flex items-center gap-2 border-b border-[#2E2E30] px-3 py-2">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#B8B5AF]">
          {title}
        </span>
        {pulse ? (
          <span
            className="size-1.5 rounded-full animate-pulse"
            style={{ background: accent }}
            aria-hidden
          />
        ) : null}
      </div>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}
