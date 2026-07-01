/**
 * Persona onboarding config — shared by marketing and real onboarding flows.
 */

export type MarketingRoleId = "sponsor" | "pm" | "ba" | "po" | "eng" | "qa" | "sm";

/** @deprecated Use MarketingRoleId — kept for marketing landing compatibility */
export type RoleId = MarketingRoleId;

export type BadgeTone = "badge-g" | "badge-a" | "badge-n";

export type OnboardingStep = {
  n: string;
  title: string;
  desc: string;
  done?: boolean;
  active?: boolean;
};

export type OnboardingOutput = {
  code: string;
  iconColor: string;
  iconBg: string;
  title: string;
  sub: string;
  badge: string;
  badgeCls: BadgeTone;
};

export type OnboardingRoleData = { steps: OnboardingStep[]; outputs: OnboardingOutput[] };

export type DbRole =
  | "executive"
  | "pm"
  | "ba"
  | "product_manager"
  | "engineer"
  | "qa"
  | "scrum_master"
  | "team_member";

export const DB_ROLE_TO_PERSONA: Record<DbRole, MarketingRoleId | null> = {
  executive: "sponsor",
  pm: "pm",
  ba: "ba",
  product_manager: "po",
  engineer: "eng",
  qa: "qa",
  scrum_master: "sm",
  team_member: null,
};

export type PersonaCompletionCopy = {
  stepLabel: string;
  title: string;
  description: string;
  gatewayLabel: string;
};

