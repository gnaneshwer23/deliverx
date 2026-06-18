/**
 * Collaborative loop — DB façade for universal mission dashboard panels.
 */

import { createClient } from "@/lib/supabase/server";
import { getRequirementStats } from "./baRequirements";
import {
  buildCollaborativeLoopSnapshot,
  type CollaborativeLoopSnapshot,
  type CollaborativePersona,
} from "./collaborativeLoopEngine";
import { listOrgTasks } from "./delivery";
import { getOrgGovernanceStats, listDecisions, listRaidItems } from "./governance";
import { listProjectsForOrg } from "./portfolio";
import { countPendingProposals } from "./proposedActions";

async function resolveProjectId(projectId?: string | null): Promise<string | null> {
  if (projectId) return projectId;
  const projects = await listProjectsForOrg().catch(() => []);
  const active = projects.filter((p) => p.status === "active");
  return active[0]?.id ?? projects[0]?.id ?? null;
}

export async function getCollaborativeLoopSnapshot(
  persona: CollaborativePersona,
  projectId?: string | null,
): Promise<CollaborativeLoopSnapshot> {
  const resolvedProjectId = await resolveProjectId(projectId);

  const [governance, pendingProposals, orgTasks] = await Promise.all([
    getOrgGovernanceStats().catch(() => ({
      openRisks: 0,
      openIssues: 0,
      pendingDecisions: 0,
      openChanges: 0,
    })),
    countPendingProposals().catch(() => 0),
    listOrgTasks({ limit: 200, projectId: resolvedProjectId ?? undefined }).catch(() => []),
  ]);

  let openClarifications = 0;
  let clarifications: Array<{ id: string; question: string; stakeholderRole: string | null }> = [];
  let requirementsApproved = 0;
  let requirementsTotal = 0;
  let storiesReady = 0;
  let pendingDecisions: Array<{ id: string; title: string; projectId: string }> = [];
  let criticalRisks: Array<{ id: string; title: string }> = [];
  let criticalDefects = 0;

  const blockedTasks = orgTasks.filter(
    (t) => t.status === "blocked" && (!resolvedProjectId || t.project_id === resolvedProjectId),
  ).length;

  if (resolvedProjectId) {
    const [reqStats, decisions, raid] = await Promise.all([
      getRequirementStats(resolvedProjectId).catch(() => null),
      listDecisions(resolvedProjectId).catch(() => []),
      listRaidItems(resolvedProjectId).catch(() => []),
    ]);

    if (reqStats) {
      openClarifications = reqStats.openClarifications;
      clarifications = reqStats.clarifications.map((c) => ({
        id: c.id,
        question: c.question,
        stakeholderRole: c.stakeholder_role,
      }));
      requirementsApproved = reqStats.approved;
      requirementsTotal = reqStats.extracted;
      storiesReady = reqStats.storiesReady;
    }

    pendingDecisions = decisions
      .filter((d) => d.status === "proposed")
      .map((d) => ({ id: d.id, title: d.title, projectId: resolvedProjectId }));

    criticalRisks = raid
      .filter((r) => r.type === "risk" && (r.severity === "critical" || r.severity === "high"))
      .map((r) => ({ id: r.id, title: r.title }));

    criticalDefects = raid.filter(
      (r) =>
        r.type === "issue" &&
        r.status === "open" &&
        (r.severity === "critical" || r.severity === "high"),
    ).length;
  }

  if (pendingDecisions.length === 0 && governance.pendingDecisions > 0) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("decisions")
      .select("id, title, project_id, status")
      .eq("status", "proposed")
      .order("created_at", { ascending: false })
      .limit(5);

    pendingDecisions = (data ?? []).map((d) => ({
      id: String(d.id),
      title: String(d.title),
      projectId: String(d.project_id),
    }));
  }

  return buildCollaborativeLoopSnapshot({
    persona,
    governance,
    blockedTasks,
    openClarifications,
    pendingProposals,
    criticalDefects,
    clarifications,
    pendingDecisions,
    criticalRisks,
    requirementsApproved,
    requirementsTotal,
    storiesReady,
  });
}
