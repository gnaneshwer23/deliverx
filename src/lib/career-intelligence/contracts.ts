/**
 * Career Intelligence contracts — A–I summary constants for tests & canvas.
 */

export const CAREER_ROUTES = {
  home: "/launchpad/app",
  roadmap: "/launchpad/app/roadmap",
  cv: "/launchpad/app/cv",
  profile: "/profile",
  interview: "/launchpad/app/interview",
  opportunities: "/launchpad/app/opportunities",
  companies: "/launchpad/app/companies",
  applications: "/launchpad/app/applications",
  networking: "/launchpad/app/networking",
  hiringManagers: "/launchpad/app/hiring-managers",
  events: "/launchpad/app/events",
  promotion: "/launchpad/app/promotion",
  marketing: "/launchpad",
} as const;

export const CAREER_WORKFLOWS = [
  "Complete PI profile → open Career Intelligence",
  "Review Role Readiness (evidence-cited requirement levels)",
  "Open Roadmap → start recommended Experience",
  "Compose Evidence-backed CV from Verified Portfolio",
  "Interview Lab: rehearse with cited evidence → optional ledger observation",
  "Match opportunities → track application → capture outcome feedback",
] as const;

export const CAREER_REUSE_MATRIX = [
  { asset: "Auth + PI gate", verdict: "Reuse" },
  { asset: "launchpad_artefacts CRUD", verdict: "Reuse for Interview Lab logs" },
  { asset: "Heuristic readiness_score", verdict: "Deprecate as product truth" },
  { asset: "Dual Launchpad onboarding", verdict: "Freeze — PI is profile SoT" },
  { asset: "Verified Portfolio", verdict: "Compose as Evidence CV" },
  { asset: "Evidence Ledger", verdict: "Consume + append interview observations" },
  { asset: "Capability Engine", verdict: "Read-only later — never write from CI" },
  { asset: "Opportunity/Company/Network", verdict: "Greenfield (MVP seed catalog)" },
] as const;

export const CAREER_MVP_SCOPE = [
  "Role Readiness",
  "Career Roadmap",
  "Evidence-backed CV",
  "Professional Profile",
  "Interview Lab",
  "Opportunity Matching (seed)",
  "Application Tracker",
] as const;

export const CAREER_LATER_SCOPE = [
  "Company Intelligence depth",
  "Networking graph",
  "Hiring Manager Mapping",
  "Events and Communities",
  "Promotion Planning",
  "Live job feeds",
] as const;

/** G. Opportunity feedback loop */
export const OPPORTUNITY_FEEDBACK_LOOP = [
  "Match opportunity citing evidence + gaps",
  "User tracks application status",
  "Outcome (interview/offer/reject) recorded as ledger application_outcome when available",
  "Readiness re-run consumes new evidence — still no capability write from Launchpad",
] as const;
