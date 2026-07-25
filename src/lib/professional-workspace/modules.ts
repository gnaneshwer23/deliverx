/**
 * DeliverX Professional Workspace — module contracts.
 * Workspace is multidisciplinary work with AI teammates — not a chatbot product.
 * AI suggests; humans author, accept, edit, and submit.
 */

export type WorkspaceModuleId =
  | "overview"
  | "team"
  | "stakeholders"
  | "inbox"
  | "meetings"
  | "tasks"
  | "artefacts"
  | "decisions"
  | "risks"
  | "timeline"
  | "insights"
  | "coach"
  | "evidence";

export type WorkspacePermission =
  | "view"
  | "comment"
  | "edit"
  | "decide"
  | "invite"
  | "admin";

export type WorkspaceModuleContract = {
  id: WorkspaceModuleId;
  label: string;
  href: string;
  /** User jobs this module exists to serve */
  userJobs: string[];
  primaryActions: string[];
  permissions: WorkspacePermission[];
  /** Who owns the canonical records */
  dataOwnership: string;
  /** What AI may do — never auto-complete the user's job */
  aiActions: string[];
  /** Evidence kinds emitted to the ledger / contribution log */
  evidenceGenerated: string[];
  dependencies: WorkspaceModuleId[];
  emptyState: string;
  errorState: string;
  completionState: string;
};

