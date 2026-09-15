/**
 * Capability Coverage Map — deterministic, read-only builder.
 *
 * Enumerates every competency in the pinned framework rubric and states an
 * explainable basis for each, reusing the shared SnapshotClaims projection and
 * the B1 confidence-band algorithm. Pure function: no I/O, no capability writes,
 * no Verified lighting.
 */

import {
  CONFIDENCE_BAND_ALGORITHM_VERSION,
  formatCapabilityBandLabel,
  formatConfidenceDisplayLabel,
  mapConfidenceToDisplayBand,
  whyThisCapabilityBand,
} from "@/lib/capability-engine/confidence-bands";
import type { RubricDefinition } from "@/lib/capability-engine/rubric";
import type { SnapshotClaims } from "@/lib/capability-engine/snapshot-claims";
import type {
  CapabilityCoverage,
  CapabilityCoverageRow,
  CoverageBasis,
  SelfReportedClaim,
} from "@/lib/capability-coverage/types";

const HONESTY_NOTE =
  "Basis is read directly from your Evidence Ledger and latest capability assessment. Nothing here assigns capability, and Verified lights only from independent external attestation (T8).";

/** Display titles for the seeded pm-core competencies (mirrors admin-framework seed). */
const COMPETENCY_TITLES: Record<string, string> = {
  "comp.stakeholder_management": "Stakeholder management",
  "comp.delivery_execution": "Delivery execution",
  "comp.product_discovery": "Product discovery",
};

const BASIS_LABELS: Record<CoverageBasis, string> = {
  assessed: "Assessed from evidence",
  insufficient_evidence: "Insufficient evidence to judge",
  not_assessed: "Not assessed yet",
};

function titleForCompetency(competencyId: string): string {
  if (COMPETENCY_TITLES[competencyId]) return COMPETENCY_TITLES[competencyId];
  const leaf = competencyId.includes(".")
    ? competencyId.split(".").pop() ?? competencyId
    : competencyId;
  return leaf
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Unique competencies in a rubric, in first-seen order. */
export function frameworkCompetencies(
  rubric: RubricDefinition,
): Array<{ competencyId: string; title: string }> {
  const seen = new Set<string>();
  const out: Array<{ competencyId: string; title: string }> = [];
  for (const indicator of Object.values(rubric.indicators)) {
    if (seen.has(indicator.competencyId)) continue;
    seen.add(indicator.competencyId);
    out.push({
      competencyId: indicator.competencyId,
      title: titleForCompetency(indicator.competencyId),
    });
  }
  return out;
}

function nextActionFor(basis: CoverageBasis, title: string): string {
  switch (basis) {
    case "assessed":
      return `Strengthen ${title} with more practice evidence, then package it in Launchpad.`;
    case "insufficient_evidence":
      return `Do focused work in Experience that demonstrates ${title}, then re-run assessment.`;
    case "not_assessed":
      return `Record evidence for ${title}, then run a capability assessment to judge it.`;
  }
}

export type BuildCapabilityCoverageInput = {
  rubric: RubricDefinition;
  claims: SnapshotClaims | null;
  selfReportedStrengths?: SelfReportedClaim[];
};

export function buildCapabilityCoverage(
  input: BuildCapabilityCoverageInput,
): CapabilityCoverage {
  const { rubric, claims } = input;
  const competencies = frameworkCompetencies(rubric);

  // Latest judged level per competency (SnapshotClaims already drops
  // insufficient_evidence judgements and pins the framework).
  const levelByCompetency = new Map(
    (claims?.levels ?? []).map((l) => [l.competencyId, l]),
  );

  const rows: CapabilityCoverageRow[] = competencies.map(
    ({ competencyId, title }) => {
      const judged = levelByCompetency.get(competencyId);

      if (judged) {
        const displayBand = mapConfidenceToDisplayBand(judged.confidence);
        const basis: CoverageBasis = "assessed";
        return {
          competencyId,
          title,
          basis,
          basisLabel: BASIS_LABELS[basis],
          level: judged.level,
          capabilityBandLabel: formatCapabilityBandLabel(String(judged.level)),
          whyThisBand: whyThisCapabilityBand(String(judged.level)),
          confidenceBand: displayBand,
          confidenceBandLabel: formatConfidenceDisplayLabel(judged.confidence),
          citedEvidenceCount: judged.evidenceReferences.length,
          reasoningSummary: judged.reasoningSummary || null,
          verified: false,
          whatToDoNext: nextActionFor(basis, title),
        };
      }

      // A snapshot exists but this competency did not reach a judged level →
      // it was judged insufficient or not covered by the run. Without a
      // snapshot at all, it simply has not been assessed yet.
      const basis: CoverageBasis = claims ? "insufficient_evidence" : "not_assessed";
      return {
        competencyId,
        title,
        basis,
        basisLabel: BASIS_LABELS[basis],
        level: null,
        capabilityBandLabel: null,
        whyThisBand: null,
        confidenceBand: null,
        confidenceBandLabel: null,
        citedEvidenceCount: 0,
        reasoningSummary: null,
        verified: false,
        whatToDoNext: nextActionFor(basis, title),
      };
    },
  );

  const summary = {
    total: rows.length,
    assessed: rows.filter((r) => r.basis === "assessed").length,
    insufficient: rows.filter((r) => r.basis === "insufficient_evidence").length,
    notAssessed: rows.filter((r) => r.basis === "not_assessed").length,
  };

  return {
    frameworkSlug: rubric.slug,
    frameworkVersion: rubric.version,
    frameworkTitle: rubric.title,
    confidenceBandAlgorithmVersion: CONFIDENCE_BAND_ALGORITHM_VERSION,
    snapshotId: claims?.snapshotId ?? null,
    capturedAt: claims?.capturedAt ?? null,
    rows,
    summary,
    selfReported: input.selfReportedStrengths ?? [],
    capabilityAssigned: false,
    deliverxVerifiedInflated: false,
    honestyNote: HONESTY_NOTE,
    emptyGuidance: claims
      ? null
      : "No capability assessment yet. Coverage becomes explainable once you record evidence and run an assessment.",
  };
}
