import type { ProductPageContent } from "@/lib/marketing/product-page";
import {
  XPERIENCE_INCLUDES,
  XPERIENCE_JOURNEY,
  XPERIENCE_PRICING,
  XPERIENCE_SIGNUP_HREF,
} from "@/lib/marketing/xperience-data";

export const XPERIENCE_PAGE: ProductPageContent = {
  path: "/xperience",
  name: "Xperience",
  promise: "Your first product role starts here.",
  support:
    "Join an AI-powered company, inherit responsibility and build a record of how you think and deliver.",
  primaryCta: {
    href: XPERIENCE_SIGNUP_HREF,
    label: `Get access — ${XPERIENCE_PRICING.price}`,
  },
  how: {
    title: "Work, not learning. Evidence, not certificates.",
    subtitle:
      "You join a company — not a course. Decisions have consequences. Evidence comes from the work.",
    steps: XPERIENCE_JOURNEY.map((item) => ({
      step: item.step,
      title: item.title,
      body: item.body,
    })),
  },
  pricing: {
    title: "One professional experience",
    subtitle: "Separate from Launchpad and Team Co-pilot pricing.",
    tiers: [
      {
        name: XPERIENCE_PRICING.name,
        price: XPERIENCE_PRICING.price,
        cadence: XPERIENCE_PRICING.cadence,
        summary: XPERIENCE_PRICING.summary,
        features: XPERIENCE_INCLUDES.slice(0, 5),
        cta: XPERIENCE_PRICING.cta,
        ctaHref: XPERIENCE_SIGNUP_HREF,
        featured: true,
      },
    ],
  },
  finalCta: {
    title: "Ready to start your experience?",
    subtitle: "Create your account, complete payment, and receive login credentials.",
    ctaLabel: "Get access",
    ctaHref: XPERIENCE_SIGNUP_HREF,
  },
  footerCta: {
    title: "Get Xperience access",
    subtitle: `${XPERIENCE_PRICING.price} one-time. Login credentials after checkout.`,
    href: XPERIENCE_SIGNUP_HREF,
    label: "Get access",
  },
};
