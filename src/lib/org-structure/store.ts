import type { SupabaseClient } from "@supabase/supabase-js";
import { isOrgAdmin } from "@/lib/org-admin";
import {
  mapDepartment,
  mapDepartmentMember,
  mapTeam,
  mapTeamMember,
  normalizeMemberRole,
  normalizeOrgUnitName,
  type Department,
  type DepartmentMember,
  type OrgStructureSnapshot,
  type Team,
  type TeamMember,
} from "@/lib/org-structure/types";

type Db = SupabaseClient;

export type OrgActor = {
  userId: string;
  organisationId: string;
  role: string | null;
};

export async function resolveOrgActor(
  supabase: Db,
  userId: string,
): Promise<OrgActor | null> {
  const { data, error } = await supabase
    .from("users")
    .select("organisation_id, role")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data?.organisation_id) return null;
  return {
    userId,
    organisationId: data.organisation_id as string,
    role: (data.role as string | null) ?? null,
  };
}

export function assertOrgAdmin(actor: OrgActor): void {
  if (!isOrgAdmin(actor.role)) {
    throw new OrgStructureError("Organisation admin access required", 403);
  }
}

export class OrgStructureError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = "OrgStructureError";
  }
}

/** Hard rule: org structure never writes capability or verified evidence. */
export const ORG_STRUCTURE_INVARIANTS = {
  capabilityAssigned: false as const,
  writesEvidence: false as const,
  writesScoreRuns: false as const,
  thirdSku: false as const,
} as const;

export async function loadOrgStructure(
  supabase: Db,
  organisationId: string,
): Promise<OrgStructureSnapshot> {
  const [departmentsRes, teamsRes, deptMembersRes, teamMembersRes] = await Promise.all([
    supabase
      .from("departments")
      .select("*")
      .eq("organisation_id", organisationId)
      .order("name"),
    supabase
      .from("teams")
      .select("*")
      .eq("organisation_id", organisationId)
      .order("name"),
    supabase
      .from("department_members")
      .select("*")
      .eq("organisation_id", organisationId),
    supabase
      .from("team_members")
      .select("*")
      .eq("organisation_id", organisationId),
  ]);

  if (departmentsRes.error) throw new OrgStructureError(departmentsRes.error.message, 500);
  if (teamsRes.error) throw new OrgStructureError(teamsRes.error.message, 500);
  if (deptMembersRes.error) throw new OrgStructureError(deptMembersRes.error.message, 500);
  if (teamMembersRes.error) throw new OrgStructureError(teamMembersRes.error.message, 500);

  return {
    departments: (departmentsRes.data ?? []).map((r) =>
      mapDepartment(r as Record<string, unknown>),
    ),
    teams: (teamsRes.data ?? []).map((r) => mapTeam(r as Record<string, unknown>)),
    departmentMembers: (deptMembersRes.data ?? []).map((r) =>
      mapDepartmentMember(r as Record<string, unknown>),
    ),
    teamMembers: (teamMembersRes.data ?? []).map((r) =>
      mapTeamMember(r as Record<string, unknown>),
    ),
    capabilityAssigned: false,
  };
}

export async function createDepartment(
  supabase: Db,
  actor: OrgActor,
  input: { name: unknown; description?: unknown; parentDepartmentId?: unknown },
): Promise<Department> {
  assertOrgAdmin(actor);
  const name = normalizeOrgUnitName(input.name);
  if (!name) throw new OrgStructureError("name required (1–120 chars)");
  const description =
    typeof input.description === "string" ? input.description.trim().slice(0, 2000) : "";
  const parentDepartmentId =
    typeof input.parentDepartmentId === "string" && input.parentDepartmentId.length > 0
      ? input.parentDepartmentId
      : null;

  const { data, error } = await supabase
    .from("departments")
    .insert({
      organisation_id: actor.organisationId,
      name,
      description,
      parent_department_id: parentDepartmentId,
      created_by: actor.userId,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new OrgStructureError(error?.message ?? "Could not create department", 400);
  }
  return mapDepartment(data as Record<string, unknown>);
}

export async function createTeam(
  supabase: Db,
  actor: OrgActor,
  input: { name: unknown; description?: unknown; departmentId?: unknown },
): Promise<Team> {
  assertOrgAdmin(actor);
  const name = normalizeOrgUnitName(input.name);
  if (!name) throw new OrgStructureError("name required (1–120 chars)");
  const description =
    typeof input.description === "string" ? input.description.trim().slice(0, 2000) : "";
  const departmentId =
    typeof input.departmentId === "string" && input.departmentId.length > 0
      ? input.departmentId
      : null;

  const { data, error } = await supabase
    .from("teams")
    .insert({
      organisation_id: actor.organisationId,
      name,
      description,
      department_id: departmentId,
      created_by: actor.userId,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new OrgStructureError(error?.message ?? "Could not create team", 400);
  }
  return mapTeam(data as Record<string, unknown>);
}

export async function addDepartmentMember(
  supabase: Db,
  actor: OrgActor,
  input: { departmentId: unknown; userId: unknown; memberRole?: unknown },
): Promise<DepartmentMember> {
  assertOrgAdmin(actor);
  const departmentId = typeof input.departmentId === "string" ? input.departmentId : "";
  const userId = typeof input.userId === "string" ? input.userId : "";
  if (!departmentId || !userId) {
    throw new OrgStructureError("departmentId and userId required");
  }

  const { data, error } = await supabase
    .from("department_members")
    .insert({
      organisation_id: actor.organisationId,
      department_id: departmentId,
      user_id: userId,
      member_role: normalizeMemberRole(input.memberRole),
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new OrgStructureError(error?.message ?? "Could not add department member", 400);
  }
  return mapDepartmentMember(data as Record<string, unknown>);
}

export async function addTeamMember(
  supabase: Db,
  actor: OrgActor,
  input: { teamId: unknown; userId: unknown; memberRole?: unknown },
): Promise<TeamMember> {
  assertOrgAdmin(actor);
  const teamId = typeof input.teamId === "string" ? input.teamId : "";
  const userId = typeof input.userId === "string" ? input.userId : "";
  if (!teamId || !userId) {
    throw new OrgStructureError("teamId and userId required");
  }

  const { data, error } = await supabase
    .from("team_members")
    .insert({
      organisation_id: actor.organisationId,
      team_id: teamId,
      user_id: userId,
      member_role: normalizeMemberRole(input.memberRole),
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new OrgStructureError(error?.message ?? "Could not add team member", 400);
  }
  return mapTeamMember(data as Record<string, unknown>);
}
