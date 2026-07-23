import type { ProductPageContent } from "@/lib/marketing/product-page";
import { careerTierById } from "@/lib/marketing/career-suite";

const tier = careerTierById("team-copilot");

export const TEAM_COPILOT_PAGE: ProductPageContent = {
  path: "/team-copilot",
  brandEyebrow: "DeliverX · Deliver Products Together",
  name: "Team Co-pilot",
  promise: tier.headline,
  support: tier.summary,
  primaryCta: {
    href: tier.ctaHref,
    label: `${tier.cta} — ${tier.price}`,
  },
  how: {
    label: "How it works",
    title: "Built for teams who already have the job",
    subtitle:
      "Xperience builds capability. Launchpad opens the opportunity. Team Co-pilot helps you succeed once you are delivering with a real team.",
    steps: [
      {
        step: "01",
        title: "One delivery workspace",
        body: "PM, programme, BA, engineering, QA and leadership share the same delivery truth.",
      },
      {
        step: "02",
        title: "AI drafts. You approve.",
        body: "Business cases, PRDs, RAID, meeting summaries and recommendations — nothing applies without a human decision.",
      },
      {
        step: "03",
        title: "Stay aligned to launch",
        body: "Roadmaps, sprints, risk intelligence, release planning and executive reporting in one operating system.",
      },
    ],
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
    title: "Ready to deliver with confidence?",
    subtitle: "Part of the path: build experience → land the opportunity → succeed in the role.",
    ctaLabel: tier.cta,
    ctaHref: tier.ctaHref,
  },
  footerCta: {
    title: "Start Team Co-pilot",
    subtitle: `${tier.price} · ${tier.cadence}. Or see the Complete Career Bundle.`,
    href: tier.ctaHref,
    label: tier.cta,
  },
};
