import {
  ArrowRight,
  BrainCircuit,
  Check,
  FileBarChart2,
  FolderKanban,
  Globe2,
  ShieldCheck,
  Sparkles,
  Telescope,
} from "lucide-react";
import { DxCaps } from "@/components/dx/dx-logo";
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

/** Single horizontal journey — replaces separate how/loops/onboarding sections */
export function LandingJourney() {
  return (
    <section id="how" className="scroll-mt-[var(--dx-navh)] bg-[#FAFAF5] px-6 py-28 md:px-11">
      <div className="mx-auto max-w-6xl">
        <DxCaps accent className="mb-3">
          How it works
        </DxCaps>
        <h2 className={`${dxClass.sectionTitle} mb-4 max-w-2xl`}>
          Four moves. <em className="text-[#1C4A2E] not-italic">One workspace.</em>
        </h2>
        <p className="mb-16 max-w-xl text-[17px] font-light leading-relaxed text-[#6B6B64]">
          No tool-hopping — the same system carries you from business case to closure.
        </p>

        <div className="relative">
          <div
            className="absolute left-0 right-0 top-[2.75rem] hidden h-px bg-[#E4E4DC] md:block"
            aria-hidden
          />
          <ol className="grid gap-10 md:grid-cols-4 md:gap-6">
            {JOURNEY.map((item, i) => (
              <li key={item.step} className="relative">
                <div className="mb-5 flex items-center gap-3">
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center border font-[family-name:var(--font-dx-mono)] text-[11px] ${
                      i === 0
                        ? "border-[#1C4A2E] bg-[#1C4A2E] text-white"
                        : "border-[#E4E4DC] bg-white text-[#1C4A2E]"
                    }`}
                  >
                    {item.step}
                  </span>
                  {i < JOURNEY.length - 1 ? (
                    <ArrowRight
                      size={14}
                      className="hidden text-[#A8A89E] md:block"
                      aria-hidden
                    />
                  ) : null}
                </div>
                <h3 className="mb-2 text-[17px] font-semibold leading-snug text-[#0D0D0B]">
                  {item.title}
                </h3>
                <p className="text-sm font-light leading-relaxed text-[#6B6B64]">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3 border border-[#C6DDD0] bg-[#EEF5F1] px-5 py-4">
          <span className="font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-wider text-[#1C4A2E]">
            Guardrail
          </span>
          <p className="text-sm text-[#2C2C28]">
            AI proposes · humans approve · the system applies. Nothing silently changes your RAID or
            timelines.
          </p>
        </div>
      </div>
    </section>
  );
}

/** Product bento: dashboard mock + three pillars — replaces OS stack, loops grid, workspace map, dashboard list */
export function LandingPlatform() {
  return (
    <section
      id="platform"
      className="scroll-mt-[var(--dx-navh)] border-y border-[#E4E4DC] bg-white px-6 py-28 md:px-11"
    >
      <div className="mx-auto max-w-6xl">
        <DxCaps accent className="mb-3">
          Inside DeliverX
        </DxCaps>
        <h2 className={`${dxClass.sectionTitle} mb-16 max-w-2xl`}>
          Your morning view — and everything behind it.
        </h2>

        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <DashboardMockup />

          <div className="flex flex-col justify-center gap-8">
            {PILLARS.map((p) => (
              <div key={p.title} className="group">
                <div className="mb-3 flex items-center gap-3">
                  <p.icon size={20} className="text-[#1C4A2E]" strokeWidth={1.5} />
                  <h3 className="text-lg font-semibold text-[#0D0D0B]">{p.title}</h3>
                </div>
                <ul className="space-y-2 pl-8">
                  {p.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-2 text-sm font-light text-[#6B6B64]"
                    >
                      <Check size={12} className="shrink-0 text-[#3D9660]" strokeWidth={2.5} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="border-t border-[#F0F0E8] pt-6 text-xs font-light leading-relaxed text-[#A8A89E]">
              Portfolio, programmes, twin simulation, and privacy-preserving benchmarks live in the
              same shell — when you need them, not on day one.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  const projects = [
    { name: "Platform migration", health: 78, tier: "watch" as const },
    { name: "CRM rollout", health: 91, tier: "healthy" as const },
    { name: "Data programme", health: 64, tier: "at-risk" as const },
  ];

  return (
    <div
      className={`${dxClass.card} overflow-hidden shadow-[0_24px_80px_rgba(13,13,11,0.08)]`}
      aria-label="DeliverX dashboard preview"
    >
      <div className="flex items-center gap-0 border-b border-[#F0F0E8] bg-[#0a0e14] px-4 py-3">
        <span className="font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-widest text-[#9ca3af]">
          DeliverX
        </span>
        <span className="ml-3 text-[10px] text-[#6b7280]">· Command centre</span>
        <span className="ml-auto flex items-center gap-1.5 font-[family-name:var(--font-dx-mono)] text-[8px] text-[#1A6B3A]">
          <span className="size-1.5 rounded-full bg-[#1A6B3A]" />
          Live
        </span>
      </div>

      <div className="grid grid-cols-4 gap-px border-b border-[#F0F0E8] bg-[#F0F0E8]">
        {[
          { v: "84%", l: "Confidence", c: "text-[#1A6B3A]" },
          { v: "3", l: "At risk", c: "text-[#B7620A]" },
          { v: "4", l: "Blocked", c: "text-[#C0392B]" },
          { v: "↑12%", l: "Velocity", c: "text-[#1C4A2E]" },
        ].map((k) => (
          <div key={k.l} className="bg-white px-3 py-4 text-center">
            <div className={`${dxClass.display} text-xl leading-none ${k.c}`}>{k.v}</div>
            <DxCaps className="mt-1 text-[6px]">{k.l}</DxCaps>
          </div>
        ))}
      </div>

      <div className="grid gap-px bg-[#F0F0E8] md:grid-cols-5">
        <div className="space-y-2 bg-white p-4 md:col-span-3">
          <DxCaps className="text-[7px]">Portfolio health</DxCaps>
          {projects.map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              <div className="h-1 flex-1 overflow-hidden bg-[#F7F7F2]">
                <div
                  className={`h-full ${
                    p.tier === "healthy"
                      ? "bg-[#1A6B3A]"
                      : p.tier === "watch"
                        ? "bg-[#B7620A]"
                        : "bg-[#C0392B]"
                  }`}
                  style={{ width: `${p.health}%` }}
                />
              </div>
              <span className="w-24 truncate text-[11px] text-[#2C2C28]">{p.name}</span>
              <span className="font-[family-name:var(--font-dx-mono)] text-[9px] text-[#A8A89E]">
                {p.health}%
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 bg-[#EEF5F1] p-4 md:col-span-2">
          <DxCaps className="text-[7px] text-[#1C4A2E]">Needs you</DxCaps>
          <p className="text-[12px] leading-snug text-[#2C2C28]">
            Vendor scope risk · 2 alerts in queue
          </p>
          <div className="mt-auto flex items-center gap-2 border border-[#C6DDD0] bg-white px-2 py-1.5">
            <Sparkles size={12} className="text-[#1C4A2E]" />
            <span className="text-[10px] text-[#6B6B64]">Coach: rebalance QA</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-t border-[#F0F0E8] bg-[#F7F7F2] px-4 py-2">
        {[Sparkles, FileBarChart2, BrainCircuit, Globe2].map((Icon, i) => (
          <span
            key={i}
            className={`flex items-center gap-1 px-2 py-1 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-wide ${
              i === 0 ? "bg-white text-[#1C4A2E] shadow-sm" : "text-[#A8A89E]"
            }`}
          >
            <Icon size={10} />
            {["Assistant", "Reports", "Twin", "Global"][i]}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Compact capability row — replaces 6-loop grid + 4 intelligence cards + feature extras */
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
    <section id="capabilities" className="scroll-mt-[var(--dx-navh)] bg-[#0D0D0B] px-6 py-20 md:px-11">
      <div className="mx-auto max-w-6xl">
        <p className="text-center font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.2em] text-[#3D9660]">
          Built in, not bolted on
        </p>
        <ul className="mt-10 flex flex-wrap justify-center gap-3 md:gap-4">
          {items.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-2.5 border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-[#3D9660]/40"
            >
              <item.icon size={16} className="text-[#3D9660]" strokeWidth={1.5} />
              <span className="text-sm text-white/90">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
