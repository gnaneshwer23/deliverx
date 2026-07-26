/**
 * Map Postgres consent-guard failures to the observation deny reason.
 * Matches migration 0096 trigger messages (errcode 42501).
 */

export function isObservationConsentDbError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message = String(
    (error as { message?: unknown }).message ??
      (error as { error_description?: unknown }).error_description ??
      "",
  ).toLowerCase();
  const code = String((error as { code?: unknown }).code ?? "");
  return (
    message.includes("observation consent required") ||
    (code === "42501" && message.includes("consent"))
  );
}
