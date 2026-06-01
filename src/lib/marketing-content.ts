/** Shared marketing copy — used by landing page and /api/marketing/content */

export const LANDING_SHIFT = {
  eyebrow: "The shift",
  title: "Delivery was built on spreadsheets.",
  titleEm: "We're building it on intelligence.",
  today: {
    heading: "How delivery works today",
    items: [
      "Status reports take days to compile across tools",
      "Risks surface in standups but rarely hit the RAID log",
      "Decisions live in meeting notes, not the register",
      "Lessons learned die in closure folders",
      "AI bolted on as chat, not wired to governance",
    ],
  },
  withProduct: {
    heading: "With DeliverX",
    items: [
      "Draft → review → publish in one pipeline",
      "Signals flow into RAID with human approval",
      "Meetings become decisions and change requests",
      "Memory compounds across programmes",
      "AI proposes — your team approves every change",
    ],
  },
} as const;

export const LANDING_AGENTS = [
  {
    step: "01",
    title: "Delivery agent",
    body: "Ingests business cases, structures workstreams, tracks velocity and blockers. Surfaces what needs attention on the command centre.",
  },
  {
    step: "02",
    title: "Governance agent",
    body: "Maintains RAID, decisions, and report drafts. Routes anomalies to the alert queue — nothing applies without PM approval.",
  },
  {
    step: "03",
    title: "Coach agent",
    body: "Summarises standups and meetings, suggests owners for actions, and drafts executive status — always in review before send.",
  },
  {
    step: "04",
    title: "Intelligence agent",
    body: "Runs twin scenarios, coordination loops, and cross-org patterns. Forecasts confidence and flags portfolio drift early.",
  },
] as const;

export const LANDING_MARKET_STATS_DEFAULT = [
  { value: "40%", label: "PM time on admin", sub: "Recovered with unified workspace" },
  { value: "15×", label: "Faster reporting", sub: "Draft to publish in one flow" },
  { value: "97%", label: "Lessons retained", sub: "When memory is searchable" },
] as const;
