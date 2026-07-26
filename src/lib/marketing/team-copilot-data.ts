import type { ProductPageContent } from "@/lib/marketing/product-page";
import { BUNDLE_SIGNUP_HREF, careerTierById } from "@/lib/marketing/career-suite";

const tier = careerTierById("team-copilot");

export const TEAM_COPILOT_JOURNEY = [
  {
    step: "01",
    title: "One Professional Workspace",
    body: "Understand the project, work with AI teammates, run meetings, and manage stakeholders in one shell, not a separate chatbot product.",
  },
  {
    step: "02",
    title: "AI drafts. Humans decide.",
    body: "Artefacts, replies and options land as suggestions. You author, accept, edit and submit. Contribution trails record who did what.",
  },
  {
    step: "03",
    title: "Evidence from real work",
    body: "Decisions, risks, meetings and outcomes generate observable evidence. Capability is judged later, not assigned by the Workspace.",
  },
] as const;

export const TEAM_COPILOT_PAGE: ProductPageContent = {
  path: "/professional-workspace",
  stage: tier.stage,
  brandEyebrow: `DeliverX · ${tier.stage}`,
  name: "Professional Workspace",
  heroTitle: "Deliver with context. Keep human judgement in control.",
  promise:
    "Professional Workspace brings tasks, meetings, decisions, risks and artefacts together with contextual AI support. AI drafts; people decide and submit. Not an enterprise mission-control product.",
  primaryCta: {
    href: tier.ctaHref,
    label: "Get started",
  },
  secondaryCta: {
    href: "/how-it-works",
    label: "See how it works",
  },
  sections: [
    {
      id: "workspace",
      tone: "white",
      label: "Shared shell",
      title: "One workspace for Experience and delivery projects.",
      body: "Switch between Experience simulations and organisation delivery projects. Core modules stay coherent across Overview, Team, Stakeholders, Inbox, Meetings, Tasks, Artefacts, Decisions, Risks, Timeline, Coach and Evidence Review. Legacy mission-control depth stays opt-in and demoted.",
      items: [
        "Project Overview and Timeline",
        "Meetings, Inbox, Tasks and Artefacts",
        "Decisions, Risks, Coach and Evidence Review",
      ],
    },
    {
      id: "intelligence",
      tone: "cream",
      label: "AI teammates",
      title: "AI drafts. Humans decide.",
      body: "Role-based AI teammates prepare agendas, draft artefacts and surface options. Nothing submits, decides, or marks your work done without you.",
    },
    {
      id: "evidence",
      tone: "white",
      label: "Observable work",
      title: "Contribution trails, not silent automation.",
      body: "The system records what you authored, what AI suggested, what you accepted or edited, what you submitted, and what outcome followed.",
    },
    {
      id: "modules",
      tone: "cream",
      label: "Modules",
      title: "Multidisciplinary work, not a chatbot.",
      body: "Each module has clear user jobs, permissions, AI actions, evidence hooks and empty/error/completion states, so the Workspace stays a place of work.",
      items: TEAM_COPILOT_JOURNEY.map((j) => `${j.title}: ${j.body}`),
    },
  ],
  pricing: {
    label: "Access",
    title: tier.headline,
    subtitle: `${tier.cadence} · Stage three of the DeliverX journey.`,
    price: tier.price,
    cadence: tier.cadence,
    summary: tier.summary,
    cta: tier.cta,
    ctaHref: tier.ctaHref,
    bundleLabel: "Or explore the Complete Journey",
    bundleHref: "/pricing#bundle",
  },
  finalCta: {
    title: "Ready to work with AI teammates?",
    subtitle:
      "Open Professional Workspace for your delivery practice, or explore the Complete Journey if you also want Experience and Launchpad.",
    ctaLabel: tier.cta,
    ctaHref: tier.ctaHref,
    secondaryLabel: "Explore Complete Journey",
    secondaryHref: BUNDLE_SIGNUP_HREF,
  },
  footerCta: {
    title: "Get started in Professional Workspace",
    subtitle: `${tier.price} · ${tier.cadence}. Or explore the Complete Journey.`,
    href: tier.ctaHref,
    label: tier.cta,
  },
};
