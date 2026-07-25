/**
 * T7 — Legacy delivery/mission-control nav demotion.
 * Professional Workspace modules remain the primary IA.
 * Opt-in only: NEXT_PUBLIC_DELIVERX_LEGACY_WORKSPACE_NAV=1 restores pre-T7 sections
 * (client-visible; requires rebuild). Server-only DELIVERX_LEGACY_WORKSPACE_NAV also accepted.
 */

export type LegacyNavEnv = {
  DELIVERX_LEGACY_WORKSPACE_NAV?: string;
  NEXT_PUBLIC_DELIVERX_LEGACY_WORKSPACE_NAV?: string;
};

function truthyFlag(raw: string | undefined): boolean {
  const v = (raw ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "on";
}

/** Default false — demote Mission Control / Ecosystem / marketplace depth. */
export function isLegacyWorkspaceNavEnabled(
  env: LegacyNavEnv = process.env as LegacyNavEnv,
): boolean {
  return (
    truthyFlag(env.NEXT_PUBLIC_DELIVERX_LEGACY_WORKSPACE_NAV) ||
    truthyFlag(env.DELIVERX_LEGACY_WORKSPACE_NAV)
  );
}

/** Sections demoted under T7 (still routable if bookmarked; not in default nav). */
export const DEMOTED_LEGACY_NAV_SECTION_LABELS = [
  "Core",
  "Delivery",
  "Intelligence",
  "Ecosystem",
  "Governance",
] as const;

export const T7_WORKSPACE_FOUNDATION = {
  primaryIa: "professional-workspace" as const,
  teamCopilotIsThirdSku: false,
  marketplaceInNav: false,
  missionControlInNav: false,
  messagesTable: false,
} as const;
