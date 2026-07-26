import type { Metadata } from "next";
import { requireCompleteOnboarding } from "@/lib/auth/require-onboarding";
import { createClient } from "@/lib/supabase/server";
import {
  listWorkspaceProjects,
  resolveActiveProject,
} from "@/lib/professional-workspace/list-projects";
import { parseWorkspaceProjectParam } from "@/lib/professional-workspace/project-context";
import { getWorkspaceObservationConsent } from "@/lib/workspace-observation/consent";
import { loadOrgStructure } from "@/lib/org-structure";
import { listOrgMeetingsRecent } from "@/services/governance";
import {
  WorkspaceHome,
  type WorkspaceHomeMeeting,
  type WorkspaceHomeTeamSummary,
} from "@/components/professional-workspace/workspace-home";

export const metadata: Metadata = {
  title: "Professional Workspace · DeliverX",
  description:
    "Multidisciplinary work with AI teammates — understand projects, meet, decide, and generate observable evidence.",
};

export const dynamic = "force-dynamic";

export default async function ProfessionalWorkspaceHome({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { user, profile } = await requireCompleteOnboarding();
  const supabase = await createClient();
  const params = await searchParams;
  const parsed = parseWorkspaceProjectParam(params.project ?? null);

  const projects = await listWorkspaceProjects(supabase, user.id);
  const active = resolveActiveProject(
    projects,
    parsed?.kind ?? null,
    parsed?.id ?? null,
  );

  const contextErrors: string[] = [];

  let observationAllowed = false;
  try {
    const consent = await getWorkspaceObservationConsent(supabase, user.id, active);
    observationAllowed = consent.allowed;
  } catch (err) {
    contextErrors.push(
      err instanceof Error ? err.message : "Could not load observation consent.",
    );
  }

  let teamSummary: WorkspaceHomeTeamSummary | null = null;
  if (profile.organisation_id) {
    try {
      const structure = await loadOrgStructure(supabase, profile.organisation_id);
      teamSummary = {
        departmentCount: structure.departments.length,
        teamCount: structure.teams.length,
        memberCount: structure.departmentMembers.length + structure.teamMembers.length,
      };
    } catch {
      teamSummary = null;
      contextErrors.push("Organisation structure unavailable.");
    }
  }

  let meetings: WorkspaceHomeMeeting[] = [];
  try {
    const recent = await listOrgMeetingsRecent(4);
    meetings = recent.map((m) => ({
      id: m.id,
      title: m.title,
      projectId: m.project_id,
      projectName: m.project_name,
      scheduledAt: m.scheduled_at,
      status: m.status,
    }));
  } catch {
    meetings = [];
  }

  return (
    <WorkspaceHome
      projects={projects}
      active={active}
      observationAllowed={observationAllowed}
      teamSummary={teamSummary}
      meetings={meetings}
      loadError={contextErrors[0] ?? null}
    />
  );
}
