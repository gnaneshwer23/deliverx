/**
 * T7 Organisation structure — departments, teams, membership.
 * Shared org data retrieved at request time. Never writes capability or evidence.
 * Team Copilot / Professional Workspace consume this — not a third SKU SoT.
 */

export type OrgMemberRole = "member" | "lead";

export type Department = {
  id: string;
  organisationId: string;
  name: string;
  description: string;
  parentDepartmentId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Team = {
  id: string;
  organisationId: string;
  departmentId: string | null;
  name: string;
  description: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentMember = {
  id: string;
  organisationId: string;
  departmentId: string;
  userId: string;
  memberRole: OrgMemberRole;
  createdAt: string;
};

export type TeamMember = {
  id: string;
  organisationId: string;
  teamId: string;
  userId: string;
  memberRole: OrgMemberRole;
  createdAt: string;
};

export type OrgStructureSnapshot = {
  departments: Department[];
  teams: Team[];
  departmentMembers: DepartmentMember[];
  teamMembers: TeamMember[];
  /** Explicit: org structure never assigns capability */
  capabilityAssigned: false;
};

export function mapDepartment(row: Record<string, unknown>): Department {
  return {
    id: String(row.id),
    organisationId: String(row.organisation_id),
    name: String(row.name),
    description: String(row.description ?? ""),
    parentDepartmentId: (row.parent_department_id as string | null) ?? null,
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapTeam(row: Record<string, unknown>): Team {
  return {
    id: String(row.id),
    organisationId: String(row.organisation_id),
    departmentId: (row.department_id as string | null) ?? null,
    name: String(row.name),
    description: String(row.description ?? ""),
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapDepartmentMember(row: Record<string, unknown>): DepartmentMember {
  return {
    id: String(row.id),
    organisationId: String(row.organisation_id),
    departmentId: String(row.department_id),
    userId: String(row.user_id),
    memberRole: (row.member_role as OrgMemberRole) ?? "member",
    createdAt: String(row.created_at),
  };
}

export function mapTeamMember(row: Record<string, unknown>): TeamMember {
  return {
    id: String(row.id),
    organisationId: String(row.organisation_id),
    teamId: String(row.team_id),
    userId: String(row.user_id),
    memberRole: (row.member_role as OrgMemberRole) ?? "member",
    createdAt: String(row.created_at),
  };
}

/** Validate create/update name — never invent capability. */
export function normalizeOrgUnitName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.trim();
  if (name.length < 1 || name.length > 120) return null;
  return name;
}

export function normalizeMemberRole(raw: unknown): OrgMemberRole {
  return raw === "lead" ? "lead" : "member";
}
