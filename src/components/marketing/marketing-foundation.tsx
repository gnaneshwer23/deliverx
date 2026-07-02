import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { ROLES } from "@/lib/marketing/landing-data";

function ActivityFeedVisual() {
  const items = [
    { code: "PM", tone: ROLES.pm.accent, text: "Approved vendor delay escalation", time: "2m ago" },
    { code: "BA", tone: ROLES.ba.accent, text: "REQ-089 gap flagged for review", time: "14m ago" },
    { code: "QA", tone: ROLES.qa.accent, text: "Release gate moved to amber", time: "1h ago" },
  ];
  return (
    <div className="mt-4 space-y-2" aria-hidden>
      {items.map((item) => (
        <div
          key={item.text}
          className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5"
        >
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-md font-[family-name:var(--font-mkt-mono)] text-[0.55rem] font-semibold text-white"
            style={{ background: `${item.tone}33`, color: item.tone }}
          >
            {item.code}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.6875rem] text-white/70">{item.text}</p>
          </div>
          <span className="shrink-0 font-[family-name:var(--font-mkt-mono)] text-[0.55rem] text-white/35">
            {item.time}
          </span>
        </div>
      ))}
    </div>
  );
}

function ReqTraceVisual() {
  const rows = [
    { id: "REQ-142", status: "Mapped", tone: "#3D9660" },
    { id: "REQ-089", status: "Gap found", tone: "#FBBF24" },
    { id: "REQ-201", status: "Signed off", tone: "#60A5FA" },
  ];
  return (
    <div className="mt-4 space-y-2" aria-hidden>
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2"
        >
          <span className="size-1.5 rounded-full" style={{ background: row.tone }} />
          <span className="font-[family-name:var(--font-mkt-mono)] text-[0.625rem] text-white/70">{row.id}</span>
          <span className="ml-auto text-[0.625rem] text-white/45">{row.status}</span>
        </div>
      ))}
    </div>
  );
}

function MeetingIntelVisual() {
  return (
    <div className="mt-4 space-y-2" aria-hidden>
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
        <p className="font-[family-name:var(--font-mkt-mono)] text-[0.55rem] uppercase tracking-wide text-white/40">
          Standup · 09:30
        </p>
        <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-white/65">
          &ldquo;API vendor delayed 3 weeks — need PM escalation&rdquo;
        </p>
      </div>
      <div className="flex items-center gap-2 pl-2">
        <div className="h-px flex-1 border-t border-dashed border-[#6EE7B7]/40" />
        <span className="rounded bg-[rgba(61,150,96,0.2)] px-2 py-0.5 font-[family-name:var(--font-mkt-mono)] text-[0.55rem] text-[#6EE7B7]">
          3 tasks extracted
        </span>
      </div>
    </div>
  );
}

function SponsorVisual() {
  return (
    <div className="mt-4" aria-hidden>
      <p className="mb-2 font-[family-name:var(--font-mkt-mono)] text-[0.55rem] uppercase tracking-wide text-white/35">
        Example sponsor tiles
      </p>
      <div className="grid grid-cols-2 gap-2">
      {[
        { label: "Delivery conf.", val: "84%", tone: "#3D9660" },
        { label: "Open blockers", val: "2", tone: "#FBBF24" },
        { label: "Runway", val: "14mo", tone: "#60A5FA" },
        { label: "Approvals", val: "1 pending", tone: "#A78BFA" },
      ].map((k) => (
        <div key={k.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5">
          <p className="text-[0.55rem] text-white/45">{k.label}</p>
          <p className="mt-0.5 text-sm font-semibold" style={{ color: k.tone }}>
            {k.val}
          </p>
        </div>
      ))}
      </div>
    </div>
  );
}

const FOUNDATION_CARDS = [
  {
    title: "Unified delivery hub",
    desc: "Team progress, blockers, and approvals in one signal graph — no chasing updates across tools.",
    span: "md:col-span-2",
    visual: <ActivityFeedVisual />,
  },
  {
    title: "Real requirements & traceability",
    desc: "Gap analysis and sign-off status linked to delivery milestones — not a static spreadsheet.",
    span: "",
    visual: <ReqTraceVisual />,
  },
  {
    title: "Meeting intel → tasks",
    desc: "Standup and workshop transcripts become structured actions — routed to the Review Queue first.",
    span: "",
    visual: <MeetingIntelVisual />,
  },
  {
    title: "Sponsor visibility without noise",
    desc: "Portfolio health and escalation signals — filtered so sponsors see decisions, not every standup note.",
    span: "md:col-span-2",
    visual: <SponsorVisual />,
  },
] as const;

export function MarketingFoundationSection() {
  return (
    <MarketingSection
      id="foundation"
      className="relative overflow-hidden bg-[#0D0D0B] !py-14 md:!py-20"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_20%,rgba(61,150,96,0.12)_0%,transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />

      <MarketingContainer className="relative">
        <MarketingSectionIntro
          label="One workspace"
          title={
            <>
              Stop chasing updates. <em>Start seeing delivery.</em>
            </>
          }
          subtitle="Progress, contributions, blockers, and approvals — monitored in one place. No Slack threads, no Jira dashboards, no email chains to reconcile."
          className="[&_em]:text-[#6EE7B7] [&_h2]:text-white [&_p]:text-white/65 [&_header>p]:text-white/45"
        />

        <div className="mt-10 grid gap-3 md:grid-cols-3 md:gap-4">
          {FOUNDATION_CARDS.map((card) => (
            <article
              key={card.title}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20 hover:bg-white/[0.06] md:p-6 ${card.span}`}
            >
              <h3 className="text-[0.9375rem] font-semibold text-white md:text-base">{card.title}</h3>
              <p className="mt-2 max-w-prose text-[0.8125rem] leading-relaxed text-white/55">{card.desc}</p>
              {card.visual}
            </article>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
