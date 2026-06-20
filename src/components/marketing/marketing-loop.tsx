import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { LOOP_SENDS, ROLES, THREAD_CALLOUTS } from "@/lib/marketing/landing-data";

const THREAD_DOT: Record<string, string> = {
  red: "#F87171",
  amber: "#FBBF24",
  green: "#6EE7B7",
};

export function MarketingLoopSection() {
  return (
    <MarketingSection id="loop" className="!pb-0">
      <MarketingContainer>
        <MarketingSectionIntro
          label="Team needs"
          title={
            <>
              One signal feeds <em>every</em> role.
            </>
          }
          subtitle="When a BA closes a requirement gap, the engineer's board updates. When QA logs a defect, the PM's release confidence drops. When the Sponsor approves a budget, the delivery tracker reflects it — automatically."
        />
      </MarketingContainer>

      <div className="mt-12 grid grid-cols-2 gap-0 border-y border-[var(--mkt-border)] max-[600px]:grid-cols-2 min-[901px]:grid-cols-7">
        {LOOP_SENDS.map((entry) => {
          const role = ROLES[entry.role];
          return (
            <div
              key={entry.role}
              className="border-b border-[var(--mkt-border)] px-4 py-6 text-center min-[601px]:border-r min-[901px]:border-b-0 last:min-[901px]:border-r-0"
            >
              <div
                className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl border font-[family-name:var(--font-mkt-mono)] text-xs font-semibold"
                style={{
                  background: role.accentBg,
                  borderColor: `${role.accent}55`,
                  color: role.accent,
                }}
              >
                {role.code}
              </div>
              <p className="text-sm font-semibold text-[var(--mkt-text1)]">{role.name}</p>
              <p className="mt-1 text-[0.6875rem] leading-snug text-[var(--mkt-text3)]">{role.tagline}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-0 border-b border-[var(--mkt-border)] max-[900px]:grid-cols-1 min-[901px]:grid-cols-7">
        {LOOP_SENDS.map((entry) => {
          const role = ROLES[entry.role];
          return (
            <div
              key={`sends-${entry.role}`}
              className="border-b border-[var(--mkt-border)] px-3 py-4 min-[601px]:border-r min-[901px]:border-b-0 last:min-[901px]:border-r-0"
            >
              <p
                className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.08em]"
                style={{ color: role.accent }}
              >
                Sends to
              </p>
              <div className="space-y-1.5">
                {entry.sends.map((item) => (
                  <p
                    key={item}
                    className="text-[0.6875rem] leading-snug text-[var(--mkt-text2)]"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <MarketingContainer className="py-12 md:py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {THREAD_CALLOUTS.map((thread) => (
            <div
              key={thread.title}
              className="rounded-[10px] border border-[var(--mkt-border)] bg-[var(--mkt-s2)] p-6"
            >
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ background: THREAD_DOT[thread.tone] }}
                  aria-hidden
                />
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[var(--mkt-text3)]">
                  Live thread
                </span>
              </div>
              <p className="mb-1.5 text-[0.9375rem] font-semibold text-[var(--mkt-text1)]">
                {thread.title}
              </p>
              <p className="text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">{thread.body}</p>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
