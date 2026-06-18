export type RoleId = 'sponsor' | 'pm' | 'ba' | 'po' | 'eng' | 'qa' | 'sm';

export type BadgeTone = 'badge-g' | 'badge-a' | 'badge-n';

export type RoleKpi = {
  label: string;
  val: string;
  delta: string;
  dir: 'up' | 'dn' | 'warn' | '';
};

export type RoleFeed = { dot: string; text: string; from: string };

export type RoleLoopItem = {
  sym: string;
  bg: string;
  color: string;
  name: string;
  status: string;
  badge: string;
  badgeCls: BadgeTone;
};

export type RoleDashboard = {
  name: string;
  sym: string;
  accent: string;
  accentBg: string;
  title: string;
  badge: string;
  tagline: string;
  kpis: RoleKpi[];
  feedTitle: string;
  loopTitle: string;
  feeds: RoleFeed[];
  loopItems: RoleLoopItem[];
};

export type OnboardingStep = { n: string; title: string; desc: string; done?: boolean; active?: boolean };

export type OnboardingOutput = {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  sub: string;
  badge: string;
  badgeCls: BadgeTone;
};

export type OnboardingRoleData = { steps: OnboardingStep[]; outputs: OnboardingOutput[] };

export type LoopSend = { role: RoleId; sends: string[] };

export const ROLE_ORDER: RoleId[] = ["sponsor","pm","ba","po","eng","qa","sm"];

