import type { UserRole } from "@/services/dashboard";
import {
  workspaceCoreNav,
  type WorkspaceNavItem,
} from "@/config/workspace-nav";

export const MISSION_CONTROL_IDS = new Set([
  "ba",
  "product",
  "pm-mission",
  "founder",
  "engineer",
  "scrum",
  "qa",
]);

export type MissionPersonaId =
  | "ba"
  | "product"
  | "pm-mission"
  | "founder"
  | "engineer"
  | "scrum"
  | "qa";

export const ROLE_TO_MISSION_ID: Record<string, MissionPersonaId> = {
  ba: "ba",
  product_manager: "product",
  pm: "pm-mission",
  executive: "founder",
  engineer: "engineer",
  team_member: "engineer",
  scrum_master: "scrum",
  qa: "qa",
};

export function roleToMissionPersona(role: string | null | undefined): MissionPersonaId | null {
  if (!role) return null;
  return ROLE_TO_MISSION_ID[role] ?? null;
}

export function roleToMissionPersonaFromUserRole(
  role: UserRole | string | null | undefined,
): MissionPersonaId | null {
  return roleToMissionPersona(role ?? null);
}

export type PartitionedCoreNav = {
  fixedCore: WorkspaceNavItem[];
  primaryMission: WorkspaceNavItem | null;
  otherMissions: WorkspaceNavItem[];
};

export function partitionCoreNav(userRole: string | null | undefined): PartitionedCoreNav {
  const fixedCore = workspaceCoreNav.filter((item) => !MISSION_CONTROL_IDS.has(item.id));
  const missionItems = workspaceCoreNav.filter((item) => MISSION_CONTROL_IDS.has(item.id));
  const primaryId = roleToMissionPersona(userRole);

  if (!primaryId) {
    return { fixedCore, primaryMission: null, otherMissions: missionItems };
  }

  const primaryMission = missionItems.find((item) => item.id === primaryId) ?? null;
  const otherMissions = missionItems.filter((item) => item.id !== primaryId);
  return { fixedCore, primaryMission, otherMissions };
}
