/**
 * Story-driven homepage content — Complete Career Intelligence Platform.
 */

import {
  BUNDLE_SIGNUP_HREF,
  CAREER_BUNDLE,
  CAREER_TIERS,
  LAUNCHPAD_SIGNUP_HREF,
  TEAM_COPILOT_SIGNUP_HREF,
  XPERIENCE_SIGNUP_HREF,
} from "@/lib/marketing/career-suite";

export const HOME_EYEBROW = "The Complete Career Intelligence Platform";

export const HOME_SUPPORT =
  "DeliverX helps you gain practical experience, secure career opportunities, and deliver products with confidence.";

export const BUILT_FOR = [
  "Career Switchers",
  "Graduates",
  "Product Managers",
  "Delivery Teams",
  "Universities",
  "Hiring Partners",
] as const;

export const PROBLEM = {
  headline: "The biggest challenge isn't learning Product Management.",
  emphasis: "It's gaining experience.",
  body: [
    "Courses teach frameworks. Job posts ask for experience. Between them sits a gap that blocks careers.",
    "DeliverX closes that gap. You join AI-powered companies, own real product challenges, and leave with evidence employers recognise — then turn that work into opportunities and succeed once you're in the role.",
  ],
  flow: ["Learning", "Experience", "Opportunity", "Career", "Delivery"] as const,
};

export const HOME_PRODUCTS = [
  {
    id: "xperience",
    name: "Experience",
    stage: "Build the experience",
    accent: "purple" as const,
    href: "/xperience",
    signupHref: XPERIENCE_SIGNUP_HREF,
    sentence:
      "Join AI-powered companies, solve real product challenges, and build evidence of what you can do.",
    bullets: ["AI Companies", "Real Product Challenges", "Professional Portfolio"],
    cta: "Explore Experience",
  },
  {
    id: "launchpad",
    name: "Launchpad",
    stage: "Land the opportunity",
    accent: "green" as const,
    href: "/launchpad",
    signupHref: LAUNCHPAD_SIGNUP_HREF,
    sentence:
      "Turn your experience into a stronger CV, ace interviews, and unlock opportunities that match your potential.",
    bullets: ["Career Twin", "CV", "Interview Preparation"],
    cta: "Explore Launchpad",
  },
  {
    id: "team-copilot",
    name: "Team Co-pilot",
    stage: "Succeed in the role",
    accent: "blue" as const,
    href: "/team-copilot",
    signupHref: TEAM_COPILOT_SIGNUP_HREF,
    sentence:
      "Collaborate with product teams in an AI-powered delivery workspace and ship with confidence.",
    bullets: ["AI Workspace", "Product Delivery", "Team Collaboration"],
    cta: "Explore Team Co-pilot",
  },
] as const;

export const JOURNEY_NODES = [
  {
    id: "discover",
    label: "Discover Yourself",
    detail: "Map strengths, gaps and career direction before you join a company.",
  },
  {
    id: "join",
    label: "Join AI Company",
    detail: "Onboard into a living organisation with real products and stakeholders.",
  },
  {
    id: "own",
    label: "Own Products",
    detail: "Take ownership of outcomes — strategy, discovery and delivery craft.",
  },
  {
    id: "launch",
    label: "Launch Features",
    detail: "Ship features under pressure with trade-offs, risks and stakeholders.",
  },
  {
    id: "review",
    label: "Performance Review",
    detail: "Receive structured feedback that compounds into your Career Twin.",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    detail: "Package artefacts and stories employers can evaluate quickly.",
  },
  {
    id: "interview",
    label: "Interview",
    detail: "Practice with evidence-backed STAR stories and mock interviews.",
  },
  {
    id: "job",
    label: "Real Job",
    detail: "Carry the same delivery habits into your role with Team Co-pilot.",
  },
] as const;

export const PLATFORM_TABS = [
  {
    id: "experience",
    label: "Experience",
    title: "Work inside AI companies",
    caption: "Priorities, stakeholders and product progress in one hub.",
  },
  {
    id: "career",
    label: "Career",
    title: "Career Twin intelligence",
    caption: "Skills, readiness and interview stories that update as you work.",
  },
  {
    id: "delivery",
    label: "Delivery",
    title: "Team delivery workspace",
    caption: "Roadmaps, risks and sprint confidence for real product teams.",
  },
] as const;

export const OUTPUTS = [
  "Business Case",
  "Product Strategy",
  "PRD",
  "Roadmap",
  "User Stories",
  "Sprint Plan",
  "Stakeholder Map",
  "Customer Interviews",
  "Risk Register",
  "Portfolio",
  "Career Profile",
  "Resume",
  "Interview Stories",
] as const;

export const AI_COLLEAGUES = [
  { role: "CEO", focus: "strategy and trade-offs" },
  { role: "Engineering Manager", focus: "delivery realism" },
  { role: "Designer", focus: "user experience" },
  { role: "Sales", focus: "revenue pressure" },
  { role: "Customer Success", focus: "retention signals" },
  { role: "Compliance", focus: "risk and policy" },
  { role: "QA", focus: "quality gates" },
  { role: "Finance", focus: "cost and ROI" },
  { role: "Marketing", focus: "positioning and launch" },
] as const;

