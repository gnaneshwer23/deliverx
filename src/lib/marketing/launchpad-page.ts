import type { ProductPageContent } from "@/lib/marketing/product-page";
import { LAUNCHPAD_PRICING, LAUNCHPAD_ROLES_HREF } from "@/lib/marketing/launchpad-data";

export const LAUNCHPAD_PAGE: ProductPageContent = {
  path: "/launchpad",
  brandEyebrow: "DeliverX · Roles & Career Record",
  name: "Launchpad",
  promise: "Find the role. Grow a Career Record employers can trust.",
  support:
    "Launchpad is the entry to open roles and evidence packaging — browse opportunities, commit to a path, and turn work into a Career Record. Deep company work lives in Xperience.",
  primaryCta: { href: LAUNCHPAD_ROLES_HREF, label: "Explore Open Roles" },
  how: {
    title: "Roles first. Evidence that travels.",
    subtitle:
      "Employers expect experience before they give the title. Launchpad is where you choose a role path and build a Career Record from authentic work — not a course certificate.",
    steps: [
      {
        step: "01",
        title: "Explore open roles",
        body: "Browse company roles, meet stakeholders and understand the environment before you commit.",
      },
      {
        step: "02",
        title: "Enter with a clear path",
        body: "Start free to preview, or take a defined role. Know what access you get before you pay.",
      },
      {
        step: "03",
        title: "Build your Career Record",
        body: "Projects, decisions, artefacts and outcomes connect into evidence you can show employers — and carry into applications.",
      },
    ],
  },
  pricing: {
    title: "Start with a role path",
    subtitle: "Separate from Xperience (company membership) and Team Co-pilot (team workspace).",
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
    title: "See which roles are open",
    subtitle: "Explore opportunities, then build the Career Record that makes the next step obvious.",
    ctaLabel: "Explore Open Roles",
    ctaHref: LAUNCHPAD_ROLES_HREF,
  },
  footerCta: {
    title: "Explore open roles",
    subtitle: "Free preview or Full Role Access from £49.",
    href: LAUNCHPAD_ROLES_HREF,
    label: "Explore Open Roles",
  },
};
