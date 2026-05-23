/**
 * AI Alert Queue — aggregates delivery signals into a single PM inbox.
 */

import { listProjectsForOrg } from "./portfolio";
import { listOrgTasks } from "./delivery";
import {
  getOrgGovernanceStats,
  listOpenRaidOrg,
  listOrgDecisionsPending,
  listOrgChangeRequests,
} from "./governance";
import { loadProjectSignals } from "./projectSignals";
import { computeProjectHealth, computeDeliveryConfidence } from "./intelligenceEngine";
import { listPendingApprovals } from "./approvals";

export type AlertSeverity = "critical" | "high" | "medium" | "low";

export type DeliveryAlert = {
  id: string;
  severity: AlertSeverity;
  category:
    | "risk"
    | "blocker"
    | "decision"
    | "change"
    | "health"
    | "milestone"
    | "capacity"
    | "approval"
    | "standup";
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
  href?: string;
};

function sevRank(s: AlertSeverity): number {
  return s === "critical" ? 0 : s === "high" ? 1 : s === "medium" ? 2 : 3;
}

export async function getOrgAlertQueue(limit = 30): Promise<DeliveryAlert[]> {
  const alerts: DeliveryAlert[] = [];

  const [projects, openRisks, pendingDecisions, stats, blockedTasks, approvals] =
    await Promise.all([
      listProjectsForOrg(),
      listOpenRaidOrg(12),
      listOrgDecisionsPending(10),
      getOrgGovernanceStats(),
      listOrgTasks({ status: "blocked", limit: 15 }),
      listPendingApprovals(10).catch(() => []),
    ]);

  for (const risk of openRisks) {
    alerts.push({
      id: `risk-${risk.id}`,
      severity: risk.severity === "critical" ? "critical" : risk.severity === "high" ? "high" : "medium",
      category: "risk",
      title: risk.title,
      description: `Open ${risk.type} on ${risk.project_name}`,
      projectId: risk.project_id,
      projectName: risk.project_name,
      href: `/project/${risk.project_id}/raid?type=risk`,
    });
  }

  for (const task of blockedTasks) {
    alerts.push({
      id: `block-${task.id}`,
      severity: "high",
      category: "blocker",
      title: task.title,
      description: `Blocked on ${task.project_name}`,
      projectId: task.project_id,
      projectName: task.project_name,
      href: `/project/${task.project_id}/tasks/${task.id}`,
    });
  }

  for (const d of pendingDecisions) {
    alerts.push({
      id: `dec-${d.id}`,
      severity: "medium",
      category: "decision",
      title: d.title,
      description: `Pending decision — ${d.project_name}`,
      projectId: d.project_id,
      projectName: d.project_name,
      href: `/project/${d.project_id}/decisions`,
    });
  }

  for (const a of approvals) {
    alerts.push({
      id: `appr-${a.id}`,
      severity: a.approval_level === "steering" ? "high" : "medium",
      category: "approval",
      title: `${a.approval_level} approval required`,
      description: `${a.entity_type} awaiting ${a.approval_level} sign-off`,
      projectId: a.project_id,
      href: `/workspace/governance/approvals`,
    });
  }

  if (stats.openChanges > 0) {
    const changes = await listOrgChangeRequests({ status: ["submitted"], limit: 8 }).catch(() => []);
    for (const c of changes) {
      alerts.push({
        id: `cr-${c.id}`,
        severity: "medium",
        category: "change",
        title: c.title,
        description: `Change request submitted — ${c.project_name}`,
        projectId: c.project_id,
        projectName: c.project_name,
        href: `/project/${c.project_id}/changes`,
      });
    }
  }

  for (const p of projects.slice(0, 12)) {
    const signals = await loadProjectSignals(p.id);
    const health = computeProjectHealth(signals);
    const confidence = computeDeliveryConfidence(signals);

    if (health.tier === "at-risk") {
      alerts.push({
        id: `health-${p.id}`,
        severity: "high",
        category: "health",
        title: `${p.name} at risk`,
        description: health.factors.slice(0, 2).join("; ") || "Delivery health below threshold",
        projectId: p.id,
        projectName: p.name,
        href: `/project/${p.id}`,
      });
    }

    if (signals.milestoneDelay) {
      alerts.push({
        id: `ms-${p.id}`,
        severity: "medium",
        category: "milestone",
        title: `Milestone slip — ${p.name}`,
        description: `${signals.overdueTasks} overdue tasks affecting milestone confidence (${confidence.score}%)`,
        projectId: p.id,
        projectName: p.name,
        href: `/project/${p.id}`,
      });
    }

    if (!signals.standupsComplete && signals.totalTasks > 0) {
      alerts.push({
        id: `standup-${p.id}`,
        severity: "low",
        category: "standup",
        title: `No recent standup — ${p.name}`,
        description: "Team activity signal is stale",
        projectId: p.id,
        projectName: p.name,
        href: `/project/${p.id}/standups`,
      });
    }
  }

  return alerts
    .sort((a, b) => sevRank(a.severity) - sevRank(b.severity))
    .slice(0, limit);
}