export const OB_CONFIG: Record<RoleId, OnboardingRoleData> = {
  "sponsor": {
    "steps": [
      {
        "n": "1",
        "title": "Company context",
        "desc": "Name, stage, industry, and runway. We build your portfolio view from this.",
        "done": true
      },
      {
        "n": "2",
        "title": "Choose your outcomes",
        "desc": "Revenue growth, faster delivery, investor readiness, cost control — or all six.",
        "done": true
      },
      {
        "n": "3",
        "title": "Upload business case",
        "desc": "Paste or upload. AI analyses scope, risks, and financial assumptions in 60 seconds.",
        "active": true
      },
      {
        "n": "4",
        "title": "GO gate review",
        "desc": "Accept, edit, or reject the AI business case recommendation. Conditional GO requires acknowledging gaps before the project proceeds."
      },
      {
        "n": "5",
        "title": "Start delivering",
        "desc": "Open Command Centre after GO — portfolio health, decisions, and runway from approved outputs only."
      }
    ],
    "outputs": [
      {
        "code": "PV",
        "iconColor": "#3D9660",
        "iconBg": "rgba(61,150,96,.15)",
        "title": "Portfolio Overview",
        "sub": "3 active projects with health scores and budget tracking",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "code": "DC",
        "iconColor": "#FCD34D",
        "iconBg": "rgba(252,211,77,.15)",
        "title": "Decision Centre",
        "sub": "4 pending decisions requiring your approval",
        "badge": "Needs Review",
        "badgeCls": "badge-a"
      },
      {
        "code": "II",
        "iconColor": "#A78BFA",
        "iconBg": "rgba(167,139,250,.15)",
        "title": "Investment Intelligence",
        "sub": "Business case scoring and go/no-go framework ready",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "code": "RF",
        "iconColor": "#60A5FA",
        "iconBg": "rgba(96,165,250,.15)",
        "title": "Runway Forecast",
        "sub": "AI-modelled 14-month projection at current burn rate",
        "badge": "Generated",
        "badgeCls": "badge-g"
      }
    ]
  },
  "pm": {
    "steps": [
      {
        "n": "1",
        "title": "Open PM Mission Control",
        "desc": "Skip the cosmetic wizard — land on mission control with the workspace stage bar.",
        "done": true
      },
      {
        "n": "2",
        "title": "Upload business case or brief",
        "desc": "Paste or upload on Mission Control. AI extracts workstreams, milestones, and risks into the Review Queue.",
        "done": true
      },
      {
        "n": "3",
        "title": "Invite your BA",
        "desc": "Generate a join link from the same panel. Your BA lands in a workspace built from this brief.",
        "active": true
      },
      {
        "n": "4",
        "title": "Review in AI Queue",
        "desc": "Accept, edit, or reject each extraction. Nothing is applied without your confirmation."
      },
      {
        "n": "5",
        "title": "Team delivery",
        "desc": "Invite remaining roles. Each persona dashboard updates from the same signal graph."
      }
    ],
    "outputs": [
      {
        "code": "WS",
        "iconColor": "#60A5FA",
        "iconBg": "rgba(96,165,250,.15)",
        "title": "4 Workstreams Identified",
        "sub": "North Region · Digital Integration · Governance · Training",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "code": "WS",
        "iconColor": "#60A5FA",
        "iconBg": "rgba(96,165,250,.15)",
        "title": "12 Milestones Planned",
        "sub": "From Discovery to Benefits Realisation — 9-month timeline",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "code": "WS",
        "iconColor": "#D97706",
        "iconBg": "rgba(217,119,6,.15)",
        "title": "RAID Log Generated",
        "sub": "7 risks · 4 assumptions · 3 dependencies — ready for review",
        "badge": "Needs Review",
        "badgeCls": "badge-a"
      },
      {
        "code": "WS",
        "iconColor": "#3D9660",
        "iconBg": "rgba(61,150,96,.15)",
        "title": "Go/No-Go: 83% Confidence",
        "sub": "Strong business case · Manageable risks",
        "badge": "Generated",
        "badgeCls": "badge-g"
      }
    ]
  },
  "ba": {
    "steps": [
      {
        "n": "1",
        "title": "Open your join link",
        "desc": "PM shares a project invite from Mission Control — you land in a BA workspace seeded from their brief.",
        "done": true
      },
      {
        "n": "2",
        "title": "Review project context",
        "desc": "Business case, stakeholders, and scope pulled from the PM upload — no duplicate document entry.",
        "done": true
      },
      {
        "n": "3",
        "title": "AI extraction",
        "desc": "AI extracts functional requirements, business rules, assumptions, and constraints.",
        "active": true
      },
      {
        "n": "4",
        "title": "Review and close gaps",
        "desc": "Accept extracted requirements, answer 9 AI-generated clarification questions."
      },
      {
        "n": "5",
        "title": "Hand off to engineering",
        "desc": "18 approved stories with acceptance criteria — ready for the sprint board."
      }
    ],
    "outputs": [
      {
        "code": "RQ",
        "iconColor": "#2DD4BF",
        "iconBg": "rgba(45,212,191,.15)",
        "title": "46 Requirements Extracted",
        "sub": "32 functional · 8 non-functional · 6 business rules",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "code": "RQ",
        "iconColor": "#2DD4BF",
        "iconBg": "rgba(45,212,191,.15)",
        "title": "Traceability Matrix",
        "sub": "Business objectives mapped to all 46 requirements",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "code": "RQ",
        "iconColor": "#D97706",
        "iconBg": "rgba(217,119,6,.15)",
        "title": "9 Clarification Gaps",
        "sub": "Approval workflows, SLAs, and data retention rules",
        "badge": "Needs Review",
        "badgeCls": "badge-a"
      },
      {
        "code": "RQ",
        "iconColor": "#3D9660",
        "iconBg": "rgba(61,150,96,.15)",
        "title": "18 User Stories",
        "sub": "With acceptance criteria in Given / When / Then format",
        "badge": "Generated",
        "badgeCls": "badge-g"
      }
    ]
  },
  "po": {
    "steps": [
      {
        "n": "1",
        "title": "Product context",
        "desc": "Product name, type, stage, and primary goal this quarter.",
        "done": true
      },
      {
        "n": "2",
        "title": "Share customer context",
        "desc": "Upload interviews, surveys, or describe your users and their problems.",
        "done": true
      },
      {
        "n": "3",
        "title": "AI product analysis",
        "desc": "Customer segments, JTBD, opportunity solution tree, and RICE-scored backlog.",
        "active": true
      },
      {
        "n": "4",
        "title": "Review roadmap draft",
        "desc": "Now / Next / Later roadmap — accept, reorder, or add features before publishing."
      },
      {
        "n": "5",
        "title": "Align with delivery",
        "desc": "Share roadmap with PM and BA. Acceptance criteria flows directly to engineers."
      }
    ],
    "outputs": [
      {
        "code": "PD",
        "iconColor": "#A78BFA",
        "iconBg": "rgba(167,139,250,.15)",
        "title": "3 Customer Segments",
        "sub": "Healthcare PMs · Agency PMs · Enterprise PMOs with JTBD per segment",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "code": "PD",
        "iconColor": "#A78BFA",
        "iconBg": "rgba(167,139,250,.15)",
        "title": "Opportunity Solution Tree",
        "sub": "6 opportunities mapped to 14 potential features",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "code": "PD",
        "iconColor": "#D97706",
        "iconBg": "rgba(217,119,6,.15)",
        "title": "Prioritised Backlog",
        "sub": "Top 10 features RICE-scored · Meeting Intelligence leads at 250",
        "badge": "Needs Review",
        "badgeCls": "badge-a"
      },
      {
        "code": "PD",
        "iconColor": "#3D9660",
        "iconBg": "rgba(61,150,96,.15)",
        "title": "90-Day Roadmap Draft",
        "sub": "Now · Next · Later — ready for your review and publish",
        "badge": "Generated",
        "badgeCls": "badge-g"
      }
    ]
  },
  "eng": {
    "steps": [
      {
        "n": "1",
        "title": "Your stack",
        "desc": "Specialisation, primary language/framework, cloud platform, and team size.",
        "done": true
      },
      {
        "n": "2",
        "title": "Connect project context",
        "desc": "Upload PRD, architecture docs, or describe what you are building this sprint.",
        "done": true
      },
      {
        "n": "3",
        "title": "AI engineering briefing",
        "desc": "Assigned stories, dependency map, architecture overview, and AI code assistant — configured for your stack.",
        "active": true
      },
      {
        "n": "4",
        "title": "Review your sprint",
        "desc": "6 stories with priority, linked requirements, PR context, and acceptance criteria."
      },
      {
        "n": "5",
        "title": "Start building",
        "desc": "AI code assistant ready. Blockers surface automatically to PM and SM."
      }
    ],
    "outputs": [
      {
        "code": "EG",
        "iconColor": "#93C5FD",
        "iconBg": "rgba(147,197,253,.15)",
        "title": "6 Stories Assigned",
        "sub": "3 high priority · 1 blocked on Auth API · 2 in review",
        "badge": "Needs Review",
        "badgeCls": "badge-a"
      },
      {
        "code": "EG",
        "iconColor": "#93C5FD",
        "iconBg": "rgba(147,197,253,.15)",
        "title": "Dependency Map",
        "sub": "Auth API (blocked) · Neo4j (ready) · Anthropic API (active)",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "code": "EG",
        "iconColor": "#60A5FA",
        "iconBg": "rgba(96,165,250,.15)",
        "title": "Architecture Overview",
        "sub": "Frontend → API → AI Services → Knowledge Graph flow",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "code": "EG",
        "iconColor": "#3D9660",
        "iconBg": "rgba(61,150,96,.15)",
        "title": "AI Code Assistant",
        "sub": "Configured for TypeScript / FastAPI — ask about any story",
        "badge": "Ready",
        "badgeCls": "badge-g"
      }
    ]
  },
  "qa": {
    "steps": [
      {
        "n": "1",
        "title": "Testing specialisation",
        "desc": "Manual QA, automation, performance, security, UAT lead, or release manager.",
        "done": true
      },
      {
        "n": "2",
        "title": "Connect requirements",
        "desc": "Upload requirements, user stories, or acceptance criteria. AI generates test cases directly from them.",
        "done": true
      },
      {
        "n": "3",
        "title": "AI test generation",
        "desc": "124 test cases — functional, edge cases, and negative tests — mapped to requirements.",
        "active": true
      },
      {
        "n": "4",
        "title": "Review release readiness",
        "desc": "Release scorecard 0–100 across coverage, defects, performance, security, and UAT."
      },
      {
        "n": "5",
        "title": "Publish release decision",
        "desc": "Conditional Go — 2 critical defects must resolve. Report sent to PM and Sponsor."
      }
    ],
    "outputs": [
      {
        "code": "QT",
        "iconColor": "#FCD34D",
        "iconBg": "rgba(252,211,77,.15)",
        "title": "124 Test Cases Generated",
        "sub": "82 functional · 24 edge cases · 18 negative tests",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "code": "QT",
        "iconColor": "#FCD34D",
        "iconBg": "rgba(252,211,77,.15)",
        "title": "Release Readiness Baseline",
        "sub": "Starting score: rises as tests pass and defects close",
        "badge": "Active",
        "badgeCls": "badge-n"
      },
      {
        "code": "QT",
        "iconColor": "#3D9660",
        "iconBg": "rgba(61,150,96,.15)",
        "title": "Regression Suite",
        "sub": "42 automation candidates identified for Playwright/Cypress",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "code": "QT",
        "iconColor": "#D97706",
        "iconBg": "rgba(217,119,6,.15)",
        "title": "UAT Plan Drafted",
        "sub": "3 user groups · 12 key scenarios · sign-off checklist",
        "badge": "Needs Review",
        "badgeCls": "badge-a"
      }
    ]
  },
  "sm": {
    "steps": [
      {
        "n": "1",
        "title": "Team setup",
        "desc": "Team name, size, framework (Scrum/Kanban/SAFe), sprint length, and velocity.",
        "done": true
      },
      {
        "n": "2",
        "title": "Share sprint context",
        "desc": "Upload sprint backlog, retro notes, or describe your team's current state.",
        "done": true
      },
      {
        "n": "3",
        "title": "AI agile baseline",
        "desc": "Sprint baseline, active blockers, team health score, and retro pattern detection.",
        "active": true
      },
      {
        "n": "4",
        "title": "Review your impediments",
        "desc": "3 active blockers with severity, days active, escalation recommendations."
      },
      {
        "n": "5",
        "title": "Start the sprint",
        "desc": "Impediment board live. Sprint health updates automatically as stories move."
      }
    ],
    "outputs": [
      {
        "code": "AG",
        "iconColor": "#6EE7B7",
        "iconBg": "rgba(110,231,183,.15)",
        "title": "Sprint Baseline Set",
        "sub": "Sprint 24 · 72% complete · 4 days remaining · velocity stable",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "code": "AG",
        "iconColor": "#DC2626",
        "iconBg": "rgba(220,38,38,.15)",
        "title": "3 Blockers Identified",
        "sub": "Auth API (5 days, high) · Test environment (2 days, medium)",
        "badge": "Needs Review",
        "badgeCls": "badge-a"
      },
      {
        "code": "AG",
        "iconColor": "#3D9660",
        "iconBg": "rgba(61,150,96,.15)",
        "title": "Team Health Score",
        "sub": "8.1/10 happiness · Meeting load: moderate · Burnout risk: low",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "code": "AG",
        "iconColor": "#D97706",
        "iconBg": "rgba(217,119,6,.15)",
        "title": "Retro Pattern Detected",
        "sub": "Requirement clarity raised in 3 consecutive retrospectives",
        "badge": "Needs Review",
        "badgeCls": "badge-a"
      }
    ]
  }
} as Record<RoleId, OnboardingRoleData>;


