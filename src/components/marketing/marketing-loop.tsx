import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { LOOP_SENDS, ROLES, THREAD_CALLOUTS } from "@/lib/marketing/landing-data";

const THREAD_DOT: Record<string, string> = {
  red: "#DC2626",
  amber: "#D97706",
  green: "#3D9660",
};

export function MarketingLoopSection() {
  return (
    <MarketingSection id="loop" className="!pb-0">
      <MarketingContainer>
        <MarketingSectionIntro
          label="The collaborative loop"
          title={
            <>
              One signal feeds <em>every</em> role.
            </>
          }
          subtitle="When a BA resolves a requirement gap, the engineer's board updates. When QA logs a defect, the PM's release confidence drops. When the Sponsor approves a budget, the PM's tracker reflects it. No status meetings. No duplicate RAID logs."
        />
      </MarketingContainer>

      <div className="mt-12 grid grid-cols-2 gap-0 border-y border-[#2E2E30] max-[600px]:grid-cols-2 min-[901px]:grid-cols-7">
        {LOOP_SENDS.map((entry) => {
          const role = ROLES[entry.role];
          return (
            <div
              key={entry.role}
              className="border-b border-[#2E2E30] px-4 py-6 text-center min-[601px]:border-r min-[901px]:border-b-0 last:min-[901px]:border-r-0"
            >
              <div
                className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl border text-lg"
                style={{
                  background: role.accentBg,
                  borderColor: `${role.accent}44`,
                  color: role.accent,
                }}
              >
                {role.code}
              </div>
              <p className="text-sm font-semibold text-[#F0EDE8]">{role.name}</p>
              <p className="mt-1 text-[0.6875rem] leading-snug text-[#7A7874]">{role.tagline}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-0 border-b border-[#2E2E30] max-[900px]:grid-cols-1 min-[901px]:grid-cols-7">
        {LOOP_SENDS.map((entry) => {
          const role = ROLES[entry.role];
          return (
            <div
              key={`sends-${entry.role}`}
              className="border-b border-[#2E2E30] px-3 py-4 min-[601px]:border-r min-[901px]:border-b-0 last:min-[901px]:border-r-0"
            >
              <p
                className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.08em]"
                style={{ color: role.accent }}
              >
                Sends →
              </p>
              <div className="space-y-1.5">
                {entry.sends.map((item) => (
                  <p
                    key={item}
                    className="text-[0.6875rem] leading-snug text-[#B8B5AF]"
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
              className="rounded-[10px] border border-[#2E2E30] bg-[#18181A] p-6"
            >
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ background: THREAD_DOT[thread.tone] }}
                  aria-hidden
                />
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#7A7874]">
                  Live thread
                </span>
              </div>
              <p className="mb-1.5 text-[0.9375rem] font-semibold text-[#F0EDE8]">
                {thread.title}
              </p>
              <p className="text-[0.8125rem] leading-relaxed text-[#7A7874]">{thread.body}</p>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
