import {
  BrainCircuit,
  Check,
  FileBarChart2,
  Globe2,
  ShieldCheck,
  Sparkles,
  Telescope,
} from "lucide-react";
import { LandingReveal } from "@/components/dx/landing-motion";
import {
  LandingContainer,
  LandingDashboardMockup,
  LandingSection,
  SectionIntro,
} from "@/components/dx/landing-layout";
import { ppClass } from "@/lib/policy-pilot-theme";
import { dxClass } from "@/lib/dx-theme";
import type { LandingPageContent } from "@/services/landing";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Governance",
    points: ["RAID & decisions", "Report pipeline", "Alert queue & approvals"],
  },
  {
    icon: Telescope,
    title: "Intelligence",
    points: ["AI assistant", "Digital twin", "Coordination & global patterns"],
  },
] as const;

export function LandingAgents({ agents }: { agents: LandingPageContent["agents"] }) {
  return (
    <LandingSection id="agents" tone="base">
      <LandingContainer>
        <LandingReveal>
          <SectionIntro
            light
            eyebrow="Four agents"
            title={
              <>
                One operations team. <em className="text-[#6ee7c7] not-italic">Zero silos.</em>
              </>
            }
            description="Each agent handles a layer that traditionally requires dozens of tools — wired to the same signals."
          />
        </LandingReveal>

        <div className="grid gap-5 sm:grid-cols-2">
          {agents.map((agent, i) => (
            <LandingReveal key={agent.step} delay={i * 0.05} className="h-full">
              <article className={`${ppClass.cardDark} flex h-full flex-col p-7 md:p-8`}>
                <span className="font-[family-name:var(--font-dx-mono)] text-sm text-[#6ee7c7]">
                  {agent.step}
                </span>
                <h3 className={`${dxClass.display} mt-4 text-xl text-white md:text-2xl`}>
                  {agent.title}
                </h3>
                <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-white/50">
                  {agent.body}
                </p>
              </article>
            </LandingReveal>
          ))}
        </div>
      </LandingContainer>
    </LandingSection>
  );
}

export function LandingPlatform() {
  return (
    <LandingSection id="platform" tone="white" className="border-y border-white/[0.06]">
      <LandingContainer wide>
        <LandingReveal>
          <SectionIntro
            light
            align="center"
            eyebrow="Inside DeliverX"
            title={
              <>
                Your morning view — <em className="text-[#6ee7c7] not-italic">live.</em>
              </>
            }
            description="Portfolio health, alerts, and coaching on one command centre."
          />
        </LandingReveal>

        <div className="mt-4 grid gap-6 lg:grid-cols-12 lg:gap-8">
          <LandingReveal className="lg:col-span-8" delay={0.05}>
            <div className="landing-mock-3d relative">
              <LandingDashboardMockup float />
            </div>
          </LandingReveal>

          <div className="flex flex-col gap-4 lg:col-span-4">
            {PILLARS.map((p, i) => (
              <LandingReveal key={p.title} delay={0.08 + i * 0.06}>
                <div className={`${ppClass.cardDark} p-6`}>
                  <div className="mb-3 flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#6ee7c7]/25 bg-[#6ee7c7]/10">
                      <p.icon size={18} className="text-[#6ee7c7]" strokeWidth={1.5} />
                    </span>
                    <h3 className={`${dxClass.display} text-lg text-white`}>{p.title}</h3>
                  </div>
                  <ul className="space-y-1.5 border-t border-white/[0.08] pt-3">
                    {p.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-center gap-2 text-[13px] font-light text-white/55"
                      >
                        <Check size={13} className="shrink-0 text-[#6ee7c7]" strokeWidth={2.5} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </LandingReveal>
            ))}
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}

export function LandingCapabilities() {
  const items = [
    { label: "AI structure from brief", icon: Sparkles },
    { label: "RAID & steering", icon: ShieldCheck },
    { label: "Auto-drafted reports", icon: FileBarChart2 },
    { label: "Org memory", icon: BrainCircuit },
    { label: "Twin scenarios", icon: Telescope },
    { label: "Cross-org patterns", icon: Globe2 },
  ];

  return (
    <LandingSection id="capabilities" tone="ink" className="relative overflow-hidden">
      <div className="landing-pp-glow pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <LandingContainer className="relative">
        <LandingReveal>
          <SectionIntro
            eyebrow="Built in, not bolted on"
            light
            align="center"
            title={
              <>
                Everything connects to the{" "}
                <em className="text-[#6ee7c7] not-italic">same signals.</em>
              </>
            }
          />
        </LandingReveal>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <li key={item.label}>
              <LandingReveal delay={i * 0.04} className="h-full">
                <div className={`${ppClass.cardDark} flex h-full items-center gap-4 px-5 py-4 transition hover:border-[#6ee7c7]/40`}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#6ee7c7]/30 bg-[#6ee7c7]/10">
                    <item.icon size={18} className="text-[#6ee7c7]" strokeWidth={1.5} />
                  </span>
                  <span className="text-[15px] text-white/90">{item.label}</span>
                </div>
              </LandingReveal>
            </li>
          ))}
        </ul>
      </LandingContainer>
    </LandingSection>
  );
}