export const PERSONA_COMPLETION: Record<MarketingRoleId, PersonaCompletionCopy> = {
  sponsor: {
    stepLabel: "Gateway complete",
    title: "Your Command Centre is ready",
    description: "Portfolio overview, decision centre, and runway forecast are live.",
    gatewayLabel: "Sponsor gateway complete",
  },
  pm: {
    stepLabel: "Workspace ready",
    title: "Your PM workspace is ready",
    description: "Delivery plan, RAID log, and milestones are configured for your role.",
    gatewayLabel: "Delivery workspace ready",
  },
  ba: {
    stepLabel: "Workspace ready",
    title: "Your BA workspace is ready",
    description: "Requirements extraction, traceability, and clarification hub are live.",
    gatewayLabel: "Requirements workspace ready",
  },
  po: {
    stepLabel: "Workspace ready",
    title: "Your product workspace is ready",
    description: "Roadmap, RICE backlog, and customer segments are ready to review.",
    gatewayLabel: "Product workspace ready",
  },
  eng: {
    stepLabel: "Workspace ready",
    title: "Your engineering workspace is ready",
    description: "Sprint stories, dependency map, and AI code assistant are configured.",
    gatewayLabel: "Engineering workspace ready",
  },
  qa: {
    stepLabel: "Workspace ready",
    title: "Your QA workspace is ready",
    description: "Test cases, release readiness baseline, and defect board are live.",
    gatewayLabel: "QA workspace ready",
  },
  sm: {
    stepLabel: "Workspace ready",
    title: "Your Scrum workspace is ready",
    description: "Sprint baseline, impediment board, and team health score are active.",
    gatewayLabel: "Agile workspace ready",
  },
};

