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
import { LandingReveal } from "@/components/dx/landing-motion";
import { LandingWorkflowStrip } from "@/components/dx/landing-workflow";
import {
  LandingContainer,
  LandingDashboardMockup,
  LandingSection,
  SectionIntro,
} from "@/components/dx/landing-layout";
import { LandingMetricChip } from "@/components/dx/landing-stat";
import { DxCaps } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";
import type { LandingPreviewStats } from "@/services/landing";

const JOURNEY = [
  {
    step: "01",
    title: "Start from the brief",
    body: "Paste or upload your business case. AI reviews scope and generates structure — workstreams, RAID, milestones.",
  },
  {
    step: "02",
    title: "Run delivery",
    body: "Tasks, standups, and velocity feed one shared workspace. See health, blockers, and what needs attention today.",
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
    points: ["Project workspace", "Tasks & standups", "Capacity & benefits"],
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
    <LandingSection id="how" tone="base" density="compact">
      <LandingContainer>
        <LandingReveal>
          <SectionIntro
            eyebrow="How it works"
            lead="Same workspace at every stage — no exports or duplicate RAID logs."
            title={
              <>
                Four moves. <em className="text-[#1C4A2E] not-italic">One workspace.</em>
              </>
            }
            description="Follow the pipeline below, then see what each phase looks like in practice."
          />
        </LandingReveal>

        <div className="mb-8">
          <LandingWorkflowStrip />
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {JOURNEY.map((item, i) => (
            <li key={item.step}>
              <LandingReveal delay={i * 0.06} className="h-full">
                <div className="group relative flex h-full flex-col border border-[#E4E4DC] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#C6DDD0] hover:shadow-[0_20px_50px_-20px_rgba(13,13,11,0.14)] md:p-7">
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
                </div>
              </LandingReveal>
            </li>
          ))}
        </ol>

        <LandingReveal delay={0.2}>
          <div className="mt-10 grid gap-6 border border-[#C6DDD0] bg-gradient-to-r from-[#EEF5F1] via-white to-[#FAFAF5] p-6 md:grid-cols-[auto_1fr] md:items-center md:p-8">
            <span className="inline-flex w-fit border border-[#1C4A2E]/20 bg-white px-3 py-1 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.2em] text-[#1C4A2E]">
              Guardrail
            </span>
            <p className="text-[15px] leading-relaxed text-[#2C2C28]">
              <span className="font-medium text-[#1C4A2E]">AI proposes</span> · humans approve ·
              the system applies. Nothing silently changes your RAID or timelines.
            </p>
          </div>
        </LandingReveal>
      </LandingContainer>
    </LandingSection>
  );
}

function platformMetrics(preview: LandingPreviewStats) {
  if (preview.live) {
    return [
      {
        k: `${preview.confidence}%`,
        l: "Portfolio confidence",
        sub: "Live from your workspace",
      },
      {
        k: String(preview.atRisk),
        l: "Programmes at risk",
        sub: "Tracked in workspace",
      },
      {
        k: String(preview.blocked),
        l: "Blocked tasks",
        sub: "Surfaced with alerts",
      },
    ];
  }
  return [
    { k: "84%", l: "Avg confidence", sub: "Across active programmes" },
    { k: "< 2min", l: "Alert triage", sub: "From signal to review queue" },
    { k: "1-click", l: "Report publish", sub: "Draft → approve → stakeholders" },
  ];
}

function metricValueClass(k: string, index: number) {
  if (index === 1) return "text-[#B7620A]";
  if (index === 2 && k !== "1-click" && k !== "< 2min") return "text-[#C0392B]";
  return "text-[#1C4A2E]";
}

