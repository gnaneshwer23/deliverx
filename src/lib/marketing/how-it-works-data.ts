/**
 * How DeliverX works — marketing lifecycle copy.
 * Visual system matches Experience / Launchpad / Professional Workspace product pages.
 * Aligned to screen-pack-01/02 and product trust rails.
 */

import {
  BUNDLE_SIGNUP_HREF,
  PILOT_ACCESS_CADENCE,
  PILOT_ACCESS_LABEL,
  XPERIENCE_SIGNUP_HREF,
  careerTierById,
} from "@/lib/marketing/career-suite";
import type { ProductFaqItem, ProductNarrativeSection } from "@/lib/marketing/product-page";

const experienceTier = careerTierById("xperience");

/** Matches ProductDashboardMock variants on product marketing pages. */
export type HowItWorksMockVariant =
  | "experience"
  | "launchpad"
  | "workspace"
  | "intelligence";

export type HowItWorksStep = {
  id: string;
  step: string;
  title: string;
  body: string;
  /** Shared dashboard mock used on Experience / Launchpad / Workspace pages */
  mock: HowItWorksMockVariant;
  mockCaption: string;
};

export type HowItWorksPageContent = {
  path: string;
  brandEyebrow: string;
  name: string;
  heroTitle: string;
  promise: string;
  trustLine: string;
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
  intro: ProductNarrativeSection;
  firstStep: ProductNarrativeSection;
  pipeline: {
    label: string;
    title: string;
    subtitle: string;
    nodes: readonly { id: string; label: string; detail: string }[];
  };
  stepsIntro: {
    label: string;
    title: string;
    subtitle: string;
  };
  steps: readonly HowItWorksStep[];
  sources: {
    label: string;
    title: string;
    subtitle: string;
    items: readonly { label: string; body: string }[];
  };
  handoffs: {
    label: string;
    title: string;
    subtitle: string;
    items: readonly { from: string; to: string; line: string; href: string }[];
  };
  faq: {
    label: string;
    title: string;
    items: readonly ProductFaqItem[];
  };
  pricing: {
    label: string;
    title: string;
    subtitle: string;
    price: string;
    cadence: string;
    summary: string;
    cta: string;
    ctaHref: string;
    bundleLabel: string;
    bundleHref: string;
  };
  finalCta: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
  footerCta: {
    title: string;
    subtitle: string;
    href: string;
    label: string;
  };
};

