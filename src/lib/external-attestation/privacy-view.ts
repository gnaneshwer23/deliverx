/**
 * Least-privilege attestor payload — strip confidential / private evidence.
 */

import type { PortfolioEntry } from "@/lib/verified-portfolio/types";
import type { AttestorView } from "@/lib/external-attestation/types";

const PURPOSE_NOTICE =
  "You are confirming or disputing one specific professional claim shared with your consent. DeliverX collects only your display name, relationship, optional organisation, and statement for this attestation. Attestor details are not shown on the public portfolio. This is not employment verification and does not assign a capability score.";

export function buildAttestorView(input: {
  requestId: string;
  status: AttestorView["status"];
  claimLabel: string;
  claimSummary: string;
  claimField: string;
  entry: Pick<PortfolioEntry, "title" | "targetRole" | "hiddenFields">;
  relationshipHint: string | null;
  expiresAt: string | null;
  alreadyDecided: boolean;
}): AttestorView {
  // Never surface hidden narrative fields to the attestor form.
  const summary =
    input.claimSummary.trim() ||
    `Confirm the claim “${input.claimLabel}” for portfolio entry “${input.entry.title}”.`;

  return {
    requestId: input.requestId,
    status: input.status,
    claimLabel: input.claimLabel,
    claimSummary: summary.slice(0, 800),
    claimField: input.claimField,
    entryTitle: input.entry.title,
    targetRole: input.entry.targetRole,
    relationshipHint: input.relationshipHint,
    expiresAt: input.expiresAt,
    alreadyDecided: input.alreadyDecided,
    purposeNotice: PURPOSE_NOTICE,
    capabilityLevelsShown: false,
  };
}

/** Public share views must never include attestor PII. */
export function stripAttestorPiiFromPublicView<T extends Record<string, unknown>>(
  view: T,
): T {
  const next = { ...view };
  for (const key of [
    "attestorDisplayName",
    "attestorEmail",
    "attestorOrganisation",
    "attestorStatement",
  ]) {
    if (key in next) delete next[key];
  }
  return next;
}
