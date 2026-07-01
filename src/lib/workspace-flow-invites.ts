import type { PersonaHomeRole } from "@/config/role-home-routing";
import type { InviteRoleRow } from "@/components/workspace-flow/pm-role-invite-section";
import { listActiveProjectInviteLinks } from "@/services/inviteTokenService";
import { listProjectWorkspaceMembers } from "@/services/workspaceMemberService";

export const PM_INVITE_ROLE_CONFIG: Array<{ role: PersonaHomeRole; description: string }> = [
  { role: "ba", description: "Requirements, traceability, and clarification queue" },
  { role: "engineer", description: "Implementation tasks and delivery execution" },
  { role: "qa", description: "Test coverage, defects, and UAT readiness" },
  { role: "product_manager", description: "Backlog prioritisation and roadmap alignment" },
  { role: "scrum_master", description: "Sprint cadence and team coordination" },
  {
    role: "executive",
    description: "Read-only sponsor visibility — portfolio and delivery oversight",
  },
];

export async function buildPmInviteRoleRows(projectId: string): Promise<InviteRoleRow[]> {
  const [members, activeLinks] = await Promise.all([
    listProjectWorkspaceMembers(projectId).catch(() => []),
    listActiveProjectInviteLinks(projectId).catch(() => []),
  ]);

  const linkByRole = new Map(activeLinks.map((link) => [link.role, link]));

  return PM_INVITE_ROLE_CONFIG.map(({ role, description }) => {
    const member = members.find((m) => m.role === role);
    const link = linkByRole.get(role);
    return {
      role,
      description,
      member: member
        ? { name: member.user_name, joinedAt: member.joined_at }
        : null,
      joinUrl: link?.joinUrl ?? null,
      inviteActive: Boolean(link),
      inviteId: link?.inviteId ?? null,
      expiresAt: link?.expiresAt ?? null,
    };
  });
}

export type PmInviteRoleSummary = {
  totalRoles: number;
  joinedCount: number;
  unjoinedCount: number;
  activeLinkCount: number;
  needsLinkCount: number;
};

export function summarizePmInviteRoleRows(rows: InviteRoleRow[]): PmInviteRoleSummary {
  const joinedCount = rows.filter((row) => row.member).length;
  const unjoinedCount = rows.length - joinedCount;
  const activeLinkCount = rows.filter((row) => !row.member && row.joinUrl).length;
  const needsLinkCount = rows.filter((row) => !row.member && !row.joinUrl).length;
  return {
    totalRoles: rows.length,
    joinedCount,
    unjoinedCount,
    activeLinkCount,
    needsLinkCount,
  };
}

export function rolesNeedingInviteLinks(rows: InviteRoleRow[]): PersonaHomeRole[] {
  return rows.filter((row) => !row.member && !row.joinUrl).map((row) => row.role);
}

export function shouldElevatePmInviteSection(
  rows: InviteRoleRow[] | null | undefined,
  teamInvitesPending: number,
): boolean {
  if (teamInvitesPending > 0) return true;
  if (!rows?.length) return false;
  return rows.some((row) => !row.member);
}

export function pmRoleInvitesAnchor(projectId: string): string {
  return `/workspace/pm-mission?project=${projectId}#pm-role-invites`;
}
