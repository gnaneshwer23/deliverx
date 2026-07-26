export { runCapabilityEngine } from "@/lib/capability-engine/orchestrator";
export { persistCapabilityRun } from "@/lib/capability-engine/persist";
export {
  CONFIDENCE_BAND_ALGORITHM_VERSION,
  mapSignalsToCapabilityBand,
  mapConfidenceToDisplayBand,
  formatCapabilityBandLabel,
  whyThisCapabilityBand,
  formatConfidenceDisplayLabel,
  whyThisConfidenceDisplayBand,
  capabilityBandExplainLine,
  confidenceDisplayExplainLine,
  CAPABILITY_BAND_COPY,
  CONFIDENCE_DISPLAY_BAND_COPY,
} from "@/lib/capability-engine/confidence-bands";
export type {
  CapabilityBand,
  ConfidenceDisplayBand,
  CapabilityBandSignals,
} from "@/lib/capability-engine/confidence-bands";
export {
  projectSnapshotClaims,
  projectGrowthDelta,
  toPiProfileScoreRun,
  toScoreRunCareerContext,
  toPortfolioCapabilityClaims,
  projectRoleReadinessFromClaims,
  loadRecentSnapshotClaims,
} from "@/lib/capability-engine/snapshot-claims";
export type {
  SnapshotClaims,
  SnapshotGrowthDelta,
  SnapshotClaimLevel,
  PortfolioCapabilityClaim,
} from "@/lib/capability-engine/snapshot-claims";
export type * from "@/lib/capability-engine/types";
