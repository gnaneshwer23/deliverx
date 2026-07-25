/**
 * Minimal PI access gate — env allowlist + per-surface check.
 * Not a feature-flag platform. Empty allowlist = open (dev default).
 */

export type PiSurface =
  | "profile"
  | "evidence"
  | "capability_run"
  | "experience"
  | "career"
  | "portfolio"
  | "baseline"
  | "workspace_observation"
  | "final_assessment"
  | "learning"
  | "privacy";

export type GateDecision =
  | { allowed: true }
  | { allowed: false; reason: string };

export type GateEnv = {
  DELIVERX_PI_ALLOWLIST?: string;
  DELIVERX_PI_SURFACES?: string;
  DELIVERX_PI_GATE?: string;
};

function parseAllowlist(raw: string | undefined): Set<string> {
  if (!raw?.trim()) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** Surfaces that the gate can restrict independently via DELIVERX_PI_SURFACES. */
function parseSurfaceAllowlist(raw: string | undefined): Set<string> | null {
  if (!raw?.trim()) return null;
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Check whether a user may reach a PI surface.
 *
 * Env:
 * - DELIVERX_PI_ALLOWLIST — comma-separated emails or user ids; empty = open
 * - DELIVERX_PI_SURFACES — comma-separated surfaces; empty = all surfaces
 * - DELIVERX_PI_GATE=off — force open even if allowlist is set
 */
export function assertPiAccess(input: {
  userId: string;
  email?: string | null;
  surface: PiSurface;
  env?: GateEnv;
}): GateDecision {
  const env = input.env ?? (process.env as GateEnv);

  if ((env.DELIVERX_PI_GATE ?? "").toLowerCase() === "off") {
    return { allowed: true };
  }

  const surfaces = parseSurfaceAllowlist(env.DELIVERX_PI_SURFACES);
  if (surfaces && !surfaces.has(input.surface)) {
    return {
      allowed: false,
      reason: `Surface "${input.surface}" is not enabled for this pilot.`,
    };
  }

  const allowlist = parseAllowlist(env.DELIVERX_PI_ALLOWLIST);
  if (allowlist.size === 0) {
    return { allowed: true };
  }

  const email = (input.email ?? "").trim().toLowerCase();
  const userId = input.userId.trim().toLowerCase();
  if (allowlist.has(email) || allowlist.has(userId)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: "Your account is not on the Professional Intelligence pilot allowlist.",
  };
}
