/**
 * Capability Coverage Map kill-switch. Ships default ON as an additive,
 * read-only Profile section. Set DELIVERX_CAPABILITY_COVERAGE=off
 * (or 0/false/disabled) to hide it with no redeploy and no data change.
 */

export type CapabilityCoverageEnv = {
  DELIVERX_CAPABILITY_COVERAGE?: string;
  [key: string]: string | undefined;
};

export function isCapabilityCoverageEnabled(
  env: CapabilityCoverageEnv = process.env as CapabilityCoverageEnv,
): boolean {
  const value = (env.DELIVERX_CAPABILITY_COVERAGE ?? "").trim().toLowerCase();
  if (value === "off" || value === "0" || value === "false" || value === "disabled") {
    return false;
  }
  return true;
}
