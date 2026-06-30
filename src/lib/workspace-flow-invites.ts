import { createClient } from "@/lib/supabase/server";
import type { PersonaHomeRole } from "@/config/role-home-routing";
import type { InviteRoleRow } from "@/components/workspace-flow/pm-role-invite-section";
import { listProjectWorkspaceMembers } from "@/services/workspaceMemberService";

const INVITE_ROLE_CONFIG: Array<{ role: PersonaHomeRole; description: string }> = [
  { role: "ba", description: "Requirements, traceability, and clarification queue" },
  { role: "engineer", description: "Implementation tasks and delivery execution" },
  { role: "qa", description: "Test coverage, defects, and UAT readiness" },
  { role: "product_manager", description: "Backlog prioritisation and roadmap alignment" },
  { role: "scrum_master", description: "Sprint cadence and team coordination" },
];

async function findActiveInvitesByRole(projectId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("invite_tokens")
    .select("role, expires_at, revoked_at")
    .eq("project_id", projectId)
    .is("revoked_at", null)
    .gt("expires_at", now);

  const active = new Set<string>();
  for (const row of data ?? []) {
    active.add(row.role as string);
  }
  return active;
}

export async function buildPmInviteRoleRows(projectId: string): Promise<InviteRoleRow[]> {
  const [members, activeInvites] = await Promise.all([
    listProjectWorkspaceMembers(projectId).catch(() => []),
    findActiveInvitesByRole(projectId),
  ]);

  return INVITE_ROLE_CONFIG.map(({ role, description }) => {
    const member = members.find((m) => m.role === role);
    return {
      role,
      description,
      member: member
        ? { name: member.user_name, joinedAt: member.joined_at }
        : null,
      joinUrl: null,
      inviteActive: activeInvites.has(role),
    };
  });
}
