/**
 * Contextual Home kill-switch.
 * Ships default ON. Set DELIVERX_CONTEXTUAL_HOME=off (or 0/false/disabled)
 * to hide Daily Briefing and restore prior Profile layout without redeploy.
 */

export type ContextualHomeEnv = {
  DELIVERX_CONTEXTUAL_HOME?: string;
  [key: string]: string | undefined;
};

export function isContextualHomeEnabled(
  env: ContextualHomeEnv = process.env as ContextualHomeEnv,
): boolean {
  const value = (env.DELIVERX_CONTEXTUAL_HOME ?? "").trim().toLowerCase();
  if (value === "off" || value === "0" || value === "false" || value === "disabled") {
    return false;
  }
  return true;
}
