import type { ProductPageContent } from "@/lib/marketing/product-page";
import { BUNDLE_SIGNUP_HREF, careerTierById } from "@/lib/marketing/career-suite";
import { LAUNCHPAD_JOURNEY } from "@/lib/marketing/launchpad-data";

const tier = careerTierById("launchpad");

export const LAUNCHPAD_PAGE: ProductPageContent = {
  path: "/launchpad",
  stage: tier.stage,
  brandEyebrow: `DeliverX · ${tier.stage}`,
  name: "Launchpad",
  promise:
    "Turn experience into interviews — Career Twin, portfolio, mock interviews and a readiness score that shows you are ready.",
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
    title: "Experience only opens doors when you can present it.",
    body: "Strong work still fails interviews when the CV is vague, stories are unstructured, or you cannot connect your skills to the role. Launchpad packages your evidence, sharpens how you speak about it, and prepares you to win the conversation.",
  },
  how: {
    label: "How it works",
    title: "Turn experience into opportunity.",
    subtitle:
      "Xperience builds the work record. Launchpad helps you present it, prepare for interviews and connect with opportunities that match your skills.",
    steps: LAUNCHPAD_JOURNEY.map((item) => ({
      step: item.step,
      title: item.title,
      body: item.body,
    })),
  },
  includes: {
    label: "What's included",
    title: "Career readiness, end to end.",
    subtitle:
      "Assessment, packaging and interview prep in one programme — so you walk into opportunities with clarity and confidence.",
    items: tier.includes,
    highlightCount: 6,
  },
  idealFor: {
    label: "Ideal for",
    title: "Who thrives in Launchpad",
    body: tier.idealFor,
  },
  pricing: {
    label: "Launchpad pricing",
    title: tier.headline,
    subtitle: `${tier.cadence} · Stage two of the DeliverX career progression.`,
    price: tier.price,
    cadence: tier.cadence,
    summary: tier.summary,
    cta: tier.cta,
    ctaHref: tier.ctaHref,
    bundleLabel: "Or get the Complete Bundle",
    bundleHref: "/pricing#bundle",
  },
  finalCta: {
    title: "Ready to get career-ready?",
    subtitle:
      "Start Launchpad now — or take the Complete Bundle if you also need company experience and delivery tools.",
    ctaLabel: tier.cta,
    ctaHref: tier.ctaHref,
    secondaryLabel: "Get the Complete Bundle",
    secondaryHref: BUNDLE_SIGNUP_HREF,
  },
  footerCta: {
    title: "Start Launchpad",
    subtitle: `${tier.price} · ${tier.cadence}. Or take the Complete Career Bundle.`,
    href: tier.ctaHref,
    label: tier.cta,
  },
};
