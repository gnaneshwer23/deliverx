import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { mktClass } from "@/lib/marketing/landing-theme";
import { PROOF_STATS } from "@/lib/marketing/landing-data";

export function MarketingProofSection() {
  return (
    <MarketingSection id="proof" className="border-y border-[var(--mkt-border)] bg-[var(--mkt-s1)]">
      <MarketingContainer>
        <MarketingSectionIntro
          label="Why it matters"
          title={
            <>
              Built on <em>delivery reality.</em>
            </>
          }
          subtitle="These figures come from conversations with PMs, BAs, and Sponsors who spent years stitching together tools that never shared a single source of truth."
        />
        <div className="mt-8 grid gap-px bg-[var(--mkt-border)] max-[900px]:grid-cols-1 min-[901px]:grid-cols-3">
          {PROOF_STATS.map((stat) => (
            <div key={stat.n} className="bg-[var(--mkt-s1)] px-8 py-7">
              <p className={mktClass.statNumber}>{stat.n}</p>
              <p className="mt-2 text-[0.9375rem] font-semibold text-[var(--mkt-text1)]">{stat.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--mkt-text2)]">{stat.desc}</p>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
