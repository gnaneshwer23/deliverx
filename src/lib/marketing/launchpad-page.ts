import type { ProductPageContent } from "@/lib/marketing/product-page";
import { LAUNCHPAD_PRICING, LAUNCHPAD_ROLES_HREF } from "@/lib/marketing/launchpad-data";

export const LAUNCHPAD_PAGE: ProductPageContent = {
  path: "/launchpad",
  name: "Launchpad",
  promise: "Your experience starts here.",
  support:
    "Join an AI-powered company. Work with realistic teams, manage live product challenges and build evidence of what you can do — before an employer gives you the title.",
  primaryCta: { href: LAUNCHPAD_ROLES_HREF, label: "Explore Open Roles" },
  how: {
    title: "You are not joining a course. You are joining a company.",
    subtitle:
      "Inherit a product, customers, constraints and commercial pressure. Every decision has a consequence. Your Career Record grows from authentic work.",
    steps: [
      {
        step: "01",
        title: "Explore open roles",
        body: "Browse company roles, meet stakeholders and understand the product environment before you commit.",
      },
      {
        step: "02",
        title: "Do the work",
        body: "Manage challenges with your AI team — customers, engineering, sales and leadership all remember your decisions.",
      },
      {
        step: "03",
        title: "Build your Career Record",
        body: "Projects, decisions, artefacts and outcomes connect into evidence you can show — not a course certificate.",
      },
    ],
  },
  pricing: {
    title: "Start your first company experience",
    subtitle: "No hidden course fees. Role and access shown before payment.",
    tiers: LAUNCHPAD_PRICING.map((tier) => ({
      name: tier.name,
      price: tier.price,
      summary: tier.summary,
      features: tier.features.slice(0, 5),
      cta: tier.cta,
      ctaHref: tier.ctaHref,
      featured: tier.featured,
      cadence: tier.cadence || undefined,
    })),
  },
  finalCta: {
    title: "Employers expect experience. Start building yours.",
    subtitle:
      "Your first Product Manager role can begin before your first Product Manager job.",
    ctaLabel: "Explore Open Roles",
    ctaHref: LAUNCHPAD_ROLES_HREF,
  },
  footerCta: {
    title: "Your experience starts here.",
    subtitle: "Free preview or Full Company Experience from £49.",
    href: LAUNCHPAD_ROLES_HREF,
    label: "Explore Open Roles",
  },
};
