import type { ProductPageContent } from "@/lib/marketing/product-page";
import { careerTierById } from "@/lib/marketing/career-suite";
import { XPERIENCE_JOURNEY } from "@/lib/marketing/xperience-data";

const tier = careerTierById("xperience");

export const XPERIENCE_PAGE: ProductPageContent = {
  path: "/xperience",
  brandEyebrow: "DeliverX · Build Experience",
  name: "Xperience",
  promise: tier.headline,
  support: tier.summary,
  primaryCta: {
    href: tier.ctaHref,
    label: `${tier.cta} — ${tier.price}`,
  },
  how: {
    title: "Work inside the company. Evidence from the work.",
    subtitle:
      "You are given a realistic organisation from day one. Capability is built through projects, decisions and conversations — then carried into Launchpad when you are ready to land the opportunity.",
    steps: XPERIENCE_JOURNEY.map((item) => ({
      step: item.step,
      title: item.title,
      body: item.body,
    })),
  },
  pricing: {
    title: tier.headline,
    subtitle: `${tier.cadence} · Part of the DeliverX career progression.`,
    tiers: [
      {
        name: tier.productName,
        price: tier.price,
        cadence: tier.cadence,
        summary: tier.summary,
        features: tier.includes,
        cta: tier.cta,
        ctaHref: tier.ctaHref,
        featured: true,
        idealFor: tier.idealFor,
      },
    ],
  },
  idealFor: tier.idealFor,
  finalCta: {
    title: "Ready to build the experience?",
    subtitle: "Next: Launchpad helps you land the opportunity. Then Team Co-pilot helps you succeed in the role.",
    ctaLabel: tier.cta,
    ctaHref: tier.ctaHref,
  },
  footerCta: {
    title: "Start Xperience",
    subtitle: `${tier.price} · ${tier.cadence}. Or see the Complete Career Bundle.`,
    href: tier.ctaHref,
    label: tier.cta,
  },
};
