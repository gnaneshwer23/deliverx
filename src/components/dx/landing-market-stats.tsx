import { LandingReveal } from "@/components/dx/landing-motion";
import { LandingContainer, LandingSection } from "@/components/dx/landing-layout";
import { ppClass } from "@/lib/policy-pilot-theme";
import type { LandingMarketStat } from "@/services/landing";

export function LandingMarketStats({ stats }: { stats: LandingMarketStat[] }) {
  return (
    <LandingSection tone="ink" className="relative overflow-hidden !py-20 md:!py-28">
      <div className="landing-pp-glow pointer-events-none absolute inset-0" aria-hidden />
      <LandingContainer className="relative">
        <LandingReveal>
          <p className={ppClass.eyebrow}>By the numbers</p>
          <h2 className={`${ppClass.display} mt-4 text-3xl text-white md:text-4xl`}>
            Proof for operations leaders.
          </h2>
        </LandingReveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {stats.map((s, i) => (
            <LandingReveal key={s.label} delay={i * 0.06}>
              <article className={`${ppClass.cardDark} p-8 md:p-9`}>
                <p className={ppClass.statValue}>{s.value}</p>
                <p className="mt-3 text-base font-medium text-white">{s.label}</p>
                {s.sub ? (
                  <p className="mt-1 text-sm font-light text-white/45">{s.sub}</p>
                ) : null}
              </article>
            </LandingReveal>
          ))}
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
