import { MarketingBadge } from "@/components/marketing/marketing-badge";
import type { RoleDashboard } from "@/lib/marketing/landing-data";
import { PreviewCard, PreviewLabel } from "./role-preview-chrome";

const GITHUB_ACTIVITY = [
  { type: "merge", text: "Merged PR #421 · Reports API", time: "2h ago" },
  { type: "review", text: "Review requested · PR #424", time: "4h ago" },
  { type: "commit", text: "3 commits on feature/auth-sync", time: "6h ago" },
];

const STORY_STATUS: Record<string, "badge-g" | "badge-a" | "badge-n"> = {
  Done: "badge-g",
  "In Review": "badge-a",
  Blocked: "badge-a",
};

/** Story list + GitHub activity — no budget or financial data. */
export function EngineerPreview({ role }: { role: RoleDashboard }) {
  return (
    <div data-layout="engineer-stories" className="space-y-4">
      <PreviewCard>
        <div className="border-b border-[var(--mkt-border)] px-3 py-2">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--mkt-text3)]">
            My stories · Sprint 24
          </p>
        </div>
        <div className="divide-y divide-[var(--mkt-border)]">
          {role.feeds.map((feed) => {
            const statusMatch = feed.from.match(/^(Done|In Review|Blocked)/);
            const status = statusMatch?.[1] ?? "In Review";
            return (
              <div key={feed.text} className="flex items-start gap-2 px-3 py-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: feed.dot }} />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.8125rem] leading-snug text-[var(--mkt-text1)]">{feed.text}</p>
                  <p className="mt-0.5 text-[0.6875rem] text-[var(--mkt-text3)]">{feed.from}</p>
                </div>
                <MarketingBadge tone={STORY_STATUS[status] ?? "badge-n"}>{status}</MarketingBadge>
              </div>
            );
          })}
        </div>
      </PreviewCard>

      <PreviewCard className="p-3">
        <PreviewLabel>GitHub activity</PreviewLabel>
        <div className="space-y-2">
          {GITHUB_ACTIVITY.map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded text-[0.55rem] font-bold"
                style={{
                  background:
                    item.type === "merge"
                      ? "rgba(61,150,96,.15)"
                      : item.type === "review"
                        ? "rgba(96,165,250,.15)"
                        : "rgba(156,163,175,.15)",
                  color:
                    item.type === "merge"
                      ? "#3D9660"
                      : item.type === "review"
                        ? "#60A5FA"
                        : "#6B7280",
                }}
              >
                {item.type === "merge" ? "⎇" : item.type === "review" ? "◎" : "●"}
              </span>
              <p className="min-w-0 flex-1 text-[0.75rem] text-[var(--mkt-text1)]">{item.text}</p>
              <span className="shrink-0 text-[0.6rem] text-[var(--mkt-text3)]">{item.time}</span>
            </div>
          ))}
        </div>
      </PreviewCard>

      <div className="flex gap-2">
        <div className="flex-1 rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3 py-2 text-center">
          <div className="text-[0.6rem] uppercase text-[var(--mkt-text3)]">Coverage</div>
          <div className="font-[family-name:var(--font-dx-display)] text-xl" style={{ color: role.accent }}>
            87%
          </div>
        </div>
        <div className="flex-1 rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3 py-2 text-center">
          <div className="text-[0.6rem] uppercase text-[var(--mkt-text3)]">Blocked</div>
          <div className="font-[family-name:var(--font-dx-display)] text-xl text-[var(--mkt-stat-down)]">
            1
          </div>
        </div>
      </div>
    </div>
  );
}
