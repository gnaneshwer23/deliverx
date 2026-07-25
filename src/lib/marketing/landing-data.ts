import {
  OB_CONFIG,
  type MarketingRoleId,
  type OnboardingOutput,
  type OnboardingRoleData,
  type OnboardingStep,
} from "@/config/persona-onboarding";
import {
  WORKSPACE_FLOW_STEPS,
  type WorkspaceFlowStepId,
} from "@/lib/workspace-flow-stages";

export type RoleId = MarketingRoleId;

export type BadgeTone = "badge-g" | "badge-a" | "badge-n";

export type { OnboardingStep, OnboardingOutput, OnboardingRoleData };
export { OB_CONFIG as OB_DATA };

export type RoleKpi = {
  label: string;
  val: string;
  delta: string;
  dir: 'up' | 'dn' | 'warn' | '';
};

export type RoleFeed = { dot: string; text: string; from: string };

export type RoleLoopItem = {
  code: string;
  bg: string;
  color: string;
  name: string;
  status: string;
  badge: string;
  badgeCls: BadgeTone;
};

export type RoleDashboard = {
  name: string;
  code: string;
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

export type LoopSend = { role: RoleId; sends: string[] };

export const ROLE_ORDER: RoleId[] = ["sponsor","pm","ba","po","eng","qa","sm"];

export const ROLES: Record<RoleId, RoleDashboard> = {
  "sponsor": {
    "name": "Founder / Sponsor",
    "code": "SP",
    "accent": "#3D9660",
    "accentBg": "rgba(61,150,96,.12)",
    "title": "Founder / Sponsor · Command Centre",
    "badge": "Portfolio Healthy",
    "tagline": "Portfolio, decisions, and runway in one view",
    "kpis": [
      {
        "label": "Monthly Revenue",
        "val": "£25k",
        "delta": "+12%",
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
        "delta": "+3%",
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
        "code": "PM",
        "bg": "rgba(96,165,250,.15)",
        "color": "#60A5FA",
        "name": "Project Manager",
        "status": "Awaiting budget approval for API vendor",
        "badge": "Urgent",
        "badgeCls": "badge-a"
      },
      {
        "code": "PO",
        "bg": "rgba(167,139,250,.15)",
        "color": "#A78BFA",
        "name": "Product Manager",
        "status": "Q3 roadmap needs strategic sign-off",
        "badge": "Review",
        "badgeCls": "badge-a"
      },
      {
        "code": "BA",
        "bg": "rgba(45,212,191,.15)",
        "color": "#2DD4BF",
        "name": "Business Analyst",
        "status": "Requirements signed off — no action",
        "badge": "Clear",
        "badgeCls": "badge-g"
      },
      {
        "code": "QA",
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
    "code": "PM",
    "accent": "#60A5FA",
    "accentBg": "rgba(96,165,250,.1)",
    "title": "Project Manager · NHS EHR",
    "badge": "Sprint 24 · 72%",
    "tagline": "Milestones, RAID, and delivery confidence",
    "kpis": [
      {
        "label": "Project Health",
        "val": "87%",
        "delta": "+2%",
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
    "loopTitle": "AI Review Queue",
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
        "code": "BA",
        "bg": "rgba(45,212,191,.15)",
        "color": "#2DD4BF",
        "name": "Business Analyst",
        "status": "9 clarification gaps blocking sprint 5",
        "badge": "Urgent",
        "badgeCls": "badge-a"
      },
      {
        "code": "EN",
        "bg": "rgba(147,197,253,.15)",
        "color": "#93C5FD",
        "name": "Engineer",
        "status": "Auth API dependency unblocked yet?",
        "badge": "Waiting",
        "badgeCls": "badge-n"
      },
      {
        "code": "QA",
        "bg": "rgba(252,211,77,.15)",
        "color": "#FCD34D",
        "name": "QA",
        "status": "Release go-ahead decision needed",
        "badge": "Review",
        "badgeCls": "badge-a"
      },
      {
        "code": "SP",
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
    "code": "BA",
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
    "loopTitle": "AI Review Queue",
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
        "code": "PM",
        "bg": "rgba(96,165,250,.15)",
        "color": "#60A5FA",
        "name": "Project Manager",
        "status": "9 gaps blocking sprint planning",
        "badge": "Urgent",
        "badgeCls": "badge-a"
      },
      {
        "code": "EN",
        "bg": "rgba(147,197,253,.15)",
        "color": "#93C5FD",
        "name": "Engineer",
        "status": "18 stories ready to pull into sprint",
        "badge": "Ready",
        "badgeCls": "badge-g"
      },
      {
        "code": "QA",
        "bg": "rgba(252,211,77,.15)",
        "color": "#FCD34D",
        "name": "QA",
        "status": "Acceptance criteria for FR-003 incomplete",
        "badge": "Review",
        "badgeCls": "badge-a"
      },
      {
        "code": "SP",
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
    "code": "PO",
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
    "loopTitle": "AI Review Queue",
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
        "code": "SP",
        "bg": "rgba(61,150,96,.15)",
        "color": "#3D9660",
        "name": "Sponsor",
        "status": "Q3 roadmap needs strategic sign-off",
        "badge": "Review",
        "badgeCls": "badge-a"
      },
      {
        "code": "BA",
        "bg": "rgba(45,212,191,.15)",
        "color": "#2DD4BF",
        "name": "Business Analyst",
        "status": "PRD validated — 46 requirements extracted",
        "badge": "Done",
        "badgeCls": "badge-g"
      },
      {
        "code": "EN",
        "bg": "rgba(147,197,253,.15)",
        "color": "#93C5FD",
        "name": "Engineer",
        "status": "Meeting Intelligence specs need API detail",
        "badge": "Needed",
        "badgeCls": "badge-a"
      },
      {
        "code": "QA",
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
    "code": "EN",
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
    "loopTitle": "AI Review Queue",
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
        "code": "PM",
        "bg": "rgba(96,165,250,.15)",
        "color": "#60A5FA",
        "name": "Project Manager",
        "status": "Auth API blocker update needed",
        "badge": "Update",
        "badgeCls": "badge-a"
      },
      {
        "code": "QA",
        "bg": "rgba(252,211,77,.15)",
        "color": "#FCD34D",
        "name": "QA",
        "status": "Reports API ready for testing",
        "badge": "Ready",
        "badgeCls": "badge-g"
      },
      {
        "code": "BA",
        "bg": "rgba(45,212,191,.15)",
        "color": "#2DD4BF",
        "name": "BA",
        "status": "FR-003 acceptance criteria incomplete",
        "badge": "Waiting",
        "badgeCls": "badge-n"
      },
      {
        "code": "SM",
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
    "code": "QA",
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
    "loopTitle": "AI Review Queue",
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
        "code": "PM",
        "bg": "rgba(96,165,250,.15)",
        "color": "#60A5FA",
        "name": "Project Manager",
        "status": "Release go-ahead needs decision",
        "badge": "Urgent",
        "badgeCls": "badge-a"
      },
      {
        "code": "EN",
        "bg": "rgba(147,197,253,.15)",
        "color": "#93C5FD",
        "name": "Engineer",
        "status": "Reports API — ready to test",
        "badge": "Test Now",
        "badgeCls": "badge-g"
      },
      {
        "code": "BA",
        "bg": "rgba(45,212,191,.15)",
        "color": "#2DD4BF",
        "name": "BA",
        "status": "FR-003 acceptance criteria missing",
        "badge": "Needed",
        "badgeCls": "badge-a"
      },
      {
        "code": "SP",
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
    "code": "SM",
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
    "loopTitle": "AI Review Queue",
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
        "code": "PM",
        "bg": "rgba(96,165,250,.15)",
        "color": "#60A5FA",
        "name": "Project Manager",
        "status": "Sprint 24 health report sent",
        "badge": "Sent",
        "badgeCls": "badge-g"
      },
      {
        "code": "EN",
        "bg": "rgba(147,197,253,.15)",
        "color": "#93C5FD",
        "name": "Engineer",
        "status": "Auth API escalation active",
        "badge": "Active",
        "badgeCls": "badge-a"
      },
      {
        "code": "QA",
        "bg": "rgba(252,211,77,.15)",
        "color": "#FCD34D",
        "name": "QA",
        "status": "Test environment fix scheduled tmrw",
        "badge": "Scheduled",
        "badgeCls": "badge-g"
      },
      {
        "code": "PO",
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
    "body": "Logged by Engineer on day 5, routed to SM impediment board, PM delivery signals, and Sponsor intelligence feed. One event. Four dashboards. No manual update."
  },
  {
    "tone": "amber",
    "title": "2 critical defects",
    "body": "QA logs BUG-142 and BUG-167. PM release decision blocked. Engineer receives assignment. Sponsor portfolio card moves to Watch."
  },
  {
    "tone": "green",
    "title": "BA resolves FR-003",
    "body": "Acceptance criteria accepted. Engineer story moves to ready. QA test cases generated. SM impediment cleared. Traceability 78% to 81%."
  }
] as const;

export type DeliveryStage = {
  code: string;
  label: string;
  detail: string;
};

/** Marketing copy keyed to `WORKSPACE_FLOW_STEPS` — same PM-first path as mission control. */
const DELIVERY_STAGE_DETAILS: Record<WorkspaceFlowStepId, string> = {
  upload:
    "Upload business case, charter, or plain text on PM Mission Control. Delivery Brain extracts scope, timeline, team, and objectives.",
  extract:
    "AI proposes workstreams, milestones, and initial RAID. Nothing is applied until you accept, edit, or reject each item in the AI Review Queue.",
  invite_ba:
    "Generate a BA join link from the business case flow. Your analyst lands in a workspace built from the same brief — no duplicate setup.",
  ba_review:
    "BA reviews extracted requirements and closes gaps. Approved stories and traceability feed engineering and QA from one signal graph.",
  delivery:
    "Each role gets a personalised dashboard. After PM approval, delivery impact events propagate across PM, Engineer, QA, and Sponsor views.",
};

/** End-to-end delivery pipeline — labels aligned with `WORKSPACE_FLOW_STEPS`. */
export const DELIVERY_STAGES: readonly DeliveryStage[] = WORKSPACE_FLOW_STEPS.map(
  (step, index) => ({
    code: String(index + 1).padStart(2, "0"),
    label: step.short,
    detail: DELIVERY_STAGE_DETAILS[step.id],
  }),
);

export type PilotQuote = {
  /** Set to true when a real pilot customer quote is approved for publication. */
  enabled: boolean;
  quote: string;
  name: string;
  title: string;
  org: string;
};

export type LiveFeatureCategory = "onboarding" | "ai-meetings" | "visibility";

export type LiveFeature = {
  title: string;
  description: string;
  category: LiveFeatureCategory;
};

export type LiveFeatureCategoryMeta = {
  label: string;
  summary: string;
  accent: string;
};

export const LIVE_FEATURE_CATEGORIES: Record<LiveFeatureCategory, LiveFeatureCategoryMeta> = {
  onboarding: {
    label: "Team onboarding",
    summary: "Bootstrap workspaces and bring teammates in with role-specific paths.",
    accent: "#3D9660",
  },
  "ai-meetings": {
    label: "AI & meetings",
    summary: "Approval-gated AI, Helm copilot, and meeting intelligence on main today.",
    accent: "#1C4A2E",
  },
  visibility: {
    label: "Visibility",
    summary: "Cross-role signals and dual navigation surfaces for org-wide delivery.",
    accent: "#60A5FA",
  },
};

export type ComingSoonFeature = {
  title: string;
  description: string;
  priorityLabel: string;
  priorityTone: BadgeTone;
};

/** Shipped capabilities — honest list aligned with main (F1–F5, Helm, Whisper, G1–G4). */
export const LIVE_FEATURES: readonly LiveFeature[] = [
  {
    category: "onboarding",
    title: "PM business case upload + AI review",
    description:
      "Upload a business case or charter on PM Mission Control. Delivery Brain extracts scope, milestones, and RAID — every proposal lands in the AI Review Queue for your approval.",
  },
  {
    category: "onboarding",
    title: "Role invite links + /join bootstrap",
    description:
      "Generate role-specific invite links from your workspace. Teammates sign up via /join and land in a workspace seeded from the same business case.",
  },
  {
    category: "ai-meetings",
    title: "AI Review Queue",
    description:
      "Review, edit, or reject AI proposals in one queue at /workspace/proposals. Nothing is applied until a human approves it.",
  },
  {
    category: "ai-meetings",
    title: "Ask Helm on mission pages",
    description:
      "Ask Helm — your delivery copilot — on every persona mission-control page. Context-aware answers grounded in your project data.",
  },
  {
    category: "ai-meetings",
    title: "Meeting paste + Whisper audio",
    description:
      "Paste meeting notes or upload audio for Whisper transcription. Extract action items and feed them into your delivery signal graph.",
  },
  {
    category: "ai-meetings",
    title: "Dedicated meeting review page",
    description:
      "Paste or transcribe meeting notes, then review extracted actions on a dedicated meeting page before they feed into your delivery signal graph.",
  },
  {
    category: "ai-meetings",
    title: "Standup tasks on persona missions",
    description:
      "Standup intelligence surfaces on each persona mission-control page — action items scoped to how that role works.",
  },
  {
    category: "visibility",
    title: "Delivery signals across roles",
    description:
      "PM Command Centre surfaces blockers, risks, and sprint health — propagated across persona dashboards after approval via delivery impact events.",
  },
  {
    category: "visibility",
    title: "Dual workspace surfaces",
    description:
      "Organisation-wide tools at /workspace/* plus project-scoped views at /project/[id]/* — same signal graph, two navigation contexts.",
  },
] as const;

/** Roadmap items — flagged honestly; not yet production-ready. */
export const COMING_SOON: readonly ComingSoonFeature[] = [
  {
    title: "Auto email reliability",
    description:
      "Automated stakeholder updates and email digests with delivery-grade reliability.",
    priorityLabel: "High priority",
    priorityTone: "badge-a",
  },
  {
    title: "Full doc PDF export",
    description:
      "Export full project documentation as a structured PDF pack.",
    priorityLabel: "In design",
    priorityTone: "badge-g",
  },
  {
    title: "Day-in-the-life simulation",
    description:
      "Interactive day-in-the-life walkthrough for each delivery role.",
    priorityLabel: "Exploring",
    priorityTone: "badge-n",
  },
] as const;

/** Pilot social proof — hidden until a real quote is approved (enabled: true). */
export const PILOT_QUOTE: PilotQuote = {
  enabled: false,
  // Replace placeholders below when a real pilot quote is approved for publication.
  quote: "",
  name: "",
  title: "",
  org: "",
};

/** Pilot platform metrics — honest product facts, not industry survey statistics. */
export const PROOF_STATS = [
  {
    n: "7",
    label: "Persona workspaces",
    desc: "Sponsor, PM, BA, PO, Engineer, QA, and Scrum Master — each with a mission-control layout matched to how that role works, not a shared generic board.",
  },
  {
    n: "1",
    label: "AI Review Queue",
    desc: "Every AI proposal — workspace updates, extracted requirements, meeting actions — lands in one approval queue. Nothing applies until a human accepts, edits, or rejects it.",
  },
  {
    n: "≤10s",
    label: "Signal propagation",
    desc: "After PM approval, delivery impact events reach relevant persona dashboards in seconds during pilot testing — not batch overnight sync.",
  },
] as const;

export type QuickStartStep = {
  step: string;
  label: string;
  detail: string;
};

/** Above-the-fold path — mirrors the PM-first workspace flow. */
export const QUICK_START_STEPS: readonly QuickStartStep[] = [
  {
    step: "01",
    label: "Upload business case",
    detail: "PM Mission Control extracts scope, milestones, and RAID into the Review Queue.",
  },
  {
    step: "02",
    label: "Invite your team",
    detail: "Generate role-specific /join links — BA, Engineer, and QA land in the same workspace.",
  },
  {
    step: "03",
    label: "Approve & deliver",
    detail: "Accept AI proposals in the Review Queue; signals propagate across persona views.",
  },
] as const;

export const PRICING_TIERS = [
  {
    "tier": "Early access",
    "name": "Free trial",
    "price": "Coming soon",
    "period": "",
    "desc": "Full platform during early access — all seven role dashboards, AI Review Queue, and connected delivery signals.",
    "features": [
      "All 7 role dashboards",
      "AI document analysis + Review Queue",
      "Meeting intelligence",
      "Standup tasks on persona missions",
      "Decision register",
      "Organisational memory"
    ],
    "highlightFeatures": ["All 7 role dashboards"],
    "cta": "Join the pilot",
    "ctaHref": "/signup",
    "featured": true,
    "badge": "Available now",
    "ghost": false,
    "customPrice": true
  },
  {
    "tier": "Teams",
    "name": "Delivery teams",
    "price": "Coming soon",
    "period": "",
    "desc": "Paid plans for delivery teams — pricing finalised once billing is live.",
    "features": [
      "Everything in early access",
      "Unlimited projects",
      "Priority support",
      "Advanced portfolio views"
    ],
    "cta": "Join the pilot",
    "ctaHref": "/signup",
    "featured": false,
    "ghost": true,
    "customPrice": true
  },
  {
    "tier": "Enterprise",
    "name": "PMO & programmes",
    "price": "Custom",
    "period": "",
    "desc": "Pilot conversations welcome — enterprise packaging is not a live checkout SKU.",
    "features": [
      "All team features",
      "Programme layer",
      "Portfolio dashboard",
      "SSO / SAML (when delivered)",
      "Dedicated success (when delivered)"
    ],
    "cta": "Contact us",
    "ctaHref": "mailto:hello@deliverx.dev?subject=DeliverX%20Enterprise%20enquiry",
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
  excludedFeatures?: readonly string[];
  highlightFeatures?: readonly string[];
  upgradeNudge?: string;
  cta: string;
  ctaHref: string;
  featured: boolean;
  ghost: boolean;
  badge?: string;
  customPrice?: boolean;
};

export type TickerRole = {
  symbol: string;
  role: string;
  meaning: string;
};

/** Row 1 — persona codes, names, and taglines for the landing marquee. */
export const TICKER_ROLES: TickerRole[] = ROLE_ORDER.map((id) => {
  const role = ROLES[id];
  return {
    symbol: "◈",
    role: role.code,
    meaning: role.tagline,
  };
});

/** Row 2 — Brief v2 platform capabilities for the landing marquee. */
export const TICKER_CAPABILITIES = [
  "Delivery Brain",
  "AI Review Queue",
  "Brief ingestion",
  "Delivery signal graph",
  "RAID tracking",
  "Meeting intelligence",
  "Decision register",
  "Organisational memory",
  "Standup intelligence",
  "Release readiness",
  "Traceability matrix",
  "Signal threads",
  "Sprint health",
  "Portfolio dashboard",
  "Human-in-the-loop AI",
] as const;
