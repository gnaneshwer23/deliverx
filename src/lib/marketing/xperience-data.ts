/** Marketing copy + pricing for the Xperience product page on DeliverX. */

export const XPERIENCE_SIGNUP_HREF = "/signup?product=xperience";

export const XPERIENCE_JOURNEY = [
  {
    step: "01",
    title: "Enter the workplace",
    body: "Apply into a realistic company simulation. Onboard like a new hire — not a student on a course.",
  },
  {
    step: "02",
    title: "Do the work",
    body: "Make decisions with AI colleagues, feel consequences, and produce artefacts that stand up to inspection.",
  },
  {
    step: "03",
    title: "Leave with evidence",
    body: "Finish with a portfolio of decisions, documents, and performance — proof of how you work, not a certificate.",
  },
] as const;

export const XPERIENCE_INCLUDES = [
  "Associate Product Manager simulation",
  "30 simulated working days",
  "Role onboarding and working-style setup",
  "AI workplace coach",
  "Scenario decisions with consequences",
  "Inspectable evidence portfolio",
] as const;

export const XPERIENCE_PRICING = {
  name: "Xperience",
  price: "£49",
  cadence: "One payment",
  summary: "30 simulated working days. Start with the Associate Product Manager simulation.",
  cta: "Get access",
  ctaHref: XPERIENCE_SIGNUP_HREF,
} as const;
