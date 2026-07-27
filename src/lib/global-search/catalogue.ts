import type { SearchHit } from "@/lib/global-search/types";

/**
 * Static destinations for the suite shell. Routes only into existing products —
 * Profile, Experience, Launchpad, Workspace, Portfolio, Settings, Help.
 * Deliberately omits any Insights / third-surface product Home (CX-05).
 */
export const SEARCH_DESTINATIONS: readonly SearchHit[] = [
  {
    id: "dest-hub",
    kind: "destination",
    title: "Journey map",
    description: "Choose a product surface when you need the full DeliverX map.",
    href: "/hub",
    keywords: ["hub", "start", "overview", "map"],
  },
  {
    id: "dest-profile",
    kind: "destination",
    title: "Professional Home",
    description: "Professional Intelligence — where you are, what matters, and what comes next.",
    href: "/profile",
    keywords: ["home", "profile", "pi", "me", "capability", "snapshot"],
  },
  {
    id: "dest-evidence",
    kind: "destination",
    title: "Evidence Ledger",
    description: "Review evidence you recorded. Evidence is not capability until judged.",
    href: "/profile/evidence",
    keywords: ["ledger", "proof", "records"],
  },
  {
    id: "dest-baseline",
    kind: "destination",
    title: "Baseline assessment",
    description: "Optional baseline assessment for your pinned framework.",
    href: "/profile/baseline",
    keywords: ["assessment", "start"],
  },
  {
    id: "dest-learning",
    kind: "destination",
    title: "Learning",
    description: "Close knowledge gaps. Learning completion is not competency.",
    href: "/learning",
    keywords: ["course", "path", "knowledge"],
  },
  {
    id: "dest-outcomes",
    kind: "destination",
    title: "Real-world outcomes",
    description: "Log applications, interviews, and offers for honest calibration.",
    href: "/career/outcomes",
    keywords: ["career", "interview", "offer", "application"],
  },
  {
    id: "dest-experience",
    kind: "destination",
    title: "Experience",
    description: "Practice inside a simulated company and generate evidence.",
    href: "/experience/app",
    keywords: ["xperience", "sim", "practice", "day one"],
  },
  {
    id: "dest-launchpad",
    kind: "destination",
    title: "Launchpad",
    description: "Package evidence for career opportunities with honest readiness.",
    href: "/launchpad/app",
    keywords: ["career", "readiness", "interview lab"],
  },
  {
    id: "dest-workspace",
    kind: "destination",
    title: "Professional Workspace",
    description: "Collaborative delivery work. Team Copilot is this surface, not a third SKU.",
    href: "/workspace",
    keywords: ["team", "copilot", "delivery", "projects"],
  },
  {
    id: "dest-workspace-search",
    kind: "destination",
    title: "Workspace search",
    description: "Search projects, tasks, RAID, and documents in your organisation.",
    href: "/workspace/search",
    keywords: ["org", "tasks", "raid", "documents"],
  },
  {
    id: "dest-portfolio",
    kind: "destination",
    title: "Verified Portfolio",
    description: "Package claims with evidence. Verified requires external attestation.",
    href: "/portfolio",
    keywords: ["share", "attest", "brand"],
  },
  {
    id: "dest-settings",
    kind: "destination",
    title: "Settings",
    description: "Account, privacy, observation consent, and notifications.",
    href: "/settings/profile",
    keywords: ["account", "privacy", "consent", "password"],
  },
  {
    id: "dest-pilot-admin",
    kind: "destination",
    title: "Pilot admin",
    description: "Thin org and project config for operators. Does not rewrite verified evidence.",
    href: "/settings/admin",
    keywords: ["admin", "organisation", "project", "department", "team"],
  },
  {
    id: "dest-billing",
    kind: "destination",
    title: "Billing",
    description: "Subscription and entitlements. Live payments follow founder Stripe ops.",
    href: "/settings/billing",
    keywords: ["plan", "stripe", "subscription"],
  },
  {
    id: "dest-help",
    kind: "destination",
    title: "Help",
    description: "Where you are, what matters, and what to do next — without inventing scores.",
    href: "/help",
    keywords: ["faq", "guide", "support"],
  },
] as const;

/**
 * Calm help articles. Each links to an in-app surface or an anchor on /help.
 * No unexplained scores or decorative readiness.
 */
export const HELP_ARTICLES: readonly SearchHit[] = [
  {
    id: "help-where",
    kind: "help",
    title: "Where am I?",
    description: "The suite nav starts at Home, then routes into Experience, Launchpad, Portfolio, Workspace, and Journey map.",
    href: "/help#where-am-i",
    keywords: ["orientation", "navigation"],
  },
  {
    id: "help-next",
    kind: "help",
    title: "What should I do next?",
    description: "Open Professional Home for recommended next actions, or Journey map to pick a product surface.",
    href: "/help#what-next",
    keywords: ["next action", "recommendation"],
  },
  {
    id: "help-evidence",
    kind: "help",
    title: "Evidence vs capability",
    description: "Evidence is recorded work. Capability levels come only from the Capability Engine.",
    href: "/help#evidence-capability",
    keywords: ["score", "judgement", "ledger"],
  },
  {
    id: "help-learning",
    kind: "help",
    title: "Learning is not competency",
    description: "Completing a learning path does not assign capability or light Verified.",
    href: "/help#learning",
    keywords: ["course", "verified"],
  },
  {
    id: "help-consent",
    kind: "help",
    title: "Observation consent",
    description: "Workspace observation defaults OFF. Turn it on only when you choose to.",
    href: "/help#consent",
    keywords: ["privacy", "observe", "coach"],
  },
  {
    id: "help-verified",
    kind: "help",
    title: "What Verified means",
    description: "Verified is named third-party attestation of a specific claim — not a ScoreRun alone.",
    href: "/help#verified",
    keywords: ["badge", "attestation", "external"],
  },
  {
    id: "help-search",
    kind: "help",
    title: "How to search",
    description: "Press Command-K or Control-K to open search. Results are limited to your own data.",
    href: "/help#search",
    keywords: ["shortcut", "command", "palette"],
  },
] as const;

/** Full static catalogue used by client filter and server search merge. */
export const SEARCH_CATALOGUE: readonly SearchHit[] = [
  ...SEARCH_DESTINATIONS,
  ...HELP_ARTICLES,
];
