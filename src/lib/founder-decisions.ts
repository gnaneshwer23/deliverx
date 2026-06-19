import type { FounderDecisionRow } from "@/services/founderEngine";

export const FOUNDER_DECISION_LIMIT = 10;

export type PendingDecisionInput = {
  id: string;
  title: string;
  status: string;
  project_id: string;
  project_name: string;
};

export type PendingApprovalInput = {
  id: string;
  entity_type: string;
  approval_level: string;
  status: string;
  project_id: string;
  project_name: string;
};

export function mapPendingDecisionToRow(decision: PendingDecisionInput): FounderDecisionRow {
  return {
    id: decision.id,
    title: decision.title,
    impact: "Medium",
    status: decision.status,
    projectName: decision.project_name,
    projectId: decision.project_id,
    kind: "decision",
  };
}

export function mapPendingApprovalToRow(approval: PendingApprovalInput): FounderDecisionRow {
  return {
    id: approval.id,
    title: `${approval.entity_type} approval (${approval.approval_level})`,
    impact: approval.approval_level === "steering" ? "High" : "Medium",
    status: approval.status,
    projectName: approval.project_name,
    projectId: approval.project_id,
    kind: "approval",
  };
}

/** Merge governance decisions and pending approvals, dedupe by kind+id, cap list size. */
export function mergeFounderDecisionRows(
  decisions: PendingDecisionInput[],
  approvals: PendingApprovalInput[],
  limit = FOUNDER_DECISION_LIMIT,
): FounderDecisionRow[] {
  const decisionRows = decisions.map(mapPendingDecisionToRow);
  const approvalRows = approvals.map(mapPendingApprovalToRow);

  const seen = new Set<string>();
  return [...decisionRows, ...approvalRows].filter((row) => {
    const key = `${row.kind}:${row.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}
