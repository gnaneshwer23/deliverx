import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { mkt, mktClass } from "@/lib/marketing/landing-theme";

const PLATFORM_PANELS = [
  {
    label: "Command centre",
    title: "Portfolio health at a glance",
    metrics: [
      { label: "Active projects", value: "12", trend: "+2 this quarter" },
      { label: "Delivery confidence", value: "84%", trend: "+3% this week" },
      { label: "Decisions pending", value: "4", trend: "2 urgent" },
    ],
    bars: [52, 68, 61, 74, 70, 82, 84],
  },
  {
    label: "Delivery workspace",
    title: "Sprint and RAID in sync",
    metrics: [
      { label: "Sprint progress", value: "72%", trend: "58 of 80 pts" },
      { label: "Open risks", value: "7", trend: "3 high severity" },
      { label: "Blockers", value: "4", trend: "Oldest: 5 days" },
    ],
    bars: [45, 55, 48, 62, 58, 68, 72],
  },
  {
    label: "Intelligence layer",
    title: "Signals that reach every role",
    metrics: [
      { label: "Live threads", value: "18", trend: "Across 7 roles" },
      { label: "AI proposals", value: "6", trend: "Awaiting approval" },
      { label: "Reports drafted", value: "3", trend: "Ready to publish" },
    ],
    bars: [38, 42, 55, 60, 58, 65, 71],
  },
] as const;

export function MarketingProductSection() {
  return (
    <MarketingSection id="platform" className="border-y border-[var(--mkt-border)] bg-[var(--mkt-s1)]">
      <MarketingContainer>
        <MarketingSectionIntro
          label="Platform overview"
          title={
            <>
              One workspace. <em>Seven perspectives.</em>
            </>
          }
          subtitle="Every role gets a tailored dashboard with KPIs, intelligence feeds, and live team sync, all fed from the same delivery data. No duplicate RAID logs. No status-meeting archaeology."
        />

        <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--mkt-border)] bg-[var(--mkt-s2)] shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
          <div className="flex h-[42px] items-center gap-2 border-b border-[var(--mkt-border)] bg-[var(--mkt-s3)] px-4">
            <span className="size-[9px] rounded-full bg-[#FF5F57]" aria-hidden />
            <span className="size-[9px] rounded-full bg-[#FFBD2E]" aria-hidden />
            <span className="size-[9px] rounded-full bg-[#28CA41]" aria-hidden />
            <span className="ml-2 text-[0.6875rem] font-medium text-[var(--mkt-text3)]">
              DeliverX · Delivery intelligence workspace
            </span>
          </div>

          <div className="grid min-[901px]:grid-cols-[200px_1fr]">
            <aside className="hidden border-r border-[var(--mkt-border)] bg-[var(--mkt-s1)] p-4 min-[901px]:block">
              <p className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--mkt-text3)]">
                Workspaces
              </p>
              <nav className="space-y-1" aria-label="Product navigation preview">
                {["Command centre", "Delivery PM", "Requirements", "Engineering", "QA & release", "Sprint health"].map(
                  (item, i) => (
                    <div
                      key={item}
                      className={`rounded-md px-2.5 py-1.5 text-[0.75rem] ${
                        i === 0
                          ? "bg-[rgba(61,150,96,.15)] font-medium text-[var(--mkt-green-l)]"
                          : "text-[var(--mkt-text3)]"
                      }`}
                    >
                      {item}
                    </div>
                  ),
                )}
              </nav>
            </aside>

            <div className="p-4 md:p-6">
              <div className="grid gap-4 md:grid-cols-3">
                {PLATFORM_PANELS.map((panel) => (
                  <ProductPanel key={panel.label} panel={panel} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Role-specific dashboards",
              desc: "KPIs, feeds, and actions calibrated to how each stakeholder actually works.",
            },
            {
              title: "AI Review Queue",
              desc: "Proposals, reports, and workspace updates require explicit approval before they apply.",
            },
            {
              title: "Connected team sync",
              desc: "One signal updates every relevant dashboard, from BA gap to Sponsor escalation.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[var(--mkt-border)] bg-[var(--mkt-s2)] p-5"
            >
              <h3 className="text-[0.9375rem] font-semibold text-[var(--mkt-text1)]">{item.title}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}

function ProductPanel({
  panel,
}: {
  panel: (typeof PLATFORM_PANELS)[number];
}) {
  return (
    <div className="rounded-xl border border-[var(--mkt-border)] bg-[var(--mkt-s1)] p-4">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--mkt-green-l)]">
        {panel.label}
      </p>
      <p className="mt-1 text-[0.8125rem] font-semibold text-[var(--mkt-text1)]">{panel.title}</p>

      <div className="mt-3 space-y-2">
        {panel.metrics.map((m) => (
          <div
            key={m.label}
            className="flex items-baseline justify-between gap-2 border-b border-[var(--mkt-border)] pb-2 last:border-b-0 last:pb-0"
          >
            <span className="text-[0.65rem] text-[var(--mkt-text3)]">{m.label}</span>
            <div className="text-right">
              <span className={mktClass.kpiValue}>{m.value}</span>
              <p className="text-[0.6rem] text-[var(--mkt-text3)]">{m.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex h-8 items-end gap-0.5">
        {panel.bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              background: i === panel.bars.length - 1 ? mkt.greenL : `rgba(61,150,96,${0.2 + i * 0.07})`,
            }}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
