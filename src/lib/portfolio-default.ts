/**
 * R7 — Default portfolio naming for silent auto-create.
 */

export const FALLBACK_PORTFOLIO_NAME = "Default portfolio";

/** Derive a portfolio name from org name, or use the fallback. */
export function defaultPortfolioName(orgName: string | null | undefined): string {
  const trimmed = orgName?.trim();
  if (!trimmed) return FALLBACK_PORTFOLIO_NAME;
  return trimmed;
}