export const ROLES: Record<RoleId, RoleDashboard> = {
  "sponsor": {
    "name": "Founder / Sponsor",
    "sym": "◆",
    "accent": "#3D9660",
    "accentBg": "rgba(61,150,96,.12)",
    "title": "Founder / Sponsor · Command Centre",
    "badge": "Portfolio Healthy",
    "tagline": "Portfolio, decisions, and runway in one view",
    "kpis": [
      {
        "label": "Monthly Revenue",
        "val": "£25k",
        "delta": "↑ +12%",
        "dir": "up"
      },
      {
        "label": "Runway",
        "val": "14mo",
        "delta": "Aug 2027",
        "dir": "up"
      },
      {
        "label": "Delivery Conf.",
        "val": "84%",
        "delta": "↑ +3%",
        "dir": "up"
      }
    ],
    "feedTitle": "Intelligence Feed",
    "loopTitle": "Stakeholder Pulse",
    "feeds": [
      {
        "dot": "#DC2626",
        "text": "NHS EHR — vendor API delayed 3 weeks. Go-live at risk.",
        "from": "from Project Manager · 2m ago"
      },
      {
        "dot": "#D97706",
        "text": "Platform v2 release readiness: 84% — 2 critical defects blocking go-live.",
        "from": "from QA Team · 1h ago"
      },
      {
        "dot": "#60A5FA",
        "text": "Meeting Intelligence added to Q3 roadmap. RICE 250.",
        "from": "from Product Manager · 45m ago"
      }
    ],
    "loopItems": [
      {
        "sym": "⬡",
        "bg": "rgba(96,165,250,.15)",
        "color": "#60A5FA",
        "name": "Project Manager",
        "status": "Awaiting budget approval for API vendor",
        "badge": "Urgent",
        "badgeCls": "badge-a"
      },
      {
        "sym": "◈",
        "bg": "rgba(167,139,250,.15)",
        "color": "#A78BFA",
        "name": "Product Manager",
        "status": "Q3 roadmap needs strategic sign-off",
        "badge": "Review",
        "badgeCls": "badge-a"
      },
      {
        "sym": "⬢",
        "bg": "rgba(45,212,191,.15)",
        "color": "#2DD4BF",
        "name": "Business Analyst",
        "status": "Requirements signed off — no action",
        "badge": "Clear",
        "badgeCls": "badge-g"
      },
      {
        "sym": "◉",
        "bg": "rgba(252,211,77,.15)",
        "color": "#FCD34D",
        "name": "QA / Test Manager",
        "status": "Release go/no-go requires approval",
        "badge": "Review",
        "badgeCls": "badge-a"
      }
    ]
  },
  "pm": {
    "name": "Project Manager",
    "sym": "⬡",
    "accent": "#60A5FA",
    "accentBg": "rgba(96,165,250,.1)",
    "title": "Project Manager · NHS EHR",
    "badge": "Sprint 24 · 72%",
    "tagline": "Milestones, RAID, and delivery confidence",
    "kpis": [
      {
        "label": "Project Health",
        "val": "87%",
        "delta": "↑ +2%",
        "dir": "up"
      },
      {
        "label": "Open Risks",
        "val": "7",
        "delta": "3 high severity",
        "dir": "dn"
      },
      {
        "label": "Blockers",
        "val": "4",
        "delta": "+2 since yesterday",
        "dir": "dn"
      }
    ],
    "feedTitle": "Delivery Signals",
    "loopTitle": "Team Needs",
    "feeds": [
      {
        "dot": "#DC2626",
        "text": "Auth API blocker — US-45 stalled for 5 days. Platform team has not responded.",
        "from": "from Scrum Master · 30m ago"
      },
      {
        "dot": "#D97706",
        "text": "2 critical defects BUG-142 and BUG-167. Release blocked until resolved.",
        "from": "from QA Team · 1h ago"
      },
      {
        "dot": "#3D9660",
        "text": "Reports API merged. US-44 complete. Sprint at 72%.",
        "from": "from Engineer · 2h ago"
      }
    ],
    "loopItems": [
      {
        "sym": "⬢",
        "bg": "rgba(45,212,191,.15)",
        "color": "#2DD4BF",
        "name": "Business Analyst",
        "status": "9 clarification gaps blocking sprint 5",
        "badge": "Urgent",
        "badgeCls": "badge-a"
      },
      {
        "sym": "⬟",
        "bg": "rgba(147,197,253,.15)",
        "color": "#93C5FD",
        "name": "Engineer",
        "status": "Auth API dependency unblocked yet?",
        "badge": "Waiting",
        "badgeCls": "badge-n"
      },
      {
        "sym": "◉",
        "bg": "rgba(252,211,77,.15)",
        "color": "#FCD34D",
        "name": "QA",
        "status": "Release go-ahead decision needed",
        "badge": "Review",
        "badgeCls": "badge-a"
      },
      {
        "sym": "◆",
        "bg": "rgba(61,150,96,.15)",
        "color": "#3D9660",
        "name": "Sponsor",
        "status": "Budget escalation sent for vendor API",
        "badge": "Escalated",
        "badgeCls": "badge-n"
      }
    ]
  },
  "ba": {
    "name": "Business Analyst",
    "sym": "⬢",
    "accent": "#2DD4BF",
    "accentBg": "rgba(45,212,191,.1)",
    "title": "Business Analyst · Requirements",
    "badge": "78% Traceability",
    "tagline": "Requirements, gaps, and traceability",
    "kpis": [
      {
        "label": "Requirements",
        "val": "46",
        "delta": "22 approved",
        "dir": "up"
      },
      {
        "label": "Gaps Open",
        "val": "9",
        "delta": "Blocking sprint 5",
        "dir": "dn"
      },
      {
        "label": "Traceability",
        "val": "78%",
        "delta": "Target 100%",
        "dir": "warn"
      }
    ],
    "feedTitle": "Clarification Hub",
    "loopTitle": "Stakeholder Loop",
    "feeds": [
      {
        "dot": "#DC2626",
        "text": "FR-006 approval workflow — who can approve budgets above £50k? Sent to Sponsor. Awaiting 3 days.",
        "from": "Blocks Engineering"
      },
      {
        "dot": "#D97706",
        "text": "FR-004 lab integration — HL7 FHIR v4 or custom API? Sent to PM. Awaiting 1 day.",
        "from": "Needs PM Review"
      },
      {
        "dot": "#D97706",
        "text": "FR-003 GDPR data retention — 7-year NHS guidance? Sent to Legal. 2 days awaiting.",
        "from": "GDPR Risk"
      }
    ],
    "loopItems": [
      {
        "sym": "⬡",
        "bg": "rgba(96,165,250,.15)",
        "color": "#60A5FA",
        "name": "Project Manager",
        "status": "9 gaps blocking sprint planning",
        "badge": "Urgent",
        "badgeCls": "badge-a"
      },
      {
        "sym": "⬟",
        "bg": "rgba(147,197,253,.15)",
        "color": "#93C5FD",
        "name": "Engineer",
        "status": "18 stories ready to pull into sprint",
        "badge": "Ready",
        "badgeCls": "badge-g"
      },
      {
        "sym": "◉",
        "bg": "rgba(252,211,77,.15)",
        "color": "#FCD34D",
        "name": "QA",
        "status": "Acceptance criteria for FR-003 incomplete",
        "badge": "Review",
        "badgeCls": "badge-a"
      },
      {
        "sym": "◆",
        "bg": "rgba(61,150,96,.15)",
        "color": "#3D9660",
        "name": "Sponsor",
        "status": "Awaiting sign-off on FR-006",
        "badge": "Waiting",
        "badgeCls": "badge-n"
      }
    ]
  },
  "po": {
    "name": "Product Manager",
    "sym": "◈",
    "accent": "#A78BFA",
    "accentBg": "rgba(167,139,250,.1)",
    "title": "Product Manager · Roadmap",
    "badge": "NPS 52 · 87% Retention",
    "tagline": "Roadmap, RICE scoring, and feature adoption",
    "kpis": [
      {
        "label": "NPS",
        "val": "52",
        "delta": "Target: 60",
        "dir": "warn"
      },
      {
        "label": "Retention",
        "val": "87%",
        "delta": "90-day",
        "dir": "up"
      },
      {
        "label": "Churn",
        "val": "3%",
        "delta": "+0.5% this month",
        "dir": "dn"
      }
    ],
    "feedTitle": "Now · Next · Later",
    "loopTitle": "Stakeholder Loop",
    "feeds": [
      {
        "dot": "#A78BFA",
        "text": "AI Workspace Generation — RICE 280. In delivery Sprint 4–6.",
        "from": "Now"
      },
      {
        "dot": "#60A5FA",
        "text": "Meeting Intelligence — RICE 250. Sprint 5.",
        "from": "Now"
      },
      {
        "dot": "rgba(100,100,100,.6)",
        "text": "Portfolio Dashboard — RICE 140. Planned Q3.",
        "from": "Next"
      }
    ],
    "loopItems": [
      {
        "sym": "◆",
        "bg": "rgba(61,150,96,.15)",
        "color": "#3D9660",
        "name": "Sponsor",
        "status": "Q3 roadmap needs strategic sign-off",
        "badge": "Review",
        "badgeCls": "badge-a"
      },
      {
        "sym": "⬢",
        "bg": "rgba(45,212,191,.15)",
        "color": "#2DD4BF",
        "name": "Business Analyst",
        "status": "PRD validated — 46 requirements extracted",
        "badge": "Done",
        "badgeCls": "badge-g"
      },
      {
        "sym": "⬟",
        "bg": "rgba(147,197,253,.15)",
        "color": "#93C5FD",
        "name": "Engineer",
        "status": "Meeting Intelligence specs need API detail",
        "badge": "Needed",
        "badgeCls": "badge-a"
      },
      {
        "sym": "◉",
        "bg": "rgba(252,211,77,.15)",
        "color": "#FCD34D",
        "name": "QA",
        "status": "Acceptance criteria complete for 14 features",
        "badge": "Clear",
        "badgeCls": "badge-g"
      }
    ]
  },
  "eng": {
    "name": "Engineer",
    "sym": "⬟",
    "accent": "#93C5FD",
    "accentBg": "rgba(147,197,253,.1)",
    "title": "Engineer · Sprint 24",
    "badge": "87% Test Coverage",
    "tagline": "Stories, dependencies, and CI/CD",
    "kpis": [
      {
        "label": "Assigned",
        "val": "6",
        "delta": "3 high priority",
        "dir": ""
      },
      {
        "label": "Blocked",
        "val": "1",
        "delta": "Auth API — 5 days",
        "dir": "dn"
      },
      {
        "label": "Coverage",
        "val": "87%",
        "delta": "+3% this sprint",
        "dir": "up"
      }
    ],
    "feedTitle": "My Stories — Sprint 24",
    "loopTitle": "Stakeholder Loop",
    "feeds": [
      {
        "dot": "#3D9660",
        "text": "US-44 — Reports API · GET /reports/ai endpoint. Merged PR #421.",
        "from": "Done · 5pts"
      },
      {
        "dot": "#D97706",
        "text": "US-47 — Sponsor dashboard · portfolio health widget. PR #424 open.",
        "from": "In Review · 3pts"
      },
      {
        "dot": "#DC2626",
        "text": "US-45 — RAID auto-sync. Blocked on Auth API — 5 days. Platform team no ETA.",
        "from": "Blocked · 8pts"
      }
    ],
    "loopItems": [
      {
        "sym": "⬡",
        "bg": "rgba(96,165,250,.15)",
        "color": "#60A5FA",
        "name": "Project Manager",
        "status": "Auth API blocker update needed",
        "badge": "Update",
        "badgeCls": "badge-a"
      },
      {
        "sym": "◉",
        "bg": "rgba(252,211,77,.15)",
        "color": "#FCD34D",
        "name": "QA",
        "status": "Reports API ready for testing",
        "badge": "Ready",
        "badgeCls": "badge-g"
      },
      {
        "sym": "⬢",
        "bg": "rgba(45,212,191,.15)",
        "color": "#2DD4BF",
        "name": "BA",
        "status": "FR-003 acceptance criteria incomplete",
        "badge": "Waiting",
        "badgeCls": "badge-n"
      },
      {
        "sym": "◎",
        "bg": "rgba(110,231,183,.15)",
        "color": "#6EE7B7",
        "name": "Scrum Master",
        "status": "Sprint capacity healthy",
        "badge": "Clear",
        "badgeCls": "badge-g"
      }
    ]
  },
  "qa": {
    "name": "QA / Test Manager",
    "sym": "◉",
    "accent": "#FCD34D",
    "accentBg": "rgba(252,211,77,.1)",
    "title": "QA / Test Manager · Release",
    "badge": "84% Ready · Conditional Go",
    "tagline": "Release readiness, defects, and UAT",
    "kpis": [
      {
        "label": "Release Ready",
        "val": "84%",
        "delta": "2 critical block",
        "dir": "warn"
      },
      {
        "label": "Open Defects",
        "val": "23",
        "delta": "2 critical",
        "dir": "dn"
      },
      {
        "label": "UAT Progress",
        "val": "76%",
        "delta": "Due May 22",
        "dir": "warn"
      }
    ],
    "feedTitle": "Defect Board",
    "loopTitle": "Stakeholder Loop",
    "feeds": [
      {
        "dot": "#DC2626",
        "text": "BUG-142 Critical — Auth token expiry causes silent logout. Marcus T. fixing.",
        "from": "Critical · Blocks release"
      },
      {
        "dot": "#DC2626",
        "text": "BUG-167 Critical — Report generation fails for budgets over £1M.",
        "from": "Critical · Open"
      },
      {
        "dot": "#D97706",
        "text": "BUG-158 Medium — RAID table pagination breaks at 50+ items.",
        "from": "Medium · In Review"
      }
    ],
    "loopItems": [
      {
        "sym": "⬡",
        "bg": "rgba(96,165,250,.15)",
        "color": "#60A5FA",
        "name": "Project Manager",
        "status": "Release go-ahead needs decision",
        "badge": "Urgent",
        "badgeCls": "badge-a"
      },
      {
        "sym": "⬟",
        "bg": "rgba(147,197,253,.15)",
        "color": "#93C5FD",
        "name": "Engineer",
        "status": "Reports API — ready to test",
        "badge": "Test Now",
        "badgeCls": "badge-g"
      },
      {
        "sym": "⬢",
        "bg": "rgba(45,212,191,.15)",
        "color": "#2DD4BF",
        "name": "BA",
        "status": "FR-003 acceptance criteria missing",
        "badge": "Needed",
        "badgeCls": "badge-a"
      },
      {
        "sym": "◆",
        "bg": "rgba(61,150,96,.15)",
        "color": "#3D9660",
        "name": "Sponsor",
        "status": "Awaiting release confidence report",
        "badge": "Publish",
        "badgeCls": "badge-n"
      }
    ]
  },
  "sm": {
    "name": "Scrum Master",
    "sym": "◎",
    "accent": "#6EE7B7",
    "accentBg": "rgba(110,231,183,.1)",
    "title": "Scrum Master · Sprint 24",
    "badge": "87% Success Probability",
    "tagline": "Sprint health, blockers, and team wellbeing",
    "kpis": [
      {
        "label": "Sprint Progress",
        "val": "72%",
        "delta": "58 of 80 pts",
        "dir": ""
      },
      {
        "label": "Team Health",
        "val": "8.1",
        "delta": "/ 10 happiness",
        "dir": "up"
      },
      {
        "label": "Blockers",
        "val": "3",
        "delta": "Auth API oldest (5d)",
        "dir": "dn"
      }
    ],
    "feedTitle": "Impediment Board",
    "loopTitle": "Stakeholder Loop",
    "feeds": [
      {
        "dot": "#DC2626",
        "text": "Auth API — Platform team unresponsive. Day 5. Affects 2 teams. US-45 blocked.",
        "from": "High · Re-escalate to PM"
      },
      {
        "dot": "#D97706",
        "text": "Test environment unstable — 3 failed deploys. DevOps ETA tomorrow.",
        "from": "Medium · Day 2"
      },
      {
        "dot": "#D97706",
        "text": "FR-003 acceptance criteria incomplete — BA clarification pending.",
        "from": "Medium · Day 1"
      }
    ],
    "loopItems": [
      {
        "sym": "⬡",
        "bg": "rgba(96,165,250,.15)",
        "color": "#60A5FA",
        "name": "Project Manager",
        "status": "Sprint 24 health report sent",
        "badge": "Sent",
        "badgeCls": "badge-g"
      },
      {
        "sym": "⬟",
        "bg": "rgba(147,197,253,.15)",
        "color": "#93C5FD",
        "name": "Engineer",
        "status": "Auth API escalation active",
        "badge": "Active",
        "badgeCls": "badge-a"
      },
      {
        "sym": "◉",
        "bg": "rgba(252,211,77,.15)",
        "color": "#FCD34D",
        "name": "QA",
        "status": "Test environment fix scheduled tmrw",
        "badge": "Scheduled",
        "badgeCls": "badge-g"
      },
      {
        "sym": "◈",
        "bg": "rgba(167,139,250,.15)",
        "color": "#A78BFA",
        "name": "Product Manager",
        "status": "Backlog groomed for sprint 25",
        "badge": "Ready",
        "badgeCls": "badge-g"
      }
    ]
  }
} as Record<RoleId, RoleDashboard>;

