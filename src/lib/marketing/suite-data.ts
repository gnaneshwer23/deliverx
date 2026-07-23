/** Shared suite marketing — home + product deep-links. */

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
    id: "deliverx",
    name: "DeliverX",
    href: "/deliverx",
    promise: "Deliver with intelligence once you are in a real team.",
    detail: "AI suggests. Humans decide. Seven roles, one signal graph.",
    cta: "Explore DeliverX",
  },
] as const;

export const SUITE_LIFECYCLE = [
  { name: "Xperience", line: "Build experience" },
  { name: "Launchpad", line: "Win the role" },
  { name: "DeliverX", line: "Deliver at work" },
] as const;
