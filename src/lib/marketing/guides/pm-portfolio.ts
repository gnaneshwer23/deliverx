import type { MarketingGuide } from "@/lib/marketing/guides/types";

/**
 * Flagship guide — PM portfolio employers can evaluate.
 * Charter-honest: evidence ≠ certificates; learning ≠ capability; Verified = attestation.
 */
export const PM_PORTFOLIO_GUIDE: MarketingGuide = {
  slug: "pm-portfolio",
  path: "/resources/pm-portfolio",
  title: "How to build a PM portfolio employers can evaluate",
  description:
    "Build a Product Manager portfolio from artefacts and decisions — not certificates. Separate claims, evidence and capability; keep Verified honest.",
  eyebrow: "Guide · Portfolio",
  lede:
    "Hiring managers do not need another gallery of course logos. They need a trail of work they can inspect: problems framed, decisions taken, artefacts produced, and outcomes stated without theatre. This guide shows how to assemble that trail — and how DeliverX keeps the language honest.",
  updatedLabel: "Updated September 2026 · Pilot orientation",
  sections: [
    {
      id: "why-portfolios-fail",
      title: "Why most PM portfolios fail a serious review",
      paragraphs: [
        "Hiring managers who evaluate Product Managers are not looking for a certificate wall. They are looking for judgement under constraint: how you framed a problem, what you cut, who disagreed, and what artefact proves the claim.",
        "Many candidates present tool badges, course logos, and self-declared skill lists. That material shows exposure. It does not show trade-offs, stakeholder conflict, or prioritisation under incomplete information — the work someone else could audit.",
        "A second failure mode is decorative scoring: readiness percentages, case scores, or confidence numbers with no method. If you cannot explain how a number was produced, do not put it in front of an employer. Unexplained scores erode trust faster than a sparse but honest portfolio.",
        "A third failure mode is treating learning completion as capability. Finishing a path or watching a lecture is useful. It is not the same as demonstrated competency. Keep those labels separate so your packaging stays credible.",
      ],
    },
    {
      id: "evidence-vs-certificates",
      title: "Evidence versus certificates versus claims",
      paragraphs: [
        "Use three buckets and refuse to blur them.",
        "Claims are what you say about yourself — goals, self-assessments, preferred domains. They are useful for direction. They are not proof.",
        "Evidence is a provenance-backed record of work: a PRD version, a discovery note, a trade-off memo, a launch checklist, a decision log, or an outcome you can cite. Evidence should answer who produced it, when, and in what context.",
        "Capability is a judgement over evidence — typically via a structured assessment or ScoreRun — not a course tick and not a Verified badge. In DeliverX, learning paths never write competency levels and never light Verified.",
      ],
      bullets: [
        "Certificates and courses → knowledge / exposure (label them as such)",
        "Artefacts and decisions with provenance → evidence",
        "Judgement over evidence via the Capability Engine → capability bands you can explain",
        "Independent confirmation of a claim → attestation that can light deliverxVerified",
      ],
    },
    {
      id: "what-to-include",
      title: "What to include in an evaluable portfolio",
      paragraphs: [
        "Prefer a short set of deep case slices over a long list of shallow titles. For each slice, show the problem, the constraints, the options you considered, the decision you made, the artefact you produced, and the outcome — including partial or negative outcomes when that is the truth.",
        "Strong artefact types for Product Managers include problem framing notes, PRDs or opportunity briefs, discovery synthesis, prioritisation rationales, experiment designs, go-to-market outlines, and delivery risk notes. Screenshots of tools without narrative are weak. Narrative without artefacts is also weak. Pair them.",
        "Label self-reported claims clearly. If a metric is estimated, say so. If work happened in a simulated company environment, say so. Simulated practice can still develop judgement when the loop is explicit; hiding the context invites distrust.",
      ],
      bullets: [
        "One-page case summary: context → decision → artefact → outcome",
        "Link or attach the artefact version you are willing to show",
        "Separate private evidence from what you share with employers",
        "Never invent placement outcomes or marketplace endorsements from employers",
      ],
    },
    {
      id: "how-deliverx-helps",
      title: "How DeliverX supports this without inventing scores",
      paragraphs: [
        "Experience is designed so Product Managers build practical work inside seeded AI company environments. Completed work can feed an append-oriented evidence ledger. AI coaches draft; you decide what becomes evidence. Observation consent defaults off.",
        "Launchpad packages that record for applications: Career Intelligence with labelled readiness sources (ScoreRun projection, mixed, or heuristic), evidence-backed CV and portfolio views, and Interview Lab for STAR practice tied to artefacts. Readiness bands that cannot explain their source are not treated as capability truth.",
        "Professional Workspace (Team Copilot is the Workspace alias — not a third SKU) is where delivery habits continue once you are in a role. It is not required to assemble a first portfolio, and it is not an enterprise mission-control product in the current pilot.",
        "deliverxVerified is an attestation signal. ScoreRuns alone never light Verified. External attestation is the path that can. That keeps the badge from becoming vanity packaging. Purchasable prices appear only when Stripe Checkout is configured; until then speak in pilot access terms.",
      ],
    },
    {
      id: "checklist",
      title: "A practical checklist before you share",
      paragraphs: [
        "Before sending a portfolio link or attaching case studies to an application, walk this list once.",
      ],
      bullets: [
        "Every case cites at least one artefact or decision an outsider could inspect",
        "Self-reported claims are labelled; learning items are not presented as competency",
        "No unexplained readiness percentage or decorative case score",
        "Verified appears only if independent attestation supports it",
        "Private evidence stays private; share views exclude confidential material",
        "You can answer follow-up questions from the artefacts, not from memorised slogans",
      ],
    },
  ],
  related: [
    {
      href: "/resources/star-interview-stories",
      label: "STAR interview stories grounded in evidence",
    },
    { href: "/resources", label: "All resources" },
    { href: "/about", label: "About DeliverX trust rails" },
  ],
  primaryCta: { href: "/launchpad", label: "Explore Launchpad packaging" },
  secondaryCta: { href: "/experience", label: "Explore Experience" },
};
