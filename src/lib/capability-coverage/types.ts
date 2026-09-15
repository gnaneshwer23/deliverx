/**
 * Capability Coverage Map — typed contracts.
 *
 * A read-only, framework-wide answer to "what have I genuinely demonstrated,
 * and what evidence supports it?" For EVERY capability in the pinned framework
 * it states an explainable basis. It never assigns capability, never lights
 * Verified, and never shows a decorative percentage.
 */

import type { CapabilityLevel } from "@/lib/capability-engine/types";
import type {
  ConfidenceDisplayBand,
  ConfidenceBandAlgorithmVersion,
} from "@/lib/capability-engine/confidence-bands";

/** Honest basis for a single framework capability. */
export type CoverageBasis =
  /** A judged level exists in the latest capability snapshot. */
  | "assessed"
  /** A snapshot exists but this capability did not reach a level. */
  | "insufficient_evidence"
  /** No capability assessment has run yet. */
  | "not_assessed";

export type CapabilityCoverageRow = {
  competencyId: string;
  title: string;
  basis: CoverageBasis;
  basisLabel: string;
  /** Capability Engine level when assessed; null otherwise. */
  level: CapabilityLevel | string | null;
  /** B1 capability band label + explanation (assessed only). */
  capabilityBandLabel: string | null;
  whyThisBand: string | null;
  /** B1 confidence display band — never a raw percentage. */
  confidenceBand: ConfidenceDisplayBand | null;
  confidenceBandLabel: string | null;
  /** Count of ledger evidence references the judgement cited. */
  citedEvidenceCount: number;
  reasoningSummary: string | null;
  /** Always false here — Verified lights only from external attestation (T8). */
  verified: false;
  whatToDoNext: string;
};

export type SelfReportedClaim = {
  key: string;
  value: string;
};

export type CapabilityCoverageSummary = {
  total: number;
  assessed: number;
  insufficient: number;
  notAssessed: number;
};

export type CapabilityCoverage = {
  frameworkSlug: string;
  frameworkVersion: string;
  frameworkTitle: string;
  confidenceBandAlgorithmVersion: ConfidenceBandAlgorithmVersion;
  snapshotId: string | null;
  capturedAt: string | null;
  rows: CapabilityCoverageRow[];
  summary: CapabilityCoverageSummary;
  /** Setup answers, kept separate from evidence and clearly labelled. */
  selfReported: SelfReportedClaim[];
  /** Explicit trust rails on every payload. */
  capabilityAssigned: false;
  deliverxVerifiedInflated: false;
  honestyNote: string;
  emptyGuidance: string | null;
};
