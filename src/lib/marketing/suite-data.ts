/** Shared suite marketing — DeliverX brand + three products. */

export const PRODUCT_NAV = [
  { href: "/xperience", label: "Xperience" },
  { href: "/launchpad", label: "Launchpad" },
  { href: "/team-copilot", label: "Team Co-pilot" },
] as const;

export const SUITE_PRODUCTS = [
  {
    id: "xperience",
    name: "Xperience",
    href: "/xperience",
    promise: "Join an AI-powered company and build professional experience.",
    detail: "Living organisations, AI teams, consequential decisions.",
    cta: "Explore Xperience",
  },
  {
    id: "launchpad",
    name: "Launchpad",
    href: "/launchpad",
    promise: "Get the role opportunity — Career Record, open roles, evidence.",
    detail: "From first assignment to portfolio and career progression.",
    cta: "Explore Launchpad",
  },
  {
    id: "team-copilot",
    name: "Team Co-pilot",
    href: "/team-copilot",
    promise: "Deliver with intelligence once you are in a real team.",
    detail: "AI suggests. Humans decide. Seven roles, one signal graph.",
    cta: "Explore Team Co-pilot",
  },
] as const;

export const SUITE_LIFECYCLE = [
  { name: "Xperience", line: "Build experience" },
  { name: "Launchpad", line: "Launch your role" },
  { name: "Team Co-pilot", line: "Deliver with your team" },
] as const;

export const TEAM_COPILOT_SIGNUP_HREF = "/signup?product=team-copilot";
