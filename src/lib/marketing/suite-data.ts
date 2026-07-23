/** Shared suite marketing — DeliverX brand as a career progression. */

import {
  CAREER_STORY_LINE,
  TEAM_COPILOT_SIGNUP_HREF as TEAM_COPILOT_SIGNUP,
} from "@/lib/marketing/career-suite";

export const PRODUCT_NAV = [
  { href: "/xperience", label: "Xperience" },
  { href: "/launchpad", label: "Launchpad" },
  { href: "/team-copilot", label: "Team Co-pilot" },
  { href: "/pricing", label: "Pricing" },
] as const;

export const SUITE_PRODUCTS = [
  {
    id: "xperience",
    name: "Xperience",
    stage: "Build Experience",
    href: "/xperience",
    promise: "Build the experience employers expect — join an AI company as a Product Manager.",
    detail: "£500 · 3 months. Living organisations, projects and a portfolio of evidence.",
    cta: "Explore Xperience",
  },
  {
    id: "launchpad",
    name: "Launchpad",
    stage: "Advance Your Career",
    href: "/launchpad",
    promise: "Get career-ready — turn experience into interviews and opportunities.",
    detail: "£250 · 3 months. Career Twin, portfolio, mock interviews and readiness score.",
    cta: "Explore Launchpad",
  },
  {
    id: "team-copilot",
    name: "Team Co-pilot",
    stage: "Deliver Products Together",
    href: "/team-copilot",
    promise: "Deliver with confidence — the AI delivery OS for real product teams.",
    detail: "£500 · 3 months. Shared workspace across PM, delivery, eng, QA and leadership.",
    cta: "Explore Team Co-pilot",
  },
] as const;

export const SUITE_LIFECYCLE = [
  { name: "Xperience", line: "Build Experience", outcome: "Build the experience" },
  { name: "Launchpad", line: "Advance Your Career", outcome: "Land the opportunity" },
  { name: "Team Co-pilot", line: "Deliver Products Together", outcome: "Succeed in the role" },
] as const;

export const SUITE_TAGLINE = CAREER_STORY_LINE;

export const TEAM_COPILOT_SIGNUP_HREF = TEAM_COPILOT_SIGNUP;
