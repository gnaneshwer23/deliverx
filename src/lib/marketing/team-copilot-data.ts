import type { ProductPageContent } from "@/lib/marketing/product-page";
import { BUNDLE_SIGNUP_HREF, careerTierById } from "@/lib/marketing/career-suite";

const tier = careerTierById("team-copilot");

export const TEAM_COPILOT_JOURNEY = [
  {
    step: "01",
    title: "One delivery workspace",
    body: "PM, programme, BA, engineering, QA and leadership share the same delivery truth — no more scattered docs and conflicting status.",
  },
  {
    step: "02",
    title: "AI drafts. Humans decide.",
    body: "Business cases, PRDs, RAID, meeting summaries and recommendations land as drafts. Nothing applies without a human decision.",
  },
  {
    step: "03",
    title: "Stay aligned to launch",
    body: "Roadmaps, sprints, risk intelligence, release planning and executive reporting live in one operating system through to release.",
  },
] as const;

export const TEAM_COPILOT_PAGE: ProductPageContent = {
  path: "/team-copilot",
  stage: tier.stage,
  brandEyebrow: `DeliverX · ${tier.stage}`,
  name: "Team Co-pilot",
  heroTitle: "Deliver products with confidence.",
  promise:
    "Collaborate with Product, Engineering, QA and leadership in one AI delivery workspace — plan, decide and ship with shared truth and intelligent support.",
  primaryCta: {
    href: tier.ctaHref,
    label: "Start Collaborating",
  },
  secondaryCta: {
    href: "/pricing",
    label: "See pricing",
  },
  sections: [
    {
      id: "workspace",
      tone: "white",
      label: "Shared workspace",
      title: "One delivery truth for the whole team.",
      body: "PM, programme, BA, engineering, QA and leadership work from the same operating system — role dashboards on a shared foundation, not disconnected tools.",
      items: [
        "Product Manager, Programme and Project Manager dashboards",
        "Business Analyst, Engineering and QA workspaces",
        "Leadership dashboard for cross-team visibility",
      ],
    },
    {
      id: "intelligence",
      tone: "cream",
      label: "AI delivery intelligence",
      title: "AI drafts. Humans decide.",
      body: "The AI Delivery Brain drafts business cases, PRDs, meeting summaries and recommendations. Nothing applies without human ownership — so speed never bypasses judgement.",
    },
    {
      id: "roadmaps",
      tone: "white",
      label: "Roadmaps",
      title: "Strategy that stays connected to delivery.",
      body: "Roadmap planning, product strategy support and discovery live alongside the work — so priorities remain visible as reality changes.",
    },
    {
      id: "sprints",
      tone: "cream",
      label: "Sprint planning",
      title: "Plan and ship in the same system.",
      body: "Backlog management, sprint planning, action tracking and release planning keep the team aligned from commitment through launch.",
    },
    {
      id: "risks",
      tone: "white",
      label: "Risks",
      title: "See risk before it becomes status theatre.",
      body: "RAID management and risk intelligence surface issues early — so the team can respond while there is still time to protect outcomes.",
    },
    {
      id: "reporting",
      tone: "cream",
      label: "Executive reporting",
      title: "Status leaders can trust.",
      body: "Delivery health monitoring and executive reporting turn shared workspace data into clear updates — less narrative spin, more signal.",
    },
  ],
  pricing: {
    label: "Pricing",
    title: tier.headline,
    subtitle: `${tier.cadence} · Stage three of the DeliverX journey.`,
    price: tier.price,
    cadence: tier.cadence,
    summary: tier.summary,
    cta: tier.cta,
    ctaHref: tier.ctaHref,
    bundleLabel: "Or get the Complete Journey",
    bundleHref: "/pricing#bundle",
  },
  finalCta: {
    title: "Ready to deliver with confidence?",
    subtitle:
      "Start Team Co-pilot for your team — or take the Complete Journey if you also want Experience and Launchpad.",
    ctaLabel: tier.cta,
    ctaHref: tier.ctaHref,
    secondaryLabel: "Get the Complete Journey",
    secondaryHref: BUNDLE_SIGNUP_HREF,
  },
  footerCta: {
    title: "Start Collaborating",
    subtitle: `${tier.price} · ${tier.cadence}. Or take the Complete Journey.`,
    href: tier.ctaHref,
    label: tier.cta,
  },
};
