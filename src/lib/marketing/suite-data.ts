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
    promise: "AI Experience Company — join a living org and build capability through real work.",
    detail: "Persistent company. Consequential decisions. Evidence from what you shipped.",
    cta: "Explore Xperience",
  },
  {
    id: "launchpad",
    name: "Launchpad",
    href: "/launchpad",
    promise: "Open roles and a Career Record — the bridge from experience to opportunity.",
    detail: "Browse roles, commit to a path, package evidence employers trust.",
    cta: "Explore Launchpad",
  },
  {
    id: "team-copilot",
    name: "Team Co-pilot",
    href: "/team-copilot",
    promise: "Delivery intelligence for your real team once you have the job.",
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
