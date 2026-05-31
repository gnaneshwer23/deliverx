import {
  Brain,
  BrainCircuit,
  Briefcase,
  FileBarChart2,
  FolderKanban,
  Globe2,
  Layers,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Telescope,
  Users,
  Zap,
} from "lucide-react";
import { DxCaps } from "@/components/dx/dx-logo";
import { DxBadge } from "@/components/dx/dx-badge";
import { dxClass } from "@/lib/dx-theme";

/** Layered OS stack — maps to workspace + intelligence services */
export function LandingOsStack() {
  const layers = [
    {
      label: "Executive & portfolio",
      tone: "bg-[#0D0D0B] text-white",
      items: ["Portfolio health", "Programmes", "PMO dashboard", "Executive view"],
    },
    {
      label: "Intelligence loops",
      tone: "bg-[#1C4A2E] text-white",
      items: ["Digital Twin", "Coordination agents", "Global patterns", "Adaptive recommendations"],
    },
    {
      label: "Governance & reporting",
      tone: "bg-[#2D7048] text-white",
      items: ["RAID · Decisions · Changes", "Report pipeline", "Alert queue", "Approvals"],
    },
    {
      label: "Delivery execution",
      tone: "bg-[#EEF5F1] text-[#0D0D0B] border border-[#C6DDD0]",
      items: ["Tasks & workstreams", "Milestones", "Standups", "Meetings & traceability"],
    },
    {
      label: "AI & memory",
      tone: "bg-[#FAFAF5] text-[#0D0D0B] border border-[#E4E4DC]",
      items: ["Assistant (approve-to-apply)", "Business case → structure", "Playbooks", "Org memory search"],
    },
  ];

  return (
    <section id="platform" className="border-y border-[#E4E4DC] bg-white px-6 py-24 md:px-11">
      <div className="mx-auto max-w-7xl">
        <DxCaps accent className="mb-3">
          The platform
        </DxCaps>
        <h2 className={`${dxClass.sectionTitle} mb-4 max-w-3xl`}>
          One operating system — <em className="text-[#1C4A2E] not-italic">not</em> another task board.
        </h2>
        <p className="mb-12 max-w-2xl text-base font-light leading-relaxed text-[#6B6B64]">
          DeliverX stacks delivery execution, governance, and compounding intelligence in a single
          workspace. Data flows up from projects into portfolio and twin models — always with human
          approval before anything is applied.
        </p>

        <div className="grid gap-3 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
          <div className="flex flex-col gap-2">
            {layers.map((layer, i) => (
              <div
                key={layer.label}
                className={`relative px-5 py-4 ${layer.tone}`}
                style={{ marginLeft: `${i * 6}px` }}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.14em] opacity-80">
                    Layer {layers.length - i}
                  </span>
                  <span className="text-sm font-semibold">{layer.label}</span>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {layer.items.map((item) => (
                    <li
                      key={item}
                      className="border border-current/15 px-2 py-0.5 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wide opacity-90"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border border-[#E4E4DC] bg-[#F7F7F2] p-6 md:p-8">
            <DxCaps className="mb-4">Data flow</DxCaps>
            <OsFlowDiagram />
            <p className="mt-6 text-xs font-light leading-relaxed text-[#6B6B64]">
              Signals from tasks, RAID, standups, and governance feed the{" "}
              <strong className="font-normal text-[#0D0D0B]">command centre</strong>. Scheduled loops
              capture twin and coordination snapshots; global intelligence contributes anonymised
              patterns — never raw cross-org data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function OsFlowDiagram() {
  const nodes = [
    { id: "projects", label: "Projects & tasks", x: 8, y: 12 },
    { id: "gov", label: "Governance", x: 42, y: 12 },
    { id: "dash", label: "Dashboard", x: 76, y: 12 },
    { id: "twin", label: "Digital Twin", x: 20, y: 48 },
    { id: "coord", label: "Coordination", x: 50, y: 48 },
    { id: "global", label: "Global intel", x: 80, y: 48 },
    { id: "exec", label: "Executive / PMO", x: 50, y: 82 },
  ];

  const edges = [
    ["projects", "gov"],
    ["gov", "dash"],
    ["projects", "twin"],
    ["gov", "coord"],
    ["twin", "exec"],
    ["coord", "exec"],
    ["global", "exec"],
    ["dash", "exec"],
  ];

  return (
    <div className="relative aspect-[4/3] w-full max-w-md">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full text-[#C6DDD0]"
        aria-hidden
      >
        {edges.map(([a, b]) => {
          const from = nodes.find((n) => n.id === a)!;
          const to = nodes.find((n) => n.id === b)!;
          return (
            <line
              key={`${a}-${b}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="currentColor"
              strokeWidth="0.4"
              strokeDasharray="2 1"
            />
          );
        })}
      </svg>
      {nodes.map((n) => (
        <div
          key={n.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 border border-[#1C4A2E] bg-white px-2 py-1 text-center shadow-sm"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          <span className="whitespace-nowrap font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-wide text-[#1C4A2E]">
            {n.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Six delivery loops aligned with architecture audit */
export function LandingDeliveryLoops() {
  const loops = [
    {
      id: "1",
      title: "Project inception",
      desc: "Paste or upload a business case. AI reviews, discovers scope, and generates workstreams, RAID, and milestones.",
      outputs: ["Guided chat", "AI structure", "Charter alignment"],
    },
    {
      id: "2",
      title: "Governance & steering",
      desc: "RAID, decisions, changes, and meetings stay linked. Approvals queue for PMO review.",
      outputs: ["RAID log", "Decision register", "Steering approvals"],
    },
    {
      id: "3",
      title: "Delivery execution",
      desc: "Tasks, standups, and traceability with velocity signals on the workspace dashboard.",
      outputs: ["Kanban tasks", "90s standups", "Playbooks"],
    },
    {
      id: "4",
      title: "Capacity & benefits",
      desc: "Workload rebalance suggestions and benefit hypotheses tracked against outcomes.",
      outputs: ["Capacity view", "Benefits CRUD", "Rebalance apply"],
    },
    {
      id: "5",
      title: "Reporting pipeline",
      desc: "AI drafts reports → PM reviews → publish to stakeholders (optional email).",
      outputs: ["AI reports", "Review workflow", "Publish"],
    },
    {
      id: "6",
      title: "Closure & memory",
      desc: "Closure packages and lessons flow into organisational memory for the next programme.",
      outputs: ["Closure AI", "Memory search", "Benchmarking"],
    },
  ];

  return (
    <section id="loops" className="bg-[#0D0D0B] px-6 py-24 md:px-11">
      <div className="mx-auto max-w-7xl">
        <DxCaps className="mb-3 text-[#3D9660]">Delivery loops</DxCaps>
        <h2 className={`${dxClass.display} mb-4 text-4xl leading-tight text-white md:text-5xl`}>
          Six connected loops from{" "}
          <em className="text-[#3D9660] not-italic">brief to closure.</em>
        </h2>
        <p className="mb-14 max-w-2xl text-base font-light leading-relaxed text-white/45">
          Each loop maps to real routes in your workspace — not slide-ware. The dashboard ties them
          together with live health, alerts, and an AI delivery coach.
        </p>
        <div className="grid gap-px bg-white/[0.08] md:grid-cols-2 lg:grid-cols-3">
          {loops.map((loop) => (
            <div key={loop.id} className="bg-[#0D0D0B] p-7">
              <span className="font-[family-name:var(--font-dx-mono)] text-[10px] text-[#3D9660]">
                Loop {loop.id}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-white">{loop.title}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-white/50">{loop.desc}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {loop.outputs.map((o) => (
                  <span
                    key={o}
                    className="border border-white/10 px-2 py-0.5 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-wide text-white/60"
                  >
                    {o}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Intelligence products — twin, coordination, global, assistant */
export function LandingIntelligence() {
  const cards = [
    {
      icon: Sparkles,
      title: "AI Assistant",
      subtitle: "Workspace copilot",
      body: "Chat across programmes with project context. Proposes RAID items and tasks — you approve before anything is created.",
      accent: "text-violet-600",
      border: "border-violet-200",
      bg: "bg-violet-50/50",
    },
    {
      icon: Telescope,
      title: "Digital Twin",
      subtitle: "Enterprise simulation",
      body: "Live model of portfolio health, cascading risks, and optimisation actions. Daily snapshots and scenario what-if.",
      accent: "text-indigo-600",
      border: "border-indigo-200",
      bg: "bg-indigo-50/50",
    },
    {
      icon: BrainCircuit,
      title: "Coordination Intelligence",
      subtitle: "Multi-agent graph",
      body: "Agents traverse dependencies and partners, surface cross-org alerts, and chain recommendations — human governance always.",
      accent: "text-violet-700",
      border: "border-violet-200",
      bg: "bg-violet-50/30",
    },
    {
      icon: Globe2,
      title: "Global Intelligence",
      subtitle: "Privacy-preserving network",
      body: "Anonymised pattern learning across enterprises. Localised benchmarks and strategic copilot — never identifiable data export.",
      accent: "text-sky-600",
      border: "border-sky-200",
      bg: "bg-sky-50/50",
    },
  ];

  return (
    <section id="intelligence" className="bg-[#FAFAF5] px-6 py-24 md:px-11">
      <div className="mx-auto max-w-7xl">
        <DxCaps accent className="mb-3">
          Intelligence layer
        </DxCaps>
        <h2 className={`${dxClass.sectionTitle} mb-4`}>
          Compounding insight — <em className="text-[#1C4A2E] not-italic">with guardrails.</em>
        </h2>
        <p className="mb-12 max-w-2xl text-base font-light leading-relaxed text-[#6B6B64]">
          Advanced modules run on the same project signals as your dashboard. Cron jobs capture twin
          and coordination state; you can also run loops on demand from the workspace.
        </p>
        <div className="mb-10 flex flex-wrap items-center gap-3 border border-[#C6DDD0] bg-[#EEF5F1] px-4 py-3">
          <Zap size={16} className="text-[#1C4A2E]" />
          <p className="text-sm text-[#1C4A2E]">
            <span className="font-medium">Human-in-the-loop:</span> AI proposes · PM approves ·
            system applies. No silent auto-changes to governance or timelines.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((c) => (
            <div
              key={c.title}
              className={`border p-6 ${c.border} ${c.bg}`}
            >
              <c.icon size={22} className={c.accent} />
              <p className="mt-3 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-wide text-[#6B6B64]">
                {c.subtitle}
              </p>
              <h3 className={`${dxClass.display} mt-1 text-xl text-[#0D0D0B]`}>{c.title}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-[#6B6B64]">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Workspace module map — mirrors sidebar */
export function LandingWorkspaceMap() {
  const core = [
    { icon: LayoutDashboard, label: "Dashboard", desc: "Health, alerts, coach, velocity" },
    { icon: Sparkles, label: "Assistant", desc: "Copilot + proposed actions" },
    { icon: FolderKanban, label: "Projects", desc: "Charter, closure, per-project hubs" },
    { icon: ListChecks, label: "Tasks", desc: "Org-wide task list" },
    { icon: MessageSquare, label: "Standups", desc: "Daily signals feed AI" },
    { icon: ShieldCheck, label: "Governance", desc: "RAID, decisions, org RAID" },
    { icon: FileBarChart2, label: "Reports", desc: "Draft → review → publish" },
  ];

  const advanced = [
    { icon: Briefcase, label: "Portfolio", desc: "Health & dependencies" },
    { icon: Layers, label: "Programmes", desc: "Multi-project alignment" },
    { icon: Telescope, label: "Digital Twin", desc: "Simulate & optimise" },
    { icon: Brain, label: "Memory", desc: "Lessons & search" },
    { icon: BrainCircuit, label: "Coordination", desc: "Agent graph & partners" },
    { icon: Globe2, label: "Global", desc: "Benchmarks & copilot" },
  ];

  return (
    <section id="workspace" className="border-t border-[#E4E4DC] bg-[#F7F7F2] px-6 py-24 md:px-11">
      <div className="mx-auto max-w-7xl">
        <DxCaps accent className="mb-3">
          Your workspace
        </DxCaps>
        <h2 className={`${dxClass.sectionTitle} mb-12`}>
          Everything in one <em className="text-[#1C4A2E] not-italic">navigable</em> shell.
        </h2>
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          <div className="border border-[#0D0D0B] bg-[#0a0e14] p-5 text-sm">
            <p className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-widest text-[#9ca3af]">
              DeliverX
            </p>
            <p className="mt-1 truncate text-[11px] uppercase tracking-wide text-[#9ca3af]">
              Acme Delivery · Workspace
            </p>
            <nav className="mt-6 space-y-4">
              <div>
                <p className="mb-2 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase text-[#6b7280]">
                  Core
                </p>
                <ul className="space-y-1">
                  {core.slice(0, 5).map((m) => (
                    <li
                      key={m.label}
                      className="flex items-center gap-2 px-2 py-1 text-[#e5e7eb]"
                    >
                      <m.icon size={13} className="shrink-0 text-[#9ca3af]" />
                      {m.label}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase text-[#6b7280]">
                  Advanced
                </p>
                <ul className="space-y-1">
                  {advanced.slice(0, 4).map((m) => (
                    <li
                      key={m.label}
                      className="flex items-center gap-2 px-2 py-1 text-[#9ca3af]"
                    >
                      <m.icon size={13} className="shrink-0" />
                      {m.label}
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>

          <div>
            <p className="mb-6 text-sm font-light text-[#6B6B64]">
              After onboarding (organisation → role → invite), your team lands on the{" "}
              <strong className="font-normal text-[#0D0D0B]">delivery command centre</strong> —
              role-aware views for PMs, executives, and team members.
            </p>
            <div className="grid gap-px bg-[#E4E4DC] sm:grid-cols-2">
              {[...core, ...advanced].map((m) => (
                <div key={m.label} className="flex gap-3 bg-[#FAFAF5] p-4">
                  <m.icon size={18} className="mt-0.5 shrink-0 text-[#1C4A2E]" />
                  <div>
                    <p className="text-sm font-semibold text-[#0D0D0B]">{m.label}</p>
                    <p className="text-xs font-light text-[#6B6B64]">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Dashboard anatomy — what the command centre shows */
export function LandingDashboardPreview() {
  const panels = [
    { label: "KPI strip", value: "Confidence · At-risk · Blocked · Velocity" },
    { label: "Project health grid", value: "Per-project tier & score" },
    { label: "Alert queue", value: "PM-reviewed intelligence alerts" },
    { label: "Delivery coach", value: "Next-best actions from signals" },
    { label: "Governance pulse", value: "Open RAID, decisions, changes" },
    { label: "AI insights", value: "OpenAI-powered summary panel" },
  ];

  return (
    <section className="bg-white px-6 py-24 md:px-11">
      <div className="mx-auto max-w-7xl">
        <DxCaps accent className="mb-3">
          Command centre
        </DxCaps>
        <h2 className={`${dxClass.sectionTitle} mb-12`}>
          The dashboard your PM opens <em className="text-[#1C4A2E] not-italic">every morning.</em>
        </h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className={`${dxClass.card} overflow-hidden shadow-lg`}>
            <div className="border-b border-[#F0F0E8] bg-[#F7F7F2] px-4 py-2.5">
              <DxCaps>/workspace/dashboard</DxCaps>
            </div>
            <div className="grid grid-cols-4 gap-2 border-b border-[#F0F0E8] p-4">
              {["84%", "3", "4", "↑12%"].map((v, i) => (
                <div key={i} className="bg-[#F7F7F2] p-2 text-center">
                  <div className={`${dxClass.display} text-lg text-[#1C4A2E]`}>{v}</div>
                  <DxCaps className="text-[6px]">
                    {["Conf.", "Risk", "Blk.", "Vel."][i]}
                  </DxCaps>
                </div>
              ))}
            </div>
            <div className="grid gap-2 p-4 md:grid-cols-2">
              <div className="min-h-[88px] border border-dashed border-[#E4E4DC] p-3">
                <DxCaps className="text-[7px]">Health grid</DxCaps>
                <div className="mt-2 space-y-1">
                  {["Platform · 78%", "CRM · 91%", "Data · 64%"].map((r) => (
                    <div key={r} className="h-1.5 bg-[#EEF5F1] text-[8px] leading-[6px] text-transparent">
                      {r}
                    </div>
                  ))}
                </div>
              </div>
              <div className="min-h-[88px] border border-[#C6DDD0] bg-[#EEF5F1] p-3">
                <DxCaps className="text-[7px] text-[#1C4A2E]">Alerts · Coach</DxCaps>
                <p className="mt-2 text-[11px] text-[#2C2C28]">
                  2 alerts awaiting review · Rebalance QA capacity
                </p>
              </div>
            </div>
          </div>
          <ul className="flex flex-col gap-3">
            {panels.map((p) => (
              <li
                key={p.label}
                className="flex items-start justify-between gap-4 border-l-2 border-[#1C4A2E] bg-[#FAFAF5] py-3 pl-4"
              >
                <div>
                  <p className="text-sm font-semibold text-[#0D0D0B]">{p.label}</p>
                  <p className="text-xs font-light text-[#6B6B64]">{p.value}</p>
                </div>
                <DxBadge tone="green">Live</DxBadge>
              </li>
            ))}
            <li className="flex items-center gap-2 text-xs text-[#6B6B64]">
              <Users size={14} />
              Role-aware: executive overview · team member · delivery lead
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Onboarding path */
export function LandingOnboardingPath() {
  const steps = [
    { label: "Create organisation", detail: "Industry & delivery model" },
    { label: "Set your role", detail: "PM · Executive · Team member" },
    { label: "Invite the team", detail: "Magic links per role" },
    { label: "First project", detail: "Brief → AI structure → publish" },
    { label: "Command centre", detail: "Dashboard + assistant ready" },
  ];

  return (
    <section className="border-t border-[#E4E4DC] bg-[#EEF5F1] px-6 py-16 md:px-11">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <DxCaps accent>First session</DxCaps>
          <h3 className={`${dxClass.display} mt-2 text-2xl text-[#0D0D0B]`}>
            Onboarding in ~15 minutes
          </h3>
        </div>
        <ol className="flex flex-wrap gap-2 md:max-w-[65%]">
          {steps.map((s, i) => (
            <li
              key={s.label}
              className="flex items-center gap-2 border border-[#C6DDD0] bg-white px-3 py-2"
            >
              <span className="font-[family-name:var(--font-dx-mono)] text-[9px] text-[#1C4A2E]">
                {i + 1}
              </span>
              <div>
                <p className="text-xs font-semibold text-[#0D0D0B]">{s.label}</p>
                <p className="text-[10px] text-[#6B6B64]">{s.detail}</p>
              </div>
              {i < steps.length - 1 ? (
                <span className="hidden text-[#A8A89E] md:inline" aria-hidden>
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
