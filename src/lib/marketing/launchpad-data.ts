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
    body: "Labelled role readiness and a roadmap of what to strengthen before you apply.",
  },
  {
    step: "02",
    title: "Package your evidence",
    body: "CV packaging into Verified Portfolio — grounded in Professional Intelligence, not slogans.",
  },
  {
    step: "03",
    title: "Prepare and track",
    body: "Interview lab practice and application tracking — without inventing marketplace liquidity.",
  },
] as const;

export const LAUNCHPAD_PRICING = [
  {
    name: "Launchpad",
    price: "Pilot access",
    cadence: "Open during the pilot · paid plans not yet live",
    summary: "Turn your experience into career opportunities.",
    cta: "Join the pilot",
    ctaHref: "/signup?product=launchpad",
    features: [] as string[],
    featured: true,
  },
] as const;
