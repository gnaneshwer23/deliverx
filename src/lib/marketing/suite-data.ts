/** Shared suite marketing — DeliverX as an AI Product Experience Company. */

import {
  CAREER_STORY_LINE,
  COMPANY_MISSION,
  COMPANY_POSITIONING,
  TEAM_COPILOT_SIGNUP_HREF as TEAM_COPILOT_SIGNUP,
} from "@/lib/marketing/career-suite";

export { COMPANY_MISSION, COMPANY_POSITIONING };

/** Primary marketing header links — founder-simplified IA. */
export const PRIMARY_NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/experience", label: "Experience" },
  { href: "/launchpad", label: "Launchpad" },
  { href: "/professional-workspace", label: "Professional Workspace" },
] as const;

/** Product links for footer / secondary surfaces */
export const PRODUCT_LINKS = [
  { href: "/experience", label: "Experience", stage: "Build the experience" },
  { href: "/launchpad", label: "Launchpad", stage: "Land the opportunity" },
  {
    href: "/professional-workspace",
    label: "Professional Workspace",
    stage: "Succeed in the role",
  },
] as const;

/**
 * Flat nav for product marketing pages — same primary set, excluding current path.
 * @deprecated Prefer PRIMARY_NAV; kept for callers that still filter PRODUCT_NAV.
 */
export const PRODUCT_NAV = PRIMARY_NAV;

/** Site nav used by MarketingNav when no links override is passed. */
export const SITE_NAV = {
  products: PRODUCT_LINKS,
  links: PRIMARY_NAV,
} as const;

export const SUITE_PRODUCTS = [
  {
    id: "xperience",
    name: "Experience",
    stage: "Build the experience",
    href: "/experience",
    promise:
      "Work inside AI-powered companies as a Product Manager — build judgement, delivery craft and a portfolio of evidence employers can evaluate.",
    detail: "Pilot access. Living organisations, projects and an Experience Record.",
    cta: "Explore Experience",
  },
  {
    id: "launchpad",
    name: "Launchpad",
    stage: "Land the opportunity",
    href: "/launchpad",
    promise:
      "Turn your experience into interviews — Career Intelligence with labelled readiness, evidence CV packaging, interview lab and application tracking.",
    detail: "Pilot access. Readiness, packaging and interview prep.",
    cta: "Explore Launchpad",
  },
  {
    id: "team-copilot",
    name: "Professional Workspace",
    stage: "Succeed in the role",
    href: "/professional-workspace",
    promise:
      "Collaborate with role-based AI teammates in one Professional Workspace — meetings, stakeholders, artefacts, decisions and evidence.",
    detail: "Pilot access. AI drafts; humans decide and submit.",
    cta: "Explore Professional Workspace",
  },
] as const;

export const SUITE_LIFECYCLE = [
  { name: "Experience", line: "Build the experience", outcome: "Practical PM capability and evidence" },
  { name: "Launchpad", line: "Land the opportunity", outcome: "Interviews, offers and readiness" },
  { name: "Professional Workspace", line: "Succeed in the role", outcome: "Confident delivery with AI teammates" },
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
