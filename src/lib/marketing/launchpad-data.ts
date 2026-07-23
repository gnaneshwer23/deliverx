/** Launchpad product marketing — career readiness stage. */

export {
  LAUNCHPAD_INCLUDES,
  LAUNCHPAD_SIGNUP_HREF,
  careerTierById,
} from "@/lib/marketing/career-suite";

/** @deprecated Prefer LAUNCHPAD_SIGNUP_HREF — kept for older links. */
export const LAUNCHPAD_ROLES_HREF = "/signup?product=launchpad&intent=roles";

export const LAUNCHPAD_JOURNEY = [
  {
    step: "01",
    title: "Assess where you are",
    body: "Career Twin, skills gap analysis and a clear picture of what to strengthen before you apply.",
  },
  {
    step: "02",
    title: "Package your evidence",
    body: "CV, LinkedIn, portfolio and case studies that make your experience readable to hiring managers.",
  },
  {
    step: "03",
    title: "Prepare to win the interview",
    body: "STAR stories, mock interviews, communication coaching and a readiness score you can trust.",
  },
] as const;

export const LAUNCHPAD_PRICING = [
  {
    name: "Launchpad",
    price: "£250",
    cadence: "3 Months Access",
    summary: "Turn your experience into career opportunities.",
    cta: "Start Launchpad",
    ctaHref: "/signup?product=launchpad",
    features: [] as string[],
    featured: true,
  },
] as const;
