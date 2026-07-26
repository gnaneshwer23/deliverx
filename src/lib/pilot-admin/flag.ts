/**
 * B8 rollout flag. Thin pilot admin ships enabled for org admins.
 * Kill-switch: set DELIVERX_PILOT_ADMIN=off (or 0/false/disabled) to hide
 * the admin surface and reject config APIs with no redeploy and no data change.
 * Role gate (pm | executive) still applies when the flag is on.
 */

export type PilotAdminEnv = {
  DELIVERX_PILOT_ADMIN?: string;
  [key: string]: string | undefined;
};

export function isPilotAdminEnabled(
  env: PilotAdminEnv = process.env as PilotAdminEnv,
): boolean {
  const value = (env.DELIVERX_PILOT_ADMIN ?? "").trim().toLowerCase();
  if (value === "off" || value === "0" || value === "false" || value === "disabled") {
    return false;
  }
  return true;
}