export const HOW_IT_WORKS_PAGE: HowItWorksPageContent = {
  path: "/how-it-works",
  brandEyebrow: "DeliverX · How it works",
  name: "How it works",
  heroTitle: "Turn realistic work into a professional record you can explain.",
  promise:
    "DeliverX connects direction, experience, evidence and career action — without treating self-report, AI observation or course completion as proven capability.",
  trustLine:
    "Evidence before claims. AI drafts are labelled. ScoreRuns never light Verified alone. Learning is not capability.",
  primaryCta: {
    href: XPERIENCE_SIGNUP_HREF,
    label: "Start your experience",
  },
  secondaryCta: {
    href: "/experience",
    label: "Explore Experience",
  },
  intro: {
    id: "what",
    tone: "white",
    label: "What DeliverX is",
    title: "One evidence-driven loop — not a course, chat bot or score theatre.",
    body: "Professional Intelligence is the shared record. Experience generates evidence through realistic work. Launchpad packages that record for career moves. Professional Workspace carries delivery habits into real teams. Everything either creates trustworthy evidence or consumes it.",
    items: [
      "You own decisions and submissions — AI drafts stay labelled",
      "Capability judgements use a versioned framework and explain why a band applies",
      "Verified means a named independent attestor confirmed a specific claim",
    ],
  },
  firstStep: {
    id: "start",
    tone: "cream",
    label: "What to do first",
    title: "Begin with direction, then enter a company context.",
    body: "New visitors start by mapping who they are professionally — self-reported answers that guide recommendations, not evidence. Next you join a realistic company, role, team and project. An assessment is available; it is not mandatory.",
    items: [
      "Create an account and complete Professional Identity mapping",
      "Choose Experience and enter company → role → team → project",
      "Do the work, review what it demonstrates, then use the record",
    ],
  },
  pipeline: {
    label: "At a glance",
    title: "Work becomes a record you can act on.",
    subtitle: "One connected flow — not a course playlist and a separate career tool.",
    nodes: [
      { id: "work", label: "Work", detail: "Company context" },
      { id: "evidence", label: "Evidence", detail: "Provenance kept" },
      { id: "capability", label: "Capability", detail: "Framework judgement" },
      { id: "next", label: "Next step", detail: "Career action" },
    ],
  },
  stepsIntro: {
    label: "The loop",
    title: "Five steps from direction to career action.",
    subtitle:
      "Scan this once and you will know exactly what DeliverX does — and what it never pretends.",
  },
  steps: [
    {
      id: "direction",
      step: "01",
      title: "Map your direction",
      body: "Share your current context, target role and priorities. These answers are self-reported and guide recommendations — they do not create evidence or capability.",
      mock: "intelligence",
      mockCaption: "Professional Identity mapping — self-reported direction, not evidence",
    },
    {
      id: "context",
      step: "02",
      title: "Enter a realistic context",
      body: "Join a company, role, team and project matched to a useful place to start. An assessment is available, not mandatory.",
      mock: "experience",
      mockCaption: "Experience company context — company, role, team and project",
    },
    {
      id: "work",
      step: "03",
      title: "Do meaningful work",
      body: "Make decisions, create artefacts and respond to stakeholders. AI colleagues support the work in context; you own every submission. Drafts are labelled and never enter the ledger automatically.",
      mock: "experience",
      mockCaption: "Active project work — you submit; AI drafts stay labelled",
    },
    {
      id: "review",
      step: "04",
      title: "Review what the work demonstrates",
      body: "Evidence keeps its provenance. Capability judgements use a versioned framework and explain why a band applies. ScoreRuns never light Verified alone.",
      mock: "intelligence",
      mockCaption: "Evidence and Capability Engine — explainable bands, Verified only via attestation",
    },
    {
      id: "use",
      step: "05",
      title: "Use the record",
      body: "Choose the next Experience, strengthen a CV or portfolio in Launchpad, or carry better delivery habits into Professional Workspace.",
      mock: "launchpad",
      mockCaption: "Launchpad and Workspace consume the same Professional Intelligence record",
    },
  ],
  sources: {
    label: "Evidence sources",
    title: "The source matters.",
    subtitle: "Professional Intelligence keeps claims, evidence, judgements and attestations distinct.",
    items: [
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
    ],
  },
  handoffs: {
    label: "Product hand-offs",
    title: "Experience generates. Intelligence interprets. Products consume.",
    subtitle: "Same record across the suite — no duplicated professional truth.",
    items: [
      {
        from: "Experience",
        to: "Professional Intelligence",
        line: "Work and artefacts become inspectable evidence with a clear source.",
        href: "/experience",
      },
      {
        from: "Professional Intelligence",
        to: "Launchpad",
        line: "Judgements and evidence feed readiness, packaging and interview prep.",
        href: "/launchpad",
      },
      {
        from: "Professional Intelligence",
        to: "Professional Workspace",
        line: "Delivery habits and contribution trails stay connected to the same record.",
        href: "/professional-workspace",
      },
    ],
  },
  faq: {
    label: "FAQ",
    title: "Clear boundaries",
    items: [
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
    ],
  },
  pricing: {
    label: "Access",
    title: "Start with Experience during the pilot.",
    subtitle: `${PILOT_ACCESS_CADENCE} · First stage of the DeliverX journey.`,
    price: PILOT_ACCESS_LABEL,
    cadence: experienceTier.cadence,
    summary:
      "Map your direction, enter a realistic company and begin building evidence you can explain. Paid packaging is not live until checkout is configured.",
    cta: experienceTier.cta,
    ctaHref: experienceTier.ctaHref,
    bundleLabel: "Or explore the Complete Journey",
    bundleHref: "/pricing#bundle",
  },
  finalCta: {
    title: "Begin with a clear first step.",
    subtitle:
      "Map your direction, enter a realistic company and begin building evidence you can explain.",
    ctaLabel: "Start your experience",
    ctaHref: XPERIENCE_SIGNUP_HREF,
    secondaryLabel: "Explore Complete Journey",
    secondaryHref: BUNDLE_SIGNUP_HREF,
  },
  footerCta: {
    title: "Start with Experience",
    subtitle: `${PILOT_ACCESS_LABEL} · ${experienceTier.cadence}. Or explore the Complete Journey.`,
    href: experienceTier.ctaHref,
    label: experienceTier.cta,
  },
};

/** @deprecated Prefer HOW_IT_WORKS_PAGE — kept for any residual imports */
export const HOW_IT_WORKS_HERO = {
  label: HOW_IT_WORKS_PAGE.brandEyebrow,
  title: HOW_IT_WORKS_PAGE.heroTitle,
  support: HOW_IT_WORKS_PAGE.promise,
  primaryCta: HOW_IT_WORKS_PAGE.primaryCta,
  secondaryCta: HOW_IT_WORKS_PAGE.secondaryCta,
} as const;

export const HOW_IT_WORKS_PIPELINE = HOW_IT_WORKS_PAGE.pipeline.nodes;
export const HOW_IT_WORKS_STEPS = HOW_IT_WORKS_PAGE.steps;
export const HOW_IT_WORKS_SOURCES = HOW_IT_WORKS_PAGE.sources.items;
export const HOW_IT_WORKS_HANDOFFS = HOW_IT_WORKS_PAGE.handoffs.items;
export const HOW_IT_WORKS_FAQ = HOW_IT_WORKS_PAGE.faq.items;
