/**
 * B7 rollout flag. Global search + help chrome ships enabled.
 * Kill-switch: set DELIVERX_GLOBAL_SEARCH=off (or 0/false/disabled) to hide
 * shell search/help and reject the search API with no redeploy and no data change.
 */

export type GlobalSearchEnv = {
  DELIVERX_GLOBAL_SEARCH?: string;
  [key: string]: string | undefined;
};

export function isGlobalSearchEnabled(
  env: GlobalSearchEnv = process.env as GlobalSearchEnv,
): boolean {
  const value = (env.DELIVERX_GLOBAL_SEARCH ?? "").trim().toLowerCase();
  if (value === "off" || value === "0" || value === "false" || value === "disabled") {
    return false;
  }
  return true;
}
