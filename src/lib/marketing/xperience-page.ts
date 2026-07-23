import type { ProductPageContent } from "@/lib/marketing/product-page";
import {
  XPERIENCE_INCLUDES,
  XPERIENCE_JOURNEY,
  XPERIENCE_PRICING,
  XPERIENCE_SIGNUP_HREF,
} from "@/lib/marketing/xperience-data";

export const XPERIENCE_PAGE: ProductPageContent = {
  path: "/xperience",
  brandEyebrow: "DeliverX · AI Experience Company",
  name: "Xperience",
  promise: "Join a living company. Build professional capability.",
  support:
    "Xperience is an AI Experience Company — you work inside a persistent organisation with consequential decisions. Interview readiness can follow; it is not the product.",
  primaryCta: {
    href: XPERIENCE_SIGNUP_HREF,
    label: `Get access — ${XPERIENCE_PRICING.price}`,
  },
  how: {
    title: "Work inside the company. Evidence from the work.",
    subtitle:
      "You are hired into an organisation — not enrolled in a programme. Responsibility comes first; proof accumulates from decisions you make.",
    steps: XPERIENCE_JOURNEY.map((item) => ({
      step: item.step,
      title: item.title,
      body: item.body,
    })),
  },
  pricing: {
    title: "One company experience",
    subtitle: "Separate from Launchpad (roles & Career Record) and Team Co-pilot (team workspace).",
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
    title: "Ready to join the company?",
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
