"use client";

import { useState } from "react";
import { MarketingBadge } from "@/components/marketing/marketing-badge";
import type { RoleDashboard } from "@/lib/marketing/landing-data";
import { PreviewCard, PreviewLabel } from "./role-preview-chrome";

const MILESTONES = [
  { name: "Discovery", status: "done" as const },
  { name: "Build", status: "active" as const },
  { name: "UAT", status: "pending" as const },
  { name: "Go-live", status: "at-risk" as const },
];

const TABS = ["Milestones", "RAID", "Governance"] as const;

/** Milestone tracker + governance tabs — delivery control room. */
export function PmPreview({ role }: { role: RoleDashboard }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div data-layout="pm-milestones" className="space-y-4">
      <PreviewCard className="p-4">
        <PreviewLabel>Milestone tracker · NHS EHR</PreviewLabel>
        <div className="flex items-center gap-1">
          {MILESTONES.map((m, i) => (
            <div key={m.name} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-center">
                {i > 0 ? (
                  <div
                    className="h-0.5 flex-1"
                    style={{
                      background:
                        m.status === "pending"
                          ? "var(--mkt-border)"
                          : m.status === "at-risk"
                            ? "#FCA5A5"
                            : role.accent,
                    }}
                  />
                ) : (
                  <div className="flex-1" />
                )}
                <div
                  className="size-3 shrink-0 rounded-full border-2"
                  style={{
                    borderColor:
                      m.status === "done"
                        ? role.accent
                        : m.status === "active"
                          ? role.accent
                          : m.status === "at-risk"
                            ? "#DC2626"
                            : "var(--mkt-border-l)",
                    background:
                      m.status === "done" || m.status === "active" ? role.accent : "var(--mkt-s1)",
                  }}
                />
                {i < MILESTONES.length - 1 ? (
                  <div
                    className="h-0.5 flex-1"
                    style={{
                      background:
                        m.status === "done" ? role.accent : "var(--mkt-border)",
                    }}
                  />
                ) : (
                  <div className="flex-1" />
                )}
              </div>
              <span
                className={`text-[0.6rem] font-medium ${
                  m.status === "at-risk" ? "text-[var(--mkt-stat-down)]" : "text-[var(--mkt-text2)]"
                }`}
              >
                {m.name}
              </span>
            </div>
          ))}
        </div>
      </PreviewCard>

      <div className="flex gap-1 border-b border-[var(--mkt-border)]">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`px-3 py-1.5 text-[0.6875rem] font-medium transition ${
              i === activeTab
                ? "border-b-2 text-[var(--mkt-text1)]"
                : "text-[var(--mkt-text3)] hover:text-[var(--mkt-text2)]"
            }`}
            style={i === activeTab ? { borderColor: role.accent } : undefined}
            aria-pressed={i === activeTab}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {activeTab === 0
          ? role.feeds.map((feed) => (
              <div
                key={feed.text}
                className="flex gap-2.5 rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3 py-2"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: feed.dot }} />
                <div>
                  <p className="text-[0.8125rem] leading-snug text-[var(--mkt-text1)]">{feed.text}</p>
                  <p className="mt-0.5 text-[0.6875rem] text-[var(--mkt-text3)]">{feed.from}</p>
                </div>
              </div>
            ))
          : activeTab === 1
            ? role.loopItems.slice(0, 3).map((item) => (
                <div
                  key={`${item.code}-${item.name}`}
                  className="flex items-center gap-3 rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3 py-2"
                >
                  <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-md font-[family-name:var(--font-mkt-mono)] text-[0.6rem] font-semibold"
                    style={{ background: item.bg, color: item.color }}
                  >
                    {item.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.8125rem] font-medium text-[var(--mkt-text1)]">{item.name}</p>
                    <p className="truncate text-[0.6875rem] text-[var(--mkt-text3)]">{item.status}</p>
                  </div>
                  <MarketingBadge tone={item.badgeCls}>{item.badge}</MarketingBadge>
                </div>
              ))
            : (
                <div className="rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3 py-3 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">
                  Weekly status pack drafted from live RAID and milestone data. Review and publish from
                  the AI Review Queue before it goes to stakeholders.
                </div>
              )}
      </div>

      <div className="flex flex-wrap gap-2">
        {role.loopItems.slice(0, 3).map((item) => (
          <MarketingBadge key={item.code} tone={item.badgeCls}>
            {item.code}: {item.badge}
          </MarketingBadge>
        ))}
      </div>
    </div>
  );
}
