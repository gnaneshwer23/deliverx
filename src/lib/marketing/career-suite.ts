/**
 * Career progression packaging for DeliverX.
 * Build the experience → Land the opportunity → Succeed in the role.
 */

export const COMPANY_POSITIONING = "AI Product Experience Company";

export const COMPANY_MISSION =
  "DeliverX is an AI-powered professional growth platform that supports Product Managers from their first practical experience through to successful product delivery in real organisations.";

export const CAREER_PROGRESSION_LINE =
  "Build the experience → Land the opportunity → Succeed in the role.";

export const CAREER_STORY_LINE =
  "DeliverX helps you gain practical experience, secure career opportunities and thrive in real product teams through three connected AI-powered products.";

export const XPERIENCE_SIGNUP_HREF = "/signup?product=xperience";
export const LAUNCHPAD_SIGNUP_HREF = "/signup?product=launchpad";
export const TEAM_COPILOT_SIGNUP_HREF = "/signup?product=team-copilot";
export const BUNDLE_SIGNUP_HREF = "/signup?product=bundle";

export const XPERIENCE_INCLUDES = [
  "Full AI Company Experience",
  "Personalised Career Twin",
  "AI Recruitment & Onboarding",
  "Multiple Product Management projects",
  "Customer discovery simulations",
  "Stakeholder management",
  "Business strategy and prioritisation",
  "Product strategy development",
  "Product discovery",
  "Product design collaboration",
  "PRD and requirements writing",
  "Sprint planning",
  "Delivery management",
  "Product launch simulations",
  "Crisis and leadership scenarios",
  "AI coaching and feedback",
  "Performance reviews",
  "Professional portfolio generation",
  "Resume and case study generation",
  "Interview-ready evidence",
  "Career intelligence dashboard",
] as const;

export const LAUNCHPAD_INCLUDES = [
  "AI Career Assessment",
  "Career Twin profile",
  "Skills gap analysis",
  "CV optimisation",
  "LinkedIn profile enhancement",
  "Portfolio builder",
  "Professional case studies",
  "STAR interview story generation",
  "AI mock interviews",
  "Communication coaching",
  "Personal branding guidance",
  "Salary insights",
  "Career recommendations",
  "Personalised learning roadmap",
  "Job readiness score",
  "Interview performance analytics",
] as const;

export const TEAM_COPILOT_INCLUDES = [
  "AI Product Delivery Workspace",
  "Product Manager dashboard",
  "Programme & Project Manager dashboard",
  "Business Analyst workspace",
  "Engineering workspace",
  "QA workspace",
  "Leadership dashboard",
  "AI Delivery Brain",
  "Business case generation",
  "Discovery workspace",
  "Product strategy support",
  "Roadmap planning",
  "PRD collaboration",
  "Backlog management",
  "Sprint planning",
  "RAID management",
  "Risk intelligence",
  "Stakeholder communication",
  "Meeting summaries",
  "Action tracking",
  "AI recommendations",
  "Delivery health monitoring",
  "Release planning",
  "Executive reporting",
  "Collaboration across the entire delivery team",
] as const;

export const BUNDLE_INCLUDES = [
  "Full Xperience Platform",
  "Full Launchpad Platform",
  "Full Team Co-pilot Platform",
  "Continuous access for 12 months",
  "Unlimited AI coaching",
  "Continuous Career Twin updates",
  "Multiple company experiences",
  "Industry-specific product simulations",
  "Healthcare, AI, FinTech, EdTech and SaaS companies",
  "New challenges and scenarios throughout the year",
  "Advanced leadership simulations",
  "Priority access to new features",
  "Community events and workshops",
  "Future platform updates included",
] as const;

export type CareerTierId = "xperience" | "launchpad" | "team-copilot" | "bundle";

export type CareerTier = {
  id: CareerTierId;
  productName: string;
  stage: string;
  designedFor: string;
  headline: string;
  price: string;
  cadence: string;
  summary: string;
  idealFor: string;
  includes: readonly string[];
  cta: string;
  ctaHref: string;
  href: string;
  featured?: boolean;
};

