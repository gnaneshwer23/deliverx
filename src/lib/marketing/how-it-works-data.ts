/**
 * How DeliverX works — marketing lifecycle copy.
 * Aligned to screen-pack-01/02 and product trust rails.
 */

export const HOW_IT_WORKS_HERO = {
  label: "How it works",
  title: "Turn realistic work into a professional record you can explain.",
  support:
    "DeliverX connects direction, experience, evidence and career action without treating self-report, AI observation or course completion as proven capability.",
  primaryCta: { href: "/signup?product=xperience", label: "Start your experience" },
  secondaryCta: { href: "/experience", label: "Explore Experience" },
} as const;

/** End-to-end pipeline shown above the numbered steps. */
export const HOW_IT_WORKS_PIPELINE = [
  { id: "work", label: "Work", detail: "Company context" },
  { id: "evidence", label: "Evidence", detail: "Provenance kept" },
  { id: "capability", label: "Capability", detail: "Framework judgement" },
  { id: "next", label: "Next step", detail: "Career action" },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    id: "direction",
    step: "01",
    title: "Map your direction",
    body: "Share your current context, target role and priorities. These answers are self-reported and guide recommendations — they do not create evidence or capability.",
    diagram: "direction" as const,
  },
  {
    id: "context",
    step: "02",
    title: "Enter a realistic context",
    body: "Join a company, role, team and project matched to a useful place to start. An assessment is available, not mandatory.",
    diagram: "context" as const,
  },
  {
    id: "work",
    step: "03",
    title: "Do meaningful work",
    body: "Make decisions, create artefacts and respond to stakeholders. AI colleagues support the work in context; you own every submission.",
    diagram: "work" as const,
  },
  {
    id: "review",
    step: "04",
    title: "Review what the work demonstrates",
    body: "Evidence keeps its provenance. Capability judgements use a versioned framework and explain why a band applies. ScoreRuns never light Verified alone.",
    diagram: "review" as const,
  },
  {
    id: "use",
    step: "05",
    title: "Use the record",
    body: "Choose the next Experience, strengthen a CV or portfolio in Launchpad, or carry better delivery habits into Professional Workspace.",
    diagram: "use" as const,
  },
] as const;

export const HOW_IT_WORKS_SOURCES = [
  {
    label: "Self-reported",
    body: "Something you told DeliverX about yourself.",
  },
  {
    label: "Imported draft",
    body: "Material brought in for review, not accepted as ledger evidence yet.",
  },
  {
    label: "Observed with consent",
    body: "An observation from Workspace; not automatically evidence or capability.",
  },
  {
    label: "Evidence",
    body: "A provenance-bearing record available for judgement.",
  },
  {
    label: "Externally verified",
    body: "A named independent attestor confirmed a specific claim.",
  },
] as const;

export const HOW_IT_WORKS_HANDOFFS = [
  {
    from: "Experience",
    to: "Professional Intelligence",
    line: "Work and artefacts become inspectable evidence with a clear source.",
  },
  {
    from: "Professional Intelligence",
    to: "Launchpad",
    line: "Judgements and evidence feed readiness, packaging and interview prep.",
  },
  {
    from: "Professional Intelligence",
    to: "Professional Workspace",
    line: "Delivery habits and contribution trails stay connected to the same record.",
  },
] as const;

export const HOW_IT_WORKS_FAQ = [
  {
    question: "Does completing work make me Verified?",
    answer:
      "No. Verified appears only when a named independent attestor confirms a specific claim. Experience work, ScoreRuns and learning completion never light Verified alone.",
  },
  {
    question: "Are AI drafts evidence?",
    answer:
      "No. AI colleagues can brief, question and draft in context. You remain responsible for every decision and submission. Drafts are labelled and do not enter the ledger as evidence automatically.",
  },
  {
    question: "Is the baseline assessment required?",
    answer:
      "No. An assessment is available to sharpen direction; you can start Experience without it.",
  },
  {
    question: "Is observation always on?",
    answer:
      "No. Continuous observation defaults OFF. When enabled with consent, observations remain distinct from evidence and capability.",
  },
] as const;

export type HowItWorksDiagramId = (typeof HOW_IT_WORKS_STEPS)[number]["diagram"];
