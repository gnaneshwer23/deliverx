import type { ProductPageContent } from "@/lib/marketing/product-page";
import { BUNDLE_SIGNUP_HREF, careerTierById } from "@/lib/marketing/career-suite";
import { XPERIENCE_JOURNEY } from "@/lib/marketing/xperience-data";

const tier = careerTierById("xperience");

export const XPERIENCE_PAGE: ProductPageContent = {
  path: "/xperience",
  stage: tier.stage,
  brandEyebrow: `DeliverX · ${tier.stage}`,
  name: "Xperience",
  promise:
    "Join an AI-powered company as a Product Manager — build real capability, not another certificate.",
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
    title: "Employers hire people who have done the work.",
    body: "Job descriptions ask for product experience you cannot get from courses alone. Xperience puts you inside a living organisation — with customers, stakeholders, trade-offs and launches — so you leave with judgement and a portfolio of evidence, not slides.",
  },
  how: {
    label: "How it works",
    title: "Work inside the company. Evidence from the work.",
    subtitle:
      "You join a realistic organisation from day one. Capability is built through projects, decisions and conversations — then carried into Launchpad when you are ready to land the opportunity.",
    steps: XPERIENCE_JOURNEY.map((item) => ({
      step: item.step,
      title: item.title,
      body: item.body,
    })),
  },
  includes: {
    label: "What's included",
    title: "A full company experience — not a course.",
    subtitle:
      "From discovery and strategy through delivery, coaching and portfolio output. Everything listed below is part of your 3-month access.",
    items: tier.includes,
    highlightCount: 8,
  },
  idealFor: {
    label: "Ideal for",
    title: "Who thrives in Xperience",
    body: tier.idealFor,
  },
  pricing: {
    label: "Xperience pricing",
    title: tier.headline,
    subtitle: `${tier.cadence} · Stage one of the DeliverX career progression.`,
    price: tier.price,
    cadence: tier.cadence,
    summary: tier.summary,
    cta: tier.cta,
    ctaHref: tier.ctaHref,
    bundleLabel: "Or get the Complete Bundle",
    bundleHref: "/pricing#bundle",
  },
  finalCta: {
    title: "Ready to build the experience?",
    subtitle:
      "Start Xperience now — or take the Complete Bundle and continue into Launchpad and Team Co-pilot.",
    ctaLabel: tier.cta,
    ctaHref: tier.ctaHref,
    secondaryLabel: "Get the Complete Bundle",
    secondaryHref: BUNDLE_SIGNUP_HREF,
  },
  footerCta: {
    title: "Start Xperience",
    subtitle: `${tier.price} · ${tier.cadence}. Or take the Complete Career Bundle.`,
    href: tier.ctaHref,
    label: tier.cta,
  },
};
