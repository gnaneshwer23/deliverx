/** Marketing copy + pricing for the Xperience product page on DeliverX. */

export const XPERIENCE_SIGNUP_HREF = "/signup?product=xperience";

export const XPERIENCE_JOURNEY = [
  {
    step: "01",
    title: "Join the company",
    body: "Onboard into a living AI-powered organisation — not a course. You inherit a product, constraints and real stakeholders.",
  },
  {
    step: "02",
    title: "Carry the work",
    body: "Make decisions with AI colleagues. Customers, engineering and leadership remember what you chose — and what happened next.",
  },
  {
    step: "03",
    title: "Prove how you operate",
    body: "Leave with a record of decisions, artefacts and outcomes — evidence of professional capability, not a certificate.",
  },
] as const;

export const XPERIENCE_INCLUDES = [
  "Access to an AI Experience Company",
  "Associate Product Manager role to start",
  "Living product environment with constraints",
  "AI colleagues across leadership, eng and customers",
  "Decisions with lasting consequences",
  "Inspectable work record from what you shipped",
] as const;

export const XPERIENCE_PRICING = {
  name: "Xperience",
  price: "£49",
  cadence: "One payment",
  summary:
    "One professional company experience. Start as Associate Product Manager in a living AI-powered organisation.",
  cta: "Get access",
  ctaHref: XPERIENCE_SIGNUP_HREF,
} as const;
