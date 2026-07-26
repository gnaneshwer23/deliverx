export {
  WORKSPACE_OBSERVATION_CONSENT_COPY,
  WORKSPACE_OBSERVATION_CONTRACTS,
  getObservationContract,
  isSignificantContribution,
} from "@/lib/workspace-observation/types";
export type {
  ModuleObservationContract,
  ObservationConsentRecord,
  ObservationSequenceKind,
  InterventionDraft,
  InterventionKind,
  InterventionRecord,
  InterventionStatus,
} from "@/lib/workspace-observation/types";

export {
  getWorkspaceObservationConsent,
  setWorkspaceObservationConsent,
  isObservationAllowedFromConsent,
} from "@/lib/workspace-observation/consent";

export { isObservationConsentDbError } from "@/lib/workspace-observation/consent-errors";

export {
  observeWorkspaceContribution,
} from "@/lib/workspace-observation/observe";
export type {
  ObserveWorkspaceContributionInput,
  ObserveWorkspaceContributionResult,
} from "@/lib/workspace-observation/observe";

export {
  mapGapsToInterventionDrafts,
  extractCompetencyCode,
  offerInterventions,
  listActiveInterventions,
  transitionIntervention,
  recordInterventionSnapshotDelta,
  ensureInterventionsForGaps,
} from "@/lib/workspace-observation/interventions";