export const TEAM_MEMBER_COMPLETION: PersonaCompletionCopy = {
  stepLabel: "Setup complete",
  title: "Your workspace is ready",
  description: "Join your team project and start collaborating on assigned work.",
  gatewayLabel: "Account setup complete",
};

export function getPersonaIdForDbRole(role: string | null | undefined): MarketingRoleId | null {
  if (!role) return null;
  return DB_ROLE_TO_PERSONA[role as DbRole] ?? null;
}

export function usesSponsorGateway(role: string | null | undefined): boolean {
  return role === "executive";
}

export function usesPersonaOnboarding(role: string | null | undefined): boolean {
  if (!role || role === "executive" || role === "team_member") return false;
  return getPersonaIdForDbRole(role) !== null;
}

export function getObConfigForDbRole(role: string | null | undefined): OnboardingRoleData | null {
  const personaId = getPersonaIdForDbRole(role);
  if (!personaId) return null;
  return OB_CONFIG[personaId];
}

export function getCompletionCopyForDbRole(
  role: string | null | undefined,
): PersonaCompletionCopy {
  if (role === "team_member") return TEAM_MEMBER_COMPLETION;
  const personaId = getPersonaIdForDbRole(role);
  if (personaId) return PERSONA_COMPLETION[personaId];
  return TEAM_MEMBER_COMPLETION;
}