export function LandingPlatform({ preview }: { preview: LandingPreviewStats }) {
  const metrics = platformMetrics(preview);

  return (
    <LandingSection
      id="platform"
      tone="white"
      density="tight"
      className="border-y border-[#E4E4DC]"
    >
      <LandingContainer wide>
        <LandingReveal>
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
            <div className="max-w-lg">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-px w-6 bg-[#1C4A2E]" aria-hidden />
                <DxCaps accent>Inside DeliverX</DxCaps>
              </div>
              <h2 className={`${dxClass.display} text-2xl leading-snug text-[#0D0D0B] md:text-[1.75rem]`}>
                Professional Workspace + modules —{" "}
                <em className="text-[#1C4A2E] not-italic">one surface</em>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6B6B64]">
                Shared delivery signals stay connected across delivery, governance, and
                intelligence in one calm workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              {metrics.map((stat, i) => (
                <LandingMetricChip
                  key={stat.l}
                  value={stat.k}
                  label={stat.l}
                  valueClassName={metricValueClass(stat.k, i)}
                />
              ))}
            </div>
          </div>
        </LandingReveal>

        <LandingReveal delay={0.05}>
          <div className="overflow-hidden border border-[#E4E4DC] bg-[#FAFAF5] shadow-[0_20px_50px_-24px_rgba(13,13,11,0.1)]">
            <div className="grid lg:grid-cols-[1.15fr_1fr]">
              <div className="border-b border-[#E4E4DC] p-3 md:p-4 lg:border-b-0 lg:border-r">
                <LandingDashboardMockup compact />
              </div>

              <div className="divide-y divide-[#E4E4DC]">
                {PILLARS.map((p, i) => (
                  <div
                    key={p.title}
                    className={`flex gap-3 p-4 md:p-5 ${
                      i === 0 ? "bg-[#EEF5F1]/80" : "bg-white"
                    }`}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center border border-[#C6DDD0] bg-white">
                      <p.icon size={16} className="text-[#1C4A2E]" strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[#0D0D0B]">{p.title}</h3>
                      <ul className="mt-1.5 space-y-1">
                        {p.points.map((point) => (
                          <li
                            key={point}
                            className="flex items-center gap-1.5 text-[12px] leading-snug text-[#6B6B64]"
                          >
                            <Check
                              size={12}
                              className="shrink-0 text-[#3D9660]"
                              strokeWidth={2.5}
                            />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </LandingReveal>
      </LandingContainer>
    </LandingSection>
  );
}

export function LandingCapabilities() {
  const items = [
    {
      label: "AI structure from brief",
      desc: "Workstreams, RAID, milestones from your business case",
      icon: Sparkles,
    },
    {
      label: "RAID & steering",
      desc: "Linked risks, decisions, and change control",
      icon: ShieldCheck,
    },
    {
      label: "Auto-drafted reports",
      desc: "Executive-ready status with review gates",
      icon: FileBarChart2,
    },
    {
      label: "Org memory",
      desc: "Searchable lessons and playbooks",
      icon: BrainCircuit,
    },
    {
      label: "Twin scenarios",
      desc: "Simulate delivery paths before you commit",
      icon: Telescope,
    },
    {
      label: "Cross-org patterns",
      desc: "Benchmarks and delivery patterns at scale",
      icon: Globe2,
    },
  ];

  return (
    <LandingSection id="capabilities" tone="ink" className="relative overflow-hidden">
      <div className="landing-mesh-dark pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <LandingContainer className="relative">
        <LandingReveal>
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
        </LandingReveal>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <li key={item.label}>
              <LandingReveal delay={i * 0.04} className="h-full">
                <div className="flex h-full flex-col gap-3 border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#3D9660]/50 hover:bg-white/[0.08] sm:flex-row sm:items-center">
                  <span className="flex size-10 shrink-0 items-center justify-center border border-[#3D9660]/30 bg-[#3D9660]/10">
                    <item.icon size={18} className="text-[#3D9660]" strokeWidth={1.5} />
                  </span>
                  <div>
                    <span className="block text-[15px] font-medium text-white/90">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs font-light text-white/45">
                      {item.desc}
                    </span>
                  </div>
                </div>
              </LandingReveal>
            </li>
          ))}
        </ul>
      </LandingContainer>
    </LandingSection>
  );
}