export const AI_COLLEAGUE_BEHAVIOURS = [
  "They remember your earlier decisions",
  "They challenge weak assumptions",
  "They disagree when it matters",
  "They negotiate priorities with you",
] as const;

export const EXPERIENCE_TIMELINE = [
  { month: "Jan", title: "Discovery", note: "Customer interviews and problem framing" },
  { month: "Feb", title: "Strategy", note: "Business case and product direction" },
  { month: "Mar", title: "Delivery", note: "PRDs, sprints and stakeholder alignment" },
  { month: "Apr", title: "Performance Review", note: "Stars earned · Career Twin updated", stars: 4 },
] as const;

export const TEAM_COPILOT_PANELS = [
  { title: "Roadmap", body: "Shared product roadmap with clear ownership." },
  { title: "Delivery", body: "Sprint health and release readiness at a glance." },
  { title: "Risks", body: "RAID intelligence before issues become blockers." },
  { title: "Stakeholders", body: "Communication and alignment across roles." },
  { title: "Releases", body: "Launch plans with confidence scoring." },
  { title: "Executive Dashboard", body: "Leadership view of progress and risk." },
  { title: "Sprint Confidence", body: "Predictability signals for the current sprint." },
  { title: "Dependency Graph", body: "See what blocks what — before it hurts." },
] as const;

export const OUTCOMES = [
  "Experience",
  "Portfolio",
  "Confidence",
  "Interview Stories",
  "Career Record",
  "Delivery Skills",
  "Collaboration Skills",
  "Leadership Skills",
] as const;

export const HOME_PRICING = [
  ...CAREER_TIERS.map((tier) => ({
    id: tier.id,
    name: tier.productName,
    stage: tier.stage,
    price: tier.price,
    cadence: tier.cadence,
    summary: tier.designedFor,
    href: tier.href,
    ctaHref: tier.ctaHref,
    featured: false as boolean,
  })),
  {
    id: CAREER_BUNDLE.id,
    name: CAREER_BUNDLE.productName,
    stage: CAREER_BUNDLE.stage,
    price: CAREER_BUNDLE.price,
    cadence: CAREER_BUNDLE.cadence,
    summary: "Experience + Launchpad + Team Co-pilot for 12 months.",
    href: "/pricing#bundle",
    ctaHref: BUNDLE_SIGNUP_HREF,
    featured: true,
  },
] as const;

export const GUARANTEE = {
  title: "Money-back guarantee",
  body: "If you fully complete your personalised programme, participate in the required activities, and don't feel that you've gained significant professional value, we'll offer a 100% money-back guarantee.",
};

export const DEMO_STORIES = [
  {
    archetype: "Career Switcher",
    journey:
      "Left operations, completed two Experience projects, packaged a portfolio in Launchpad, and entered interviews with evidence instead of theory.",
  },
  {
    archetype: "Graduate",
    journey:
      "Joined an AI company in week one, built PRDs and stakeholder maps, then used Career Twin stories to stand out in graduate PM loops.",
  },
  {
    archetype: "Senior PM",
    journey:
      "Used Launchpad to refresh interview narratives, then Team Co-pilot to raise delivery clarity with engineering and leadership.",
  },
  {
    archetype: "Engineering Manager",
    journey:
      "Brought Team Co-pilot into the squad for dependency visibility, risk tracking and shared sprint confidence across roles.",
  },
] as const;

export const HOME_FAQ = [
  {
    q: "What is DeliverX?",
    a: "DeliverX is an AI Product Experience Company — a complete career intelligence platform spanning Experience, Launchpad and Team Co-pilot.",
  },
  {
    q: "Do I need prior Product Management experience?",
    a: "No. Experience is designed to build practical experience inside AI companies. Launchpad then helps you present that work; Team Co-pilot supports you once you're in a role.",
  },
  {
    q: "Can I buy just one product?",
    a: "Yes. Choose Experience (£500), Launchpad (£250) or Team Co-pilot (£500) — or take the Complete Journey (£800) for 12 months across all three.",
  },
  {
    q: "Is the AI company experience realistic?",
    a: "You work with AI colleagues who remember decisions, challenge weak thinking and negotiate priorities — across strategy, delivery, compliance and launch scenarios.",
  },
  {
    q: "What do I walk away with?",
    a: "A portfolio of artefacts, an Experience Record, Career Twin profile, interview stories and delivery habits you can use in real teams.",
  },
  {
    q: "How does the money-back guarantee work?",
    a: "Complete your personalised programme and required activities. If you don't feel you've gained significant professional value, you're covered by our 100% money-back guarantee.",
  },
  {
    q: "Is this a job guarantee?",
    a: "We guarantee the quality of the experience, evidence and support — not that every employer will invite you to interview. Outcomes depend on your market and effort.",
  },
] as const;
