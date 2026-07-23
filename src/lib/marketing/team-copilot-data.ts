import { TEAM_COPILOT_SIGNUP_HREF } from "@/lib/marketing/suite-data";
import type { ProductPageContent } from "@/lib/marketing/product-page";
import { PRICING_TIERS } from "@/lib/marketing/landing-data";

export const TEAM_COPILOT_PAGE: ProductPageContent = {
  path: "/team-copilot",
  brandEyebrow: "DeliverX · Team workspace",
  name: "Team Co-pilot",
  promise: "AI suggests. Humans decide. Delivery happens.",
  support:
    "The workspace for real teams already in the job — shared delivery truth, role-aware intelligence and human approval on every AI change. Separate from Xperience and Launchpad.",
  primaryCta: { href: TEAM_COPILOT_SIGNUP_HREF, label: "Start free trial" },
  how: {
    label: "How it works",
    title: "Built for teams who already have the job",
    subtitle:
      "Xperience builds capability. Launchpad opens the role path. Team Co-pilot runs delivery once you are on a real team.",
    steps: [
      {
        step: "01",
        title: "One signal graph",
        body: "Seven roles share the same delivery truth — no more reconciling Slack, Jira and decks.",
      },
      {
        step: "02",
        title: "AI drafts. You approve.",
        body: "Updates and recommendations are proposed by AI — nothing applies without a human decision.",
      },
      {
        step: "03",
        title: "From brief to delivery",
        body: "Onboard by role, structure the project, then run with RAID, decisions, standups and intelligence.",
      },
    ],
  },
  pricing: {
    title: "Start with a free trial",
    subtitle: "30-day trial for the Team Co-pilot workspace — separate from Xperience and Launchpad pricing.",
    tiers: PRICING_TIERS.slice(0, 2).map((tier, index) => ({
      name: tier.name,
      price: tier.price,
      summary: tier.desc,
      features: tier.features.slice(0, 5),
      cta: tier.cta,
      ctaHref: tier.ctaHref === "/signup" ? TEAM_COPILOT_SIGNUP_HREF : tier.ctaHref,
      featured: index === 0,
    })),
  },
  finalCta: {
    title: "Put your team on one delivery truth",
    subtitle: "Start a free trial and land your first project in about 15 minutes.",
    ctaLabel: "Start free trial",
    ctaHref: TEAM_COPILOT_SIGNUP_HREF,
  },
  footerCta: {
    title: "Start your Team Co-pilot trial",
    subtitle: "30-day trial, no credit card. First project live in 15 minutes.",
    href: TEAM_COPILOT_SIGNUP_HREF,
    label: "Start free trial",
  },
};
