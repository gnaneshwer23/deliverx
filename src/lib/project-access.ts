import { createClient } from "@/lib/supabase/server";
import { getWorkspaceMember } from "@/services/workspaceMemberService";
import type { InviteViewMode } from "@/services/inviteTokenService";

export { READ_ONLY_PROJECT_SEGMENTS } from "@/config/project-nav";
export {
  isReadOnlyProjectSegment,
  projectSegmentFromPathname,
} from "@/lib/project-read-only-nav";

export type ProjectAccess = {
  viewMode: InviteViewMode;
  canWrite: boolean;
  role: string | null;
};

export async function getProjectAccess(
  userId: string,
  projectId: string,
): Promise<ProjectAccess> {
  const supabase = await createClient();
  const [{ data: profile }, membership] = await Promise.all([
    supabase.from("users").select("role").eq("id", userId).maybeSingle(),
    getWorkspaceMember(userId, projectId),
  ]);

  const orgRole = (profile?.role as string | null) ?? null;
  const viewMode = (membership?.view_mode as InviteViewMode | undefined) ?? "full";
  const canWrite = orgRole === "pm" || viewMode !== "read_only";

  return {
    viewMode,
    canWrite,
    role: membership?.role ?? orgRole,
  };
}
