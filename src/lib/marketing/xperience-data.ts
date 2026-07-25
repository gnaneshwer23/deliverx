/** Experience product marketing — re-exports career suite pricing. */

export {
  XPERIENCE_INCLUDES,
  XPERIENCE_SIGNUP_HREF,
  careerTierById,
} from "@/lib/marketing/career-suite";

export const XPERIENCE_JOURNEY = [
  {
    step: "01",
    title: "Join the company",
    body: "Onboard into a living organisation — product, customers, stakeholders and real business pressure from day one.",
  },
  {
    step: "02",
    title: "Work as a Product Manager",
    body: "Run discovery, strategy, delivery and launches. Judgement grows through decisions, not lectures.",
  },
  {
    step: "03",
    title: "Leave with evidence",
    body: "Portfolio, case studies and interview-ready proof of how you operate — not another certificate.",
  },
] as const;

export const XPERIENCE_PRICING = {
  name: "Experience",
  price: "Pilot access",
  cadence: "Open during the pilot · paid plans not yet live",
  summary:
    "Join an AI-powered company and work as a Product Manager from day one.",
  cta: "Join the pilot",
  ctaHref: "/signup?product=xperience",
} as const;
