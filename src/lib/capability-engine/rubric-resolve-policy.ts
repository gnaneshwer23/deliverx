/**
 * T2 rubric coherence policy — DB `pi_cf_*` is SoT; in-code is labelled fallback only.
 *
 * Env:
 * - `DELIVERX_RUBRIC_ALLOW_IN_CODE_FALLBACK=1` — allow labelled in-code fallback (rollback / emergency)
 * - `DELIVERX_RUBRIC_REQUIRE_DB=1` — fail closed when published graph cannot resolve
 *
 * Default: allow labelled fallback (measurable) so pilot / unit tests keep working;
 * set REQUIRE_DB in production when the published pm-core graph is confirmed present.
 */

export type RubricResolveSource = "db" | "in_code_fallback";

export type RubricResolveEnv = {
  DELIVERX_RUBRIC_ALLOW_IN_CODE_FALLBACK?: string;
  DELIVERX_RUBRIC_REQUIRE_DB?: string;
};

function truthy(value: string | undefined): boolean {
  const v = (value ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

/** When true, missing/thin DB graph throws instead of falling back. */
export function isRubricDbRequired(
  env: RubricResolveEnv = process.env as RubricResolveEnv,
): boolean {
  return truthy(env.DELIVERX_RUBRIC_REQUIRE_DB);
}

/**
 * In-code fallback is allowed unless REQUIRE_DB is set.
 * Explicit ALLOW_IN_CODE_FALLBACK=0 with REQUIRE_DB unset still allows fallback
 * (labelled); use REQUIRE_DB to fail closed.
 */
export function isInCodeFallbackAllowed(
  env: RubricResolveEnv = process.env as RubricResolveEnv,
): boolean {
  if (isRubricDbRequired(env)) return false;
  const allow = env.DELIVERX_RUBRIC_ALLOW_IN_CODE_FALLBACK;
  if (allow === undefined || allow === "") return true;
  return truthy(allow);
}

export type RubricFallbackEvent = {
  frameworkSlug: string;
  version: string;
  reason:
    | "no_published_pin"
    | "thin_or_unreadable_graph"
    | "load_error"
    | "catalog_missing"
    | "catalog_thin";
  frameworkVersionId?: string | null;
};

/** Process-local counter for observability / tests (reset in unit tests). */
let fallbackCount = 0;

export function getRubricFallbackCount(): number {
  return fallbackCount;
}

export function resetRubricFallbackCount(): void {
  fallbackCount = 0;
}

/**
 * Loud label for in-code fallback. Never silent.
 * Keeps a counter so ops can spot elevated fallback rate.
 */
export function logRubricFallback(event: RubricFallbackEvent): void {
  fallbackCount += 1;
  console.warn("[rubric-resolve] in_code_fallback", {
    ...event,
    fallbackCount,
    source: "in_code_fallback" as const,
  });
}

/** Normalise legacy stored `"in_code"` to contract value. */
export function normaliseRubricResolveSource(
  raw: unknown,
): RubricResolveSource {
  if (raw === "db") return "db";
  return "in_code_fallback";
}
