/** Shared suite marketing — DeliverX as an AI Product Experience Company. */

import {
  CAREER_STORY_LINE,
  COMPANY_MISSION,
  COMPANY_POSITIONING,
  TEAM_COPILOT_SIGNUP_HREF as TEAM_COPILOT_SIGNUP,
} from "@/lib/marketing/career-suite";

export { COMPANY_MISSION, COMPANY_POSITIONING };

/** Product links for nav dropdown / product page secondary nav */
export const PRODUCT_LINKS = [
  { href: "/xperience", label: "Xperience", stage: "Build the experience" },
  { href: "/launchpad", label: "Launchpad", stage: "Land the opportunity" },
  { href: "/team-copilot", label: "Team Co-pilot", stage: "Succeed in the role" },
] as const;

/** Flat nav used on product pages (Home + siblings + Pricing) */
export const PRODUCT_NAV = [
  ...PRODUCT_LINKS.map(({ href, label }) => ({ href, label })),
  { href: "/pricing", label: "Pricing" },
] as const;

export const SITE_NAV = {
  products: PRODUCT_LINKS,
  links: [
    { href: "/#journey", label: "How it works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/resources", label: "Resources" },
    { href: "/about", label: "About" },
  ],
} as const;

export const SUITE_PRODUCTS = [
  {
    id: "xperience",
    name: "Xperience",
    stage: "Build the experience",
    href: "/xperience",
    promise:
      "Work inside AI-powered companies as a Product Manager — build judgement, delivery craft and a portfolio of evidence employers recognise.",
    detail: "£500 · 3 months. Living organisations, projects and an Experience Record.",
    cta: "Explore Xperience",
  },
  {
    id: "launchpad",
    name: "Launchpad",
    stage: "Land the opportunity",
    href: "/launchpad",
    promise:
      "Turn your experience into interviews and offers — Career Twin, CV, portfolio, mock interviews and salary insights in one career system.",
    detail: "£250 · 3 months. Assessment, packaging and interview readiness.",
    cta: "Explore Launchpad",
  },
  {
    id: "team-copilot",
    name: "Team Co-pilot",
    stage: "Succeed in the role",
    href: "/team-copilot",
    promise:
      "Collaborate with Product, Engineering, QA and leadership in one AI delivery workspace — plan, decide and ship with shared truth.",
    detail: "£500 · 3 months. Shared workspace across the whole delivery team.",
    cta: "Explore Team Co-pilot",
  },
] as const;

export const SUITE_LIFECYCLE = [
  { name: "Xperience", line: "Build the experience", outcome: "Practical PM capability and evidence" },
  { name: "Launchpad", line: "Land the opportunity", outcome: "Interviews, offers and readiness" },
  { name: "Team Co-pilot", line: "Succeed in the role", outcome: "Confident delivery in real teams" },
] as const;

export const SUITE_DIFFERENCE = [
  {
    title: "Experience before employment",
    body: "Build real product judgement inside living organisations before you apply — so employers see work, not just ambition.",
  },
  {
    title: "Career intelligence",
    body: "A continuous picture of your skills, stories and readiness — so every project compounds into a clearer career path.",
  },
  {
    title: "Better delivery",
    body: "Once you are in the role, the same ecosystem helps you plan, align and ship with your real team.",
  },
  {
    title: "Continuous growth",
    body: "From first experience through opportunity and delivery — one journey, not three disconnected tools.",
  },
] as const;

export const SUITE_TAGLINE = CAREER_STORY_LINE;

export const TEAM_COPILOT_SIGNUP_HREF = TEAM_COPILOT_SIGNUP;
