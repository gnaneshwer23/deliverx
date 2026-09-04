import type { MarketingGuide } from "@/lib/marketing/guides/types";

/**
 * Flagship guide — STAR stories from evidence, tied to Interview Lab.
 * Charter-honest: practice ≠ capability; Verified = attestation; no placement guarantees.
 */
export const STAR_INTERVIEW_STORIES_GUIDE: MarketingGuide = {
  slug: "star-interview-stories",
  path: "/resources/star-interview-stories",
  title: "STAR interview stories grounded in real artefacts",
  description:
    "Build STAR answers from evidence you can cite. Practise in Launchpad Interview Lab without treating rehearsal as capability or inventing placement outcomes.",
  eyebrow: "Guide · Interview Lab",
  lede:
    "STAR works when Situation, Task, Action, and Result point to something you actually produced. Vague stories collapse under follow-up. This guide shows how to ground each letter in artefacts and decisions — then rehearse honestly in Launchpad Interview Lab.",
  updatedLabel: "Updated September 2026 · Pilot orientation",
  sections: [
    {
      id: "why-star-breaks",
      title: "Why generic STAR answers break in the room",
      paragraphs: [
        "Interviewers who hire Product Managers probe for specificity. They ask which options you rejected, what data you lacked, who disagreed, and what you would do differently. Answers built from templates and buzzwords fail that probe.",
        "Another failure mode is rehearsing fiction. Practising delivery is valuable. Inventing outcomes, inflating scope, or claiming Verified status without attestation is not. If your story cannot survive a request for the artefact, rewrite the story.",
        "A third failure mode is treating interview practice itself as proof of capability. Rehearsal improves presentation. It does not assign competency levels. Keep that boundary clear when you talk about preparation.",
      ],
    },
    {
      id: "map-star-to-evidence",
      title: "Map each STAR letter to evidence",
      paragraphs: [
        "Start from the evidence ledger or your artefact folder, not from a blank story template. Pick a decision or deliverable first, then narrate.",
      ],
      bullets: [
        "Situation — the context: company or product constraint, stakeholder pressure, timebox. Cite a brief, ticket, or kickoff note if you have one.",
        "Task — the responsibility that was yours. Avoid claiming ownership you cannot support.",
        "Action — the concrete steps and trade-offs. Point to a PRD section, prioritisation memo, experiment plan, or decision log.",
        "Result — outcome with honest scope. Partial wins and failed experiments are stronger than unverifiable hero metrics.",
      ],
    },
    {
      id: "choose-stories",
      title: "Choosing three stories that cover judgement",
      paragraphs: [
        "Most interviews do not need twenty anecdotes. Prepare three deep stories that show different muscles: discovery under ambiguity, prioritisation under constraint, and delivery or stakeholder conflict. Depth beats coverage.",
        "For each story, keep one artefact id or filename you are willing to discuss. If the work happened in DeliverX Experience, say that it was simulated company practice with an explicit evidence trail — do not present it as employment history.",
        "Avoid decorative scores in the narrative. Do not quote an unexplained readiness percentage. Do say what the ScoreRun or readiness view labelled as its source, if you reference it at all. Prefer explaining the decision over quoting a band.",
      ],
    },
    {
      id: "interview-lab",
      title: "Practising in Launchpad Interview Lab",
      paragraphs: [
        "Launchpad Interview Lab is built for structured rehearsal: STAR drafting and practice sessions that can cite evidence ids where available. Sessions are recorded as observations. They do not write capability and they do not light Verified.",
        "Use the lab to pressure-test follow-ups. Ask yourself (or the coach draft) what artefact backs the Action, what you would change in the Result, and where the claim is still self-reported. Label AI feedback as a draft — not as employer truth.",
        "Bind each practice session to a target role and the evidence you are willing to show. Untethered chat rehearse is easy to inflate; evidence-bound rehearsal stays closer to what a hiring conversation will actually probe.",
        "Career Intelligence readiness stays source-labelled: ScoreRun projection, mixed, or heuristic. Interview Lab prepares presentation of evidence. It does not invent hiring liquidity or guarantee an offer.",
      ],
    },
    {
      id: "honesty-rails",
      title: "Honesty rails while you rehearse",
      paragraphs: [
        "Keep these rails visible while you practise so packaging stays charter-aligned. Calm professional growth depends on clear language more than on volume of rehearsal hours.",
      ],
      bullets: [
        "Learning completion is not capability",
        "AI observations and coach drafts are not verified evidence",
        "ScoreRuns never light deliverxVerified — attestation does",
        "No money-back, placement, or marketplace claims in your pitch",
        "Team Copilot is the Professional Workspace alias — not a third SKU to name-drop as a separate product",
        "Payments and purchasable prices appear only when Stripe Checkout is configured; until then speak in pilot access terms",
      ],
    },
    {
      id: "rehearsal-checklist",
      title: "Rehearsal checklist",
      paragraphs: [
        "Run this once before a live interview.",
      ],
      bullets: [
        "Each STAR story maps to at least one artefact or decision you can name",
        "You can answer “what did you not do?” without inventing drama",
        "Results are scoped honestly — no fake case scores",
        "Practice notes stay labelled as rehearsal, not as assessed capability",
        "Share settings keep private evidence private",
      ],
    },
  ],
  related: [
    {
      href: "/resources/pm-portfolio",
      label: "How to build a PM portfolio employers can evaluate",
    },
    { href: "/resources", label: "All resources" },
    { href: "/launchpad", label: "Launchpad product overview" },
  ],
  primaryCta: { href: "/launchpad", label: "Open Launchpad" },
  secondaryCta: { href: "/how-it-works", label: "How DeliverX works" },
};
