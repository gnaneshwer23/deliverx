import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { PROOF_STATS } from "@/lib/marketing/landing-data";

export function MarketingProofSection() {
  return (
    <MarketingSection id="proof" className="border-y border-[#2E2E30] bg-[#111110]">
      <MarketingContainer>
        <MarketingSectionIntro
          label="Why it matters"
          title={
            <>
              Built on <em>delivery reality.</em>
            </>
          }
          subtitle="These are not marketing numbers. They come from conversations with the PMs, BAs, and Sponsors who built their workflows around twelve tools that never talked to each other."
        />
        <div className="mt-12 grid gap-px bg-[#2E2E30] max-[900px]:grid-cols-1 min-[901px]:grid-cols-3">
          {PROOF_STATS.map((stat) => (
            <div key={stat.n} className="bg-[#111110] px-8 py-9">
              <p className="font-[family-name:var(--font-dx-display)] text-[clamp(2.5rem,4vw,3.5rem)] tracking-[-0.04em] text-[#3D9660]">
                {stat.n}
              </p>
              <p className="mt-2 text-[0.9375rem] font-semibold text-[#F0EDE8]">{stat.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#7A7874]">{stat.desc}</p>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
