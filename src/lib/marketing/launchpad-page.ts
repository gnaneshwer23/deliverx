import type { ProductPageContent } from "@/lib/marketing/product-page";
import { careerTierById } from "@/lib/marketing/career-suite";
import { LAUNCHPAD_JOURNEY } from "@/lib/marketing/launchpad-data";

const tier = careerTierById("launchpad");

export const LAUNCHPAD_PAGE: ProductPageContent = {
  path: "/launchpad",
  brandEyebrow: "DeliverX · Advance Your Career",
  name: "Launchpad",
  promise: tier.headline,
  support: tier.summary,
  primaryCta: {
    href: tier.ctaHref,
    label: `${tier.cta} — ${tier.price}`,
  },
  how: {
    title: "Turn experience into opportunity.",
    subtitle:
      "Xperience builds the work record. Launchpad helps you present it, prepare for interviews and connect with opportunities that match your skills.",
    steps: LAUNCHPAD_JOURNEY.map((item) => ({
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
    title: "Ready to get career-ready?",
    subtitle: "Build experience in Xperience first if you need it — then succeed in the role with Team Co-pilot.",
    ctaLabel: tier.cta,
    ctaHref: tier.ctaHref,
  },
  footerCta: {
    title: "Start Launchpad",
    subtitle: `${tier.price} · ${tier.cadence}. Or see the Complete Career Bundle.`,
    href: tier.ctaHref,
    label: tier.cta,
  },
};
