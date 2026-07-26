import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { mktClass } from "@/lib/marketing/landing-theme";
import { PROOF_STATS } from "@/lib/marketing/landing-data";

export function MarketingProofSection() {
  return (
    <MarketingSection id="proof" tone="muted">
      <MarketingContainer>
        <MarketingSectionIntro
          label="Why it matters"
          title={
            <>
              Built on <em>delivery reality.</em>
            </>
          }
          subtitle="Platform capabilities from the current pilot, not industry survey statistics. Example dashboards on this page use NHS EHR programme data."
        />
        <div className="mt-8 grid gap-4 max-[900px]:grid-cols-1 min-[901px]:grid-cols-3">
          {PROOF_STATS.map((stat) => (
            <div
              key={stat.n}
              className="mkt-card mkt-card-lift rounded-2xl p-8 text-center md:text-left"
            >
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
