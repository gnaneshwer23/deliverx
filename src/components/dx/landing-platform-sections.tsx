import {
  BrainCircuit,
  Check,
  FileBarChart2,
  FolderKanban,
  Globe2,
  ShieldCheck,
  Sparkles,
  Telescope,
} from "lucide-react";
import {
  LandingContainer,
  LandingDashboardMockup,
  LandingSection,
  SectionIntro,
} from "@/components/dx/landing-layout";
import { dxClass } from "@/lib/dx-theme";

const JOURNEY = [
  {
    step: "01",
    title: "Start from the brief",
    body: "Paste or upload your business case. AI reviews scope and generates structure — workstreams, RAID, milestones.",
  },
  {
    step: "02",
    title: "Run delivery",
    body: "Tasks, standups, and velocity feed one command centre. See health, blockers, and what needs attention today.",
  },
  {
    step: "03",
    title: "Govern with confidence",
    body: "RAID, decisions, and reports stay linked. AI proposes changes; your team approves before anything is applied.",
  },
  {
    step: "04",
    title: "Close and compound",
    body: "Publish to stakeholders, capture lessons, and carry intelligence into the next programme.",
  },
] as const;

const PILLARS = [
  {
    icon: FolderKanban,
    title: "Delivery",
    points: ["Project command centre", "Tasks & standups", "Capacity & benefits"],
  },
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

export function LandingJourney() {
  return (
    <LandingSection id="how" tone="base">
      <LandingContainer>
        <SectionIntro
          eyebrow="How it works"
          title={
            <>
              Four moves. <em className="text-[#1C4A2E] not-italic">One workspace.</em>
            </>
          }
          description="No tool-hopping — the same system carries you from business case to closure."
        />

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {JOURNEY.map((item, i) => (
            <li
              key={item.step}
              className="group relative flex flex-col border border-[#E4E4DC] bg-white p-6 transition hover:border-[#C6DDD0] hover:shadow-[0_12px_40px_-16px_rgba(13,13,11,0.12)] md:p-7"
            >
              <span
                className={`mb-6 inline-flex size-10 items-center justify-center font-[family-name:var(--font-dx-mono)] text-xs ${
                  i === 0
                    ? "bg-[#1C4A2E] text-white"
                    : "border border-[#E4E4DC] bg-[#FAFAF5] text-[#1C4A2E]"
                }`}
              >
                {item.step}
              </span>
              <h3 className="mb-2 text-[17px] font-semibold leading-snug text-[#0D0D0B]">
                {item.title}
              </h3>
              <p className="flex-1 text-sm font-light leading-relaxed text-[#6B6B64]">
                {item.body}
              </p>
              {i < JOURNEY.length - 1 ? (
                <span
                  className="absolute -right-3 top-1/2 hidden size-6 -translate-y-1/2 items-center justify-center bg-[#FAFAF5] font-mono text-[#A8A89E] lg:flex"
                  aria-hidden
                >
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-6 border border-[#C6DDD0] bg-gradient-to-r from-[#EEF5F1] to-white p-6 md:grid-cols-[auto_1fr] md:items-center md:p-8">
          <span className="inline-flex w-fit border border-[#1C4A2E]/20 bg-white px-3 py-1 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.2em] text-[#1C4A2E]">
            Guardrail
          </span>
          <p className="text-[15px] leading-relaxed text-[#2C2C28]">
            <span className="font-medium text-[#1C4A2E]">AI proposes</span> · humans approve ·
            the system applies. Nothing silently changes your RAID or timelines.
          </p>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}

export function LandingPlatform() {
  return (
    <LandingSection id="platform" tone="white" className="border-y border-[#E4E4DC]">
      <LandingContainer wide>
        <div className="grid items-start gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <SectionIntro
              eyebrow="Inside DeliverX"
              title={
                <>
                  Your morning view — <em className="text-[#1C4A2E] not-italic">and</em> what
                  powers it.
                </>
              }
              description="One command centre surfaces portfolio health, alerts, and coaching — backed by delivery, governance, and intelligence modules."
            />
            <LandingDashboardMockup float className="lg:-ml-2" />
          </div>

          <div className="flex flex-col gap-5 lg:col-span-5 lg:pt-24">
            {PILLARS.map((p, i) => (
              <div
                key={p.title}
                className="border border-[#E4E4DC] bg-[#FAFAF5] p-6 transition hover:border-[#C6DDD0]"
              >
                <div className="mb-4 flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center border border-[#C6DDD0] bg-white">
                    <p.icon size={20} className="text-[#1C4A2E]" strokeWidth={1.5} />
                  </span>
                  <div>
                    <span className="font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-wider text-[#A8A89E]">
                      Pillar {i + 1}
                    </span>
                    <h3 className={`${dxClass.display} mt-0.5 text-xl text-[#0D0D0B]`}>
                      {p.title}
                    </h3>
                  </div>
                </div>
                <ul className="space-y-2 border-t border-[#E4E4DC] pt-4">
                  {p.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-2.5 text-sm font-light text-[#6B6B64]"
                    >
                      <Check size={14} className="shrink-0 text-[#3D9660]" strokeWidth={2.5} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="px-1 text-xs font-light leading-relaxed text-[#A8A89E]">
              Portfolio, programmes, and twin simulation live in the same shell when you scale —
              not on day one.
            </p>
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
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, #3D9660 0%, transparent 50%), radial-gradient(circle at 80% 50%, #1C4A2E 0%, transparent 45%)",
        }}
        aria-hidden
      />
      <LandingContainer className="relative">
        <SectionIntro
          eyebrow="Built in, not bolted on"
          light
          align="center"
          title={
            <>
              Everything connects to the{" "}
              <em className="text-[#3D9660] not-italic">same signals.</em>
            </>
          }
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-4 border border-white/[0.08] bg-white/[0.04] px-5 py-4 backdrop-blur-sm transition hover:border-[#3D9660]/50 hover:bg-white/[0.06]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center border border-[#3D9660]/30 bg-[#3D9660]/10">
                <item.icon size={18} className="text-[#3D9660]" strokeWidth={1.5} />
              </span>
              <span className="text-[15px] text-white/90">{item.label}</span>
            </li>
          ))}
        </ul>
      </LandingContainer>
    </LandingSection>
  );
}
