import type { ProductPageContent } from "@/lib/marketing/product-page";
import { BUNDLE_SIGNUP_HREF, careerTierById } from "@/lib/marketing/career-suite";

const tier = careerTierById("team-copilot");

export const TEAM_COPILOT_JOURNEY = [
  {
    step: "01",
    title: "One delivery workspace",
    body: "PM, programme, BA, engineering, QA and leadership share the same delivery truth — no more scattered docs and conflicting status.",
  },
  {
    step: "02",
    title: "AI drafts. Humans decide.",
    body: "Business cases, PRDs, RAID, meeting summaries and recommendations land as drafts. Nothing applies without a human decision.",
  },
  {
    step: "03",
    title: "Stay aligned to launch",
    body: "Roadmaps, sprints, risk intelligence, release planning and executive reporting live in one operating system through to release.",
  },
] as const;

export const TEAM_COPILOT_PAGE: ProductPageContent = {
  path: "/team-copilot",
  stage: tier.stage,
  brandEyebrow: `DeliverX · ${tier.stage}`,
  name: "Team Co-pilot",
  promise:
    "The AI delivery OS for real product teams — coordinate people, projects and decisions in one shared workspace.",
  primaryCta: {
    href: tier.ctaHref,
    label: `Get access — ${tier.price}`,
  },
  secondaryCta: {
    href: "/pricing",
    label: "See pricing",
  },
  problem: {
    label: "Why it matters",
    title: "Delivery fails when the team does not share the same truth.",
    body: "Modern product teams lose weeks to status theatre, disconnected tools and AI that invents work without ownership. Team Co-pilot is a collaborative Product Delivery Operating System — one workspace where the whole team plans, decides and ships with intelligent support that never bypasses human judgement.",
  },
  how: {
    label: "How it works",
    title: "Built for teams who are already delivering.",
    subtitle:
      "Not a career simulation. Team Co-pilot is the operating layer for real product delivery — from discovery and roadmaps through RAID, sprints and executive reporting.",
    steps: TEAM_COPILOT_JOURNEY.map((item) => ({
      step: item.step,
      title: item.title,
      body: item.body,
    })),
  },
  includes: {
    label: "What's included",
    title: "Everything a delivery team needs in one OS.",
    subtitle:
      "Role workspaces, AI Delivery Brain, planning artefacts and health monitoring — designed for cross-functional product teams.",
    items: tier.includes,
    highlightCount: 8,
  },
  idealFor: {
    label: "Ideal for",
    title: "Who thrives with Team Co-pilot",
    body: tier.idealFor,
  },
  pricing: {
    label: "Team Co-pilot pricing",
    title: tier.headline,
    subtitle: `${tier.cadence} · Stage three of the DeliverX path — succeed in the role.`,
    price: tier.price,
    cadence: tier.cadence,
    summary: tier.summary,
    cta: tier.cta,
    ctaHref: tier.ctaHref,
    bundleLabel: "Or get the Complete Bundle",
    bundleHref: "/pricing#bundle",
  },
  finalCta: {
    title: "Ready to deliver with confidence?",
    subtitle:
      "Start Team Co-pilot for your team — or take the Complete Bundle if you also want Xperience and Launchpad.",
    ctaLabel: tier.cta,
    ctaHref: tier.ctaHref,
    secondaryLabel: "Get the Complete Bundle",
    secondaryHref: BUNDLE_SIGNUP_HREF,
  },
  footerCta: {
    title: "Start Team Co-pilot",
    subtitle: `${tier.price} · ${tier.cadence}. Or take the Complete Career Bundle.`,
    href: tier.ctaHref,
    label: tier.cta,
  },
};
