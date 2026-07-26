/**
 * B8 — Thin pilot admin org/project config.
 * Minimum for operating one pilot org/project for Experience context.
 * Not enterprise mission-control, not a third SKU, not marketplace liquidity.
 */

export const PILOT_ADMIN_FRAMEWORK_PIN = "pm-core@2026.1" as const;

/** Hard rails: admin config never rewrites verified evidence or assigns capability. */
export const PILOT_ADMIN_INVARIANTS = {
  writesEvidence: false as const,
  writesScoreRuns: false as const,
  lightsVerified: false as const,
  enterpriseMissionControl: false as const,
  thirdSku: false as const,
  marketplaceLiquidity: false as const,
} as const;

export const PILOT_PROJECT_STATUSES = [
  "draft",
  "active",
  "paused",
  "completed",
  "archived",
] as const;

export type PilotProjectStatus = (typeof PILOT_PROJECT_STATUSES)[number];

export type OrgConfigPatch = {
  name?: string;
  industry?: string | null;
  teamSize?: string | null;
  deliveryType?: string | null;
};

export type ProjectConfigPatch = {
  name?: string;
  goal?: string | null;
  deliveryType?: string | null;
  status?: PilotProjectStatus;
};

export type OrgConfigSnapshot = {
  id: string;
  name: string;
  industry: string | null;
  teamSize: string | null;
  deliveryType: string | null;
};

export type ProjectConfigSnapshot = {
  id: string;
  organisationId: string;
  name: string;
  goal: string | null;
  deliveryType: string | null;
  status: PilotProjectStatus;
  updatedAt: string;
};

export type PilotAdminAuditNote = {
  summary: string;
  rails: string;
};

export const PILOT_ADMIN_AUDIT_NOTE: PilotAdminAuditNote = {
  summary:
    "Organisation and project configuration changes are permissioned and recorded in the organisation audit trail.",
  rails:
    "This surface does not rewrite verified evidence, assign capability, or light Verified. Capability stays with the Capability Engine; Verified requires external attestation.",
};

export function isPilotProjectStatus(value: unknown): value is PilotProjectStatus {
  return (
    typeof value === "string" &&
    (PILOT_PROJECT_STATUSES as readonly string[]).includes(value)
  );
}

export function normalizeOrgConfigPatch(input: {
  name?: unknown;
  industry?: unknown;
  teamSize?: unknown;
  deliveryType?: unknown;
}): OrgConfigPatch {
  const patch: OrgConfigPatch = {};
  if (input.name !== undefined) {
    const name = typeof input.name === "string" ? input.name.trim() : "";
    if (!name || name.length > 200) {
      throw new PilotAdminValidationError("Organisation name required (1–200 chars)");
    }
    patch.name = name;
  }
  if (input.industry !== undefined) {
    patch.industry =
      typeof input.industry === "string" && input.industry.trim()
        ? input.industry.trim().slice(0, 120)
        : null;
  }
  if (input.teamSize !== undefined) {
    patch.teamSize =
      typeof input.teamSize === "string" && input.teamSize.trim()
        ? input.teamSize.trim().slice(0, 60)
        : null;
  }
  if (input.deliveryType !== undefined) {
    patch.deliveryType =
      typeof input.deliveryType === "string" && input.deliveryType.trim()
        ? input.deliveryType.trim().slice(0, 120)
        : null;
  }
  return patch;
}

export function normalizeProjectConfigPatch(input: {
  name?: unknown;
  goal?: unknown;
  deliveryType?: unknown;
  status?: unknown;
}): ProjectConfigPatch {
  const patch: ProjectConfigPatch = {};
  if (input.name !== undefined) {
    const name = typeof input.name === "string" ? input.name.trim() : "";
    if (!name || name.length > 200) {
      throw new PilotAdminValidationError("Project name required (1–200 chars)");
    }
    patch.name = name;
  }
  if (input.goal !== undefined) {
    patch.goal =
      typeof input.goal === "string" && input.goal.trim()
        ? input.goal.trim().slice(0, 2000)
        : null;
  }
  if (input.deliveryType !== undefined) {
    patch.deliveryType =
      typeof input.deliveryType === "string" && input.deliveryType.trim()
        ? input.deliveryType.trim().slice(0, 120)
        : null;
  }
  if (input.status !== undefined) {
    if (!isPilotProjectStatus(input.status)) {
      throw new PilotAdminValidationError(
        `status must be one of: ${PILOT_PROJECT_STATUSES.join(", ")}`,
      );
    }
    patch.status = input.status;
  }
  return patch;
}

export class PilotAdminValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PilotAdminValidationError";
  }
}