export const CAREER_TIERS: readonly CareerTier[] = [
  {
    id: "xperience",
    productName: "Xperience",
    stage: "Build the experience",
    designedFor: "Aspiring Product Managers building practical experience",
    headline: "Build the experience employers expect",
    price: "£500",
    cadence: "3 Months Access",
    summary:
      "Join an AI-powered company and work as a Product Manager from day one. Every project, decision and conversation builds genuine professional capability and a portfolio of evidence.",
    idealFor:
      "Career switchers, graduates and aspiring Product Managers who want practical experience before applying for roles.",
    includes: XPERIENCE_INCLUDES,
    cta: "Start Building Experience",
    ctaHref: XPERIENCE_SIGNUP_HREF,
    href: "/xperience",
  },
  {
    id: "launchpad",
    productName: "Launchpad",
    stage: "Land the opportunity",
    designedFor: "Professionals ready to turn experience into interviews",
    headline: "Turn your experience into opportunities",
    price: "£250",
    cadence: "3 Months Access",
    summary:
      "Turn your experience into career opportunities. Present your work professionally, prepare for interviews and connect your experience with opportunities that match your skills.",
    idealFor:
      "Professionals actively preparing for Product Management interviews and career transitions.",
    includes: LAUNCHPAD_INCLUDES,
    cta: "Start Your Career Journey",
    ctaHref: LAUNCHPAD_SIGNUP_HREF,
    href: "/launchpad",
  },
  {
    id: "team-copilot",
    productName: "Team Co-pilot",
    stage: "Succeed in the role",
    designedFor: "Product teams delivering in real organisations",
    headline: "Deliver products with confidence",
    price: "£500",
    cadence: "3 Months Access",
    summary:
      "An AI-powered collaborative Product Delivery Operating System for modern product teams — coordinate people, projects and delivery with intelligent insights.",
    idealFor:
      "Product Managers, Delivery Managers, Project Managers, Business Analysts and cross-functional product teams.",
    includes: TEAM_COPILOT_INCLUDES,
    cta: "Start Collaborating",
    ctaHref: TEAM_COPILOT_SIGNUP_HREF,
    href: "/team-copilot",
  },
] as const;

export const CAREER_BUNDLE: CareerTier = {
  id: "bundle",
  productName: "Complete Journey",
  stage: "The full path",
  designedFor: "People who want experience, opportunity and delivery in one commitment",
  headline: "Everything in Xperience, Launchpad and Team Co-pilot",
  price: "£800",
  cadence: "12 Months Access",
  summary:
    "The complete professional growth path — build experience, land the opportunity and succeed in the role with continuous access for a year.",
  idealFor:
    "People who want the full path: company experience, career readiness and delivery tools in one commitment.",
  includes: BUNDLE_INCLUDES,
  cta: "Start the Complete Journey",
  ctaHref: BUNDLE_SIGNUP_HREF,
  href: "/pricing#bundle",
  featured: true,
};

export const CAREER_PROMISE = {
  title: "Build the experience before you get the opportunity.",
  body: "We believe capability should be demonstrated through experience, not just qualifications. That’s why every project, decision, conversation and outcome contributes to your professional development.",
  guaranteeTitle: "Money-Back Guarantee",
  guaranteeBody:
    "If you fully complete your personalised programme, participate in the required activities, and don’t feel that you’ve gained significant professional value, we’ll offer a 100% money-back guarantee.",
  outcomes: [
    "Meaningful Product Management experience",
    "Improved interview confidence",
    "Interview opportunities*",
    "Valuable simulated professional experience",
  ] as const,
  disclaimer:
    "*Subject to the programme terms. While we cannot guarantee employers will invite every participant to interview, we do guarantee the quality of the experience, the evidence you build, and the support you receive throughout your journey.",
} as const;

export function careerTierById(id: CareerTierId): CareerTier {
  if (id === "bundle") return CAREER_BUNDLE;
  const tier = CAREER_TIERS.find((item) => item.id === id);
  if (!tier) throw new Error(`Unknown career tier: ${id}`);
  return tier;
}
