/**
 * B9 PI API rate-limit kill-switch + thresholds.
 *
 * Defaults ON so pilot abuse resistance is active without a Vercel env flip.
 * Set DELIVERX_PI_RATE_LIMIT=off (or 0/false/disabled) to bypass with no redeploy.
 * Thresholds: DELIVERX_PI_RATE_LIMIT_MAX (default 90), DELIVERX_PI_RATE_LIMIT_WINDOW_MS (default 60000).
 * Limits are sized for legitimate pilot flows (assessment, capability run, search) —
 * ~90 authenticated requests per minute per user, well above human UI pace.
 */

export type PiRateLimitEnv = {
  DELIVERX_PI_RATE_LIMIT?: string;
  DELIVERX_PI_RATE_LIMIT_MAX?: string;
  DELIVERX_PI_RATE_LIMIT_WINDOW_MS?: string;
  [key: string]: string | undefined;
};

export const DEFAULT_PI_RATE_LIMIT = {
  maxRequests: 90,
  windowMs: 60_000,
} as const;

export function isPiRateLimitEnabled(
  env: PiRateLimitEnv = process.env as PiRateLimitEnv,
): boolean {
  const value = (env.DELIVERX_PI_RATE_LIMIT ?? "").trim().toLowerCase();
  if (value === "off" || value === "0" || value === "false" || value === "disabled") {
    return false;
  }
  return true;
}

export function resolvePiRateLimitThresholds(
  env: PiRateLimitEnv = process.env as PiRateLimitEnv,
): { maxRequests: number; windowMs: number } {
  const maxRaw = Number.parseInt(env.DELIVERX_PI_RATE_LIMIT_MAX ?? "", 10);
  const windowRaw = Number.parseInt(env.DELIVERX_PI_RATE_LIMIT_WINDOW_MS ?? "", 10);
  return {
    maxRequests:
      Number.isFinite(maxRaw) && maxRaw > 0
        ? Math.min(maxRaw, 10_000)
        : DEFAULT_PI_RATE_LIMIT.maxRequests,
    windowMs:
      Number.isFinite(windowRaw) && windowRaw >= 1_000
        ? Math.min(windowRaw, 3_600_000)
        : DEFAULT_PI_RATE_LIMIT.windowMs,
  };
}