export const PROFESSIONAL_WORKSPACE_MODULES: WorkspaceModuleContract[] = [
  {
    id: "overview",
    label: "Project Overview",
    href: "/workspace",
    userJobs: [
      "Understand project purpose, status, and constraints",
      "Orient before acting across modules",
    ],
    primaryActions: ["Select project", "Review health", "Open next decision"],
    permissions: ["view", "comment"],
    dataOwnership: "Project record (org project or Experience enrolment)",
    aiActions: ["Summarise status", "Surface risks and blockers", "Suggest next focus"],
    evidenceGenerated: ["orientation_note", "status_acknowledgement"],
    dependencies: [],
    emptyState: "No project selected. Choose an Experience or delivery project to begin.",
    errorState: "Project context unavailable. Refresh or pick another project.",
    completionState: "User has acknowledged current status and chosen a next action.",
  },
  {
    id: "team",
    label: "Team",
    href: "/workspace/team",
    userJobs: ["See AI + human teammates", "Clarify roles and coverage"],
    primaryActions: ["View roles", "Invite human", "Assign owner"],
    permissions: ["view", "invite", "edit"],
    dataOwnership: "workspace_members + AI persona roster on project context",
    aiActions: ["Propose role coverage gaps", "Draft invite copy"],
    evidenceGenerated: ["team_assignment", "invite_sent"],
    dependencies: ["overview"],
    emptyState: "No teammates yet. Invite a human or open an Experience with AI personas.",
    errorState: "Could not load team roster.",
    completionState: "Every critical workstream has an accountable owner.",
  },
  {
    id: "stakeholders",
    label: "Stakeholders",
    href: "/workspace/stakeholders",
    userJobs: ["Map influence and trust", "Respond to stakeholder needs"],
    primaryActions: ["Add stakeholder", "Update trust", "Log request"],
    permissions: ["view", "edit", "comment"],
    dataOwnership: "project stakeholders table / Experience persona stakeholders",
    aiActions: ["Draft stakeholder update", "Flag trust drops"],
    evidenceGenerated: ["stakeholder_update", "trust_change"],
    dependencies: ["overview", "team"],
    emptyState: "No stakeholders mapped. Add sponsors, customers, or partners.",
    errorState: "Stakeholder list failed to load.",
    completionState: "Key stakeholders have current owners and open requests tracked.",
  },
  {
    id: "inbox",
    label: "Inbox",
    href: "/workspace/inbox",
    userJobs: ["Triage stakeholder and teammate requests", "Decide what needs a human reply"],
    primaryActions: ["Open message", "Reply", "Convert to task", "Defer"],
    permissions: ["view", "edit", "decide"],
    dataOwnership: "Messages / alerts scoped to project + user",
    aiActions: ["Draft reply options", "Prioritise by risk", "Never send without acceptance"],
    evidenceGenerated: ["message_reply", "triage_decision"],
    dependencies: ["stakeholders", "team"],
    emptyState: "Inbox clear. New requests appear as conditions change.",
    errorState: "Inbox sync failed.",
    completionState: "All high-severity items triage-decided.",
  },
  {
    id: "meetings",
    label: "Meetings",
    href: "/workspace/meetings",
    userJobs: ["Run or prepare multidisciplinary meetings", "Capture outcomes"],
    primaryActions: ["Schedule", "Prepare agenda", "Record outcome", "Review transcript"],
    permissions: ["view", "edit", "decide"],
    dataOwnership: "meetings + transcripts (org) / sim meetings (Experience)",
    aiActions: ["Draft agenda", "Extract actions", "Propose decisions — user confirms"],
    evidenceGenerated: ["meeting_outcome", "action_extracted", "decision_proposed"],
    dependencies: ["team", "tasks"],
    emptyState: "No meetings scheduled. Create one when alignment is needed.",
    errorState: "Meetings unavailable.",
    completionState: "Meeting has recorded outcome and owned follow-ups.",
  },
  {
    id: "tasks",
    label: "Tasks",
    href: "/workspace/tasks",
    userJobs: ["Track owned work", "Unblock delivery"],
    primaryActions: ["Create task", "Update status", "Reassign", "Accept AI suggestion"],
    permissions: ["view", "edit"],
    dataOwnership: "tasks / delivery items",
    aiActions: ["Suggest tasks from meetings", "Estimate risk of slip", "Never mark done for user"],
    evidenceGenerated: ["task_created", "task_completed", "suggestion_accepted"],
    dependencies: ["overview", "meetings"],
    emptyState: "No open tasks. Pull from meetings, inbox, or risks.",
    errorState: "Task list failed.",
    completionState: "Committed work has owners and due dates.",
  },
  {
    id: "artefacts",
    label: "Artefacts",
    href: "/workspace/artefacts",
    userJobs: ["Create and refine work products", "Submit for review"],
    primaryActions: ["Create", "Edit", "Accept AI draft", "Submit"],
    permissions: ["view", "edit", "decide"],
    dataOwnership: "documents / proposals / artifact_reviews",
    aiActions: ["Draft artefact", "Suggest edits", "Never auto-submit"],
    evidenceGenerated: ["artefact_authored", "ai_draft_accepted", "artefact_submitted"],
    dependencies: ["overview", "decisions"],
    emptyState: "No artefacts yet. Start from a template or AI draft you will own.",
    errorState: "Artefacts failed to load.",
    completionState: "Artefact submitted with clear human authorship trail.",
  },
  {
    id: "decisions",
    label: "Decisions",
    href: "/workspace/decisions",
    userJobs: ["Make and record consequential choices", "Own rationale"],
    primaryActions: ["Open decision", "Record rationale", "Approve / reject AI option"],
    permissions: ["view", "decide"],
    dataOwnership: "decisions / governance approvals",
    aiActions: ["Propose options and trade-offs", "Never decide silently"],
    evidenceGenerated: ["decision_recorded", "rationale_authored", "option_accepted"],
    dependencies: ["overview", "risks", "stakeholders"],
    emptyState: "No open decisions. Escalations and trade-offs appear here.",
    errorState: "Decision centre unavailable.",
    completionState: "Decision recorded with rationale and consequence link.",
  },
  {
    id: "risks",
    label: "Risks",
    href: "/workspace/risks",
    userJobs: ["Identify, assess, and mitigate risk", "Escalate when needed"],
    primaryActions: ["Log risk", "Update severity", "Mitigate", "Accept"],
    permissions: ["view", "edit", "decide"],
    dataOwnership: "RAID / risks",
    aiActions: ["Suggest risks from signals", "Draft mitigations"],
    evidenceGenerated: ["risk_logged", "mitigation_owned"],
    dependencies: ["overview", "timeline"],
    emptyState: "No open risks. Add risks as uncertainty appears.",
    errorState: "Risk register failed.",
    completionState: "High risks have owners and mitigation status.",
  },
  {
    id: "timeline",
    label: "Timeline",
    href: "/workspace/timeline",
    userJobs: ["See sequence, milestones, and pressure", "Adjust plan consciously"],
    primaryActions: ["Review milestones", "Slip with rationale", "Link dependencies"],
    permissions: ["view", "edit"],
    dataOwnership: "milestones / timeline events",
    aiActions: ["Flag schedule pressure", "Propose resequence"],
    evidenceGenerated: ["timeline_change", "slip_rationale"],
    dependencies: ["overview", "tasks", "risks"],
    emptyState: "No timeline yet. Seed milestones from the project brief.",
    errorState: "Timeline unavailable.",
    completionState: "Near-term milestones are dated with owners.",
  },
  {
    id: "insights",
    label: "Insights",
    href: "/workspace/insights",
    userJobs: ["Interpret changing conditions", "Choose what to act on"],
    primaryActions: ["Review insight", "Dismiss", "Convert to task/risk"],
    permissions: ["view", "decide"],
    dataOwnership: "intelligence signals / delivery insights",
    aiActions: ["Generate insights from project state", "Never auto-apply changes"],
    evidenceGenerated: ["insight_acknowledged", "insight_acted"],
    dependencies: ["overview", "risks", "timeline"],
    emptyState: "No insights yet. Insights appear as the project accumulates signals.",
    errorState: "Insights failed to load.",
    completionState: "Material insights acknowledged or actioned.",
  },
  {
    id: "coach",
    label: "Coach",
    href: "/workspace/coach",
    userJobs: ["Reflect and improve judgement", "Prepare for hard conversations"],
    primaryActions: ["Ask coach", "Accept prompt", "Save reflection"],
    permissions: ["view", "comment"],
    dataOwnership: "coaching sessions (user-private) + contribution log",
    aiActions: ["Socratic prompts", "Draft talking points", "Never replace user decision"],
    evidenceGenerated: ["coaching_session", "reflection"],
    dependencies: ["overview", "decisions"],
    emptyState: "Coach is ready when you bring a decision, risk, or stakeholder tension.",
    errorState: "Coach unavailable.",
    completionState: "Reflection captured after coached moment.",
  },
  {
    id: "evidence",
    label: "Evidence Review",
    href: "/workspace/evidence",
    userJobs: ["Review what was observed", "Separate user vs AI contribution"],
    primaryActions: ["Filter evidence", "Open provenance", "Flag for capability review"],
    permissions: ["view"],
    dataOwnership: "Evidence Ledger + workspace_contributions (read)",
    aiActions: ["Summarise evidence pack", "Never assign capability scores here"],
    evidenceGenerated: ["evidence_reviewed"],
    dependencies: ["overview"],
    emptyState: "No evidence yet. Work in other modules creates observations.",
    errorState: "Evidence review failed.",
    completionState: "User reviewed provenance for recent submissions.",
  },
];

export function getWorkspaceModule(id: WorkspaceModuleId): WorkspaceModuleContract {
  const mod = PROFESSIONAL_WORKSPACE_MODULES.find((m) => m.id === id);
  if (!mod) throw new Error(`Unknown workspace module: ${id}`);
  return mod;
}

/** Hard rule: AI teammates must not complete all work automatically. */
export const AI_AUTONOMY_POLICY = {
  mayDraft: true,
  maySuggest: true,
  mayPrioritise: true,
  mayAutoSubmit: false,
  mayAutoDecide: false,
  mayMarkTaskDoneForUser: false,
  mayAssignCapability: false,
  requiresHumanAcceptanceFor: [
    "outbound_message",
    "artefact_submit",
    "decision",
    "timeline_commit",
    "risk_accept",
  ],
} as const;
