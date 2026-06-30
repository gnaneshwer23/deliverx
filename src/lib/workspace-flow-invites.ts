import type { PersonaHomeRole } from "@/config/role-home-routing";
import type { InviteRoleRow } from "@/components/workspace-flow/pm-role-invite-section";
import { listActiveProjectInviteLinks } from "@/services/inviteTokenService";
import { listProjectWorkspaceMembers } from "@/services/workspaceMemberService";

const INVITE_ROLE_CONFIG: Array<{ role: PersonaHomeRole; description: string }> = [
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

  return INVITE_ROLE_CONFIG.map(({ role, description }) => {
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