export const OB_DATA: Record<RoleId, OnboardingRoleData> = {
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
        "title": "Review AI outputs",
        "desc": "Portfolio overview, decision centre, investment intelligence, runway forecast."
      },
      {
        "n": "5",
        "title": "Start delivering",
        "desc": "Open your Command Centre — 4 pending decisions and live portfolio health waiting."
      }
    ],
    "outputs": [
      {
        "icon": "◆",
        "iconColor": "#3D9660",
        "iconBg": "rgba(61,150,96,.15)",
        "title": "Portfolio Overview",
        "sub": "3 active projects with health scores and budget tracking",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "icon": "★",
        "iconColor": "#FCD34D",
        "iconBg": "rgba(252,211,77,.15)",
        "title": "Decision Centre",
        "sub": "4 pending decisions requiring your approval",
        "badge": "Needs Review",
        "badgeCls": "badge-a"
      },
      {
        "icon": "◈",
        "iconColor": "#A78BFA",
        "iconBg": "rgba(167,139,250,.15)",
        "title": "Investment Intelligence",
        "sub": "Business case scoring and go/no-go framework ready",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "icon": "↗",
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
        "title": "Project details",
        "desc": "Name, delivery method (Agile/Waterfall/Hybrid), target go-live, and budget.",
        "done": true
      },
      {
        "n": "2",
        "title": "Upload business case or brief",
        "desc": "SOW, PRD, or a description. AI extracts workstreams, milestones, and risks.",
        "done": true
      },
      {
        "n": "3",
        "title": "AI workspace generation",
        "desc": "RAID log, 12 milestones, stakeholder map, and delivery timeline — all in under 60 seconds.",
        "active": true
      },
      {
        "n": "4",
        "title": "Review and accept outputs",
        "desc": "Accept, edit, or reject each item. Nothing is applied without your confirmation."
      },
      {
        "n": "5",
        "title": "Invite your team",
        "desc": "Send role-specific invitations. Each team member gets their personalised dashboard."
      }
    ],
    "outputs": [
      {
        "icon": "⬡",
        "iconColor": "#60A5FA",
        "iconBg": "rgba(96,165,250,.15)",
        "title": "4 Workstreams Identified",
        "sub": "North Region · Digital Integration · Governance · Training",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "icon": "⬡",
        "iconColor": "#60A5FA",
        "iconBg": "rgba(96,165,250,.15)",
        "title": "12 Milestones Planned",
        "sub": "From Discovery to Benefits Realisation — 9-month timeline",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "icon": "⬡",
        "iconColor": "#D97706",
        "iconBg": "rgba(217,119,6,.15)",
        "title": "RAID Log Generated",
        "sub": "7 risks · 4 assumptions · 3 dependencies — ready for review",
        "badge": "Needs Review",
        "badgeCls": "badge-a"
      },
      {
        "icon": "⬡",
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
        "title": "Project context",
        "desc": "Project name, type, key stakeholders, and requirements deadline.",
        "done": true
      },
      {
        "n": "2",
        "title": "Upload project documents",
        "desc": "Business case, PRD, emails, meeting notes, or existing requirements.",
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
        "icon": "⬢",
        "iconColor": "#2DD4BF",
        "iconBg": "rgba(45,212,191,.15)",
        "title": "46 Requirements Extracted",
        "sub": "32 functional · 8 non-functional · 6 business rules",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "icon": "⬢",
        "iconColor": "#2DD4BF",
        "iconBg": "rgba(45,212,191,.15)",
        "title": "Traceability Matrix",
        "sub": "Business objectives mapped to all 46 requirements",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "icon": "⬢",
        "iconColor": "#D97706",
        "iconBg": "rgba(217,119,6,.15)",
        "title": "9 Clarification Gaps",
        "sub": "Approval workflows, SLAs, and data retention rules",
        "badge": "Needs Review",
        "badgeCls": "badge-a"
      },
      {
        "icon": "⬢",
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
        "icon": "◈",
        "iconColor": "#A78BFA",
        "iconBg": "rgba(167,139,250,.15)",
        "title": "3 Customer Segments",
        "sub": "Healthcare PMs · Agency PMs · Enterprise PMOs with JTBD per segment",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "icon": "◈",
        "iconColor": "#A78BFA",
        "iconBg": "rgba(167,139,250,.15)",
        "title": "Opportunity Solution Tree",
        "sub": "6 opportunities mapped to 14 potential features",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "icon": "◈",
        "iconColor": "#D97706",
        "iconBg": "rgba(217,119,6,.15)",
        "title": "Prioritised Backlog",
        "sub": "Top 10 features RICE-scored · Meeting Intelligence leads at 250",
        "badge": "Needs Review",
        "badgeCls": "badge-a"
      },
      {
        "icon": "◈",
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
        "icon": "⬟",
        "iconColor": "#93C5FD",
        "iconBg": "rgba(147,197,253,.15)",
        "title": "6 Stories Assigned",
        "sub": "3 high priority · 1 blocked on Auth API · 2 in review",
        "badge": "Needs Review",
        "badgeCls": "badge-a"
      },
      {
        "icon": "⬟",
        "iconColor": "#93C5FD",
        "iconBg": "rgba(147,197,253,.15)",
        "title": "Dependency Map",
        "sub": "Auth API (blocked) · Neo4j (ready) · Anthropic API (active)",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "icon": "⬟",
        "iconColor": "#60A5FA",
        "iconBg": "rgba(96,165,250,.15)",
        "title": "Architecture Overview",
        "sub": "Frontend → API → AI Services → Knowledge Graph flow",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "icon": "⬟",
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
        "icon": "◉",
        "iconColor": "#FCD34D",
        "iconBg": "rgba(252,211,77,.15)",
        "title": "124 Test Cases Generated",
        "sub": "82 functional · 24 edge cases · 18 negative tests",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "icon": "◉",
        "iconColor": "#FCD34D",
        "iconBg": "rgba(252,211,77,.15)",
        "title": "Release Readiness Baseline",
        "sub": "Starting score: rises as tests pass and defects close",
        "badge": "Active",
        "badgeCls": "badge-n"
      },
      {
        "icon": "◉",
        "iconColor": "#3D9660",
        "iconBg": "rgba(61,150,96,.15)",
        "title": "Regression Suite",
        "sub": "42 automation candidates identified for Playwright/Cypress",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "icon": "◉",
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
        "icon": "◎",
        "iconColor": "#6EE7B7",
        "iconBg": "rgba(110,231,183,.15)",
        "title": "Sprint Baseline Set",
        "sub": "Sprint 24 · 72% complete · 4 days remaining · velocity stable",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "icon": "◎",
        "iconColor": "#DC2626",
        "iconBg": "rgba(220,38,38,.15)",
        "title": "3 Blockers Identified",
        "sub": "Auth API (5 days, high) · Test environment (2 days, medium)",
        "badge": "Needs Review",
        "badgeCls": "badge-a"
      },
      {
        "icon": "◎",
        "iconColor": "#3D9660",
        "iconBg": "rgba(61,150,96,.15)",
        "title": "Team Health Score",
        "sub": "8.1/10 happiness · Meeting load: moderate · Burnout risk: low",
        "badge": "Generated",
        "badgeCls": "badge-g"
      },
      {
        "icon": "◎",
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

export const LOOP_SENDS: LoopSend[] = [
  {
    "role": "sponsor",
    "sends": [
      "GO decision & workspace",
      "Budget approvals",
      "Hiring decisions"
    ]
  },
  {
    "role": "pm",
    "sends": [
      "Delivery plan & RAID",
      "Sprint priorities",
      "Risk escalations"
    ]
  },
  {
    "role": "ba",
    "sends": [
      "Approved requirements",
      "18 user stories",
      "Traceability matrix"
    ]
  },
  {
    "role": "po",
    "sends": [
      "Prioritised roadmap",
      "RICE-scored backlog",
      "PRD & API specs"
    ]
  },
  {
    "role": "eng",
    "sends": [
      "Merged PRs & builds",
      "Blocker notifications",
      "Test-ready APIs"
    ]
  },
  {
    "role": "qa",
    "sends": [
      "Release confidence",
      "Defect reports",
      "Go/No-Go signal"
    ]
  },
  {
    "role": "sm",
    "sends": [
      "Sprint health report",
      "Blocker escalations",
      "Retro insights"
    ]
  }
] as LoopSend[];

export const ROLE_PILL_LABELS: Record<RoleId, string> = {
  "sponsor": "Sponsor",
  "pm": "Project Manager",
  "ba": "Business Analyst",
  "po": "Product Manager",
  "eng": "Engineer",
  "qa": "QA",
  "sm": "Scrum Master"
} as Record<RoleId, string>;

export const THREAD_CALLOUTS = [
  {
    "tone": "red",
    "title": "Auth API blocker",
    "body": "Logged by Engineer on day 5 → SM impediment board → PM delivery signals → Sponsor intelligence feed. One event. Four dashboards. No manual update."
  },
  {
    "tone": "amber",
    "title": "2 critical defects",
    "body": "QA logs BUG-142 and BUG-167 → PM release decision blocked → Engineer receives assignment → Sponsor portfolio card moves to Watch."
  },
  {
    "tone": "green",
    "title": "BA resolves FR-003",
    "body": "Acceptance criteria accepted → Engineer story moves to ready → QA test cases generated → SM impediment cleared. Traceability 78% → 81%."
  }
] as const;

export const PROOF_STATS = [
  {
    "n": "40%",
    "label": "PM time on admin",
    "desc": "Status chasing and report writing consume nearly half the week — work that should happen automatically from the tools the team already uses."
  },
  {
    "n": "3wk",
    "label": "Risk escalation lag",
    "desc": "Issues flagged in standups go unlogged until they are urgent. By the time they reach the Sponsor, the mitigation window has closed."
  },
  {
    "n": "97%",
    "label": "Lessons lost",
    "desc": "Closure reports sit in folders. The knowledge that could prevent the next project from making the same mistakes never reaches the people who need it."
  }
] as const;

export const PRICING_TIERS = [
  {
    "tier": "Starter",
    "name": "Solo PM",
    "price": "49",
    "period": "/ month",
    "desc": "For individual project managers running up to 3 active projects.",
    "features": [
      "3 active projects",
      "Up to 10 team members",
      "AI document analysis",
      "Standup intelligence",
      "Weekly status reports"
    ],
    "cta": "Start free trial",
    "ctaHref": "/signup",
    "featured": false,
    "ghost": true
  },
  {
    "tier": "Professional",
    "name": "Delivery teams",
    "price": "149",
    "period": "/ month",
    "desc": "For teams with multiple roles — all 7 personalised dashboards and the full collaborative loop.",
    "features": [
      "Unlimited projects",
      "All 7 personalised dashboards",
      "Stakeholder loop — live sync",
      "Meeting intelligence",
      "Decision register",
      "Organisational memory"
    ],
    "cta": "Start free trial",
    "ctaHref": "/signup",
    "featured": true,
    "badge": "Most popular",
    "ghost": false
  },
  {
    "tier": "Enterprise",
    "name": "PMO & programmes",
    "price": "Custom",
    "period": "",
    "desc": "For PMOs running cross-project portfolios with SSO and dedicated success.",
    "features": [
      "All Professional features",
      "Programme layer",
      "Portfolio dashboard",
      "SSO / SAML",
      "Dedicated success manager"
    ],
    "cta": "Contact sales",
    "ctaHref": "/signup",
    "featured": false,
    "ghost": true,
    "customPrice": true
  }
] as const;

export type PricingTier = {
  tier: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  features: readonly string[];
  cta: string;
  ctaHref: string;
  featured: boolean;
  ghost: boolean;
  badge?: string;
  customPrice?: boolean;
};
