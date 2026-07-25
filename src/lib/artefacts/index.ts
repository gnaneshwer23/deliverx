export {
  ARTEFACT_KINDS,
  ARTEFACT_STATUSES,
  ARTEFACT_SOURCE_SURFACES,
  ARTEFACT_CONTRIBUTION_SOURCES,
  ARTEFACT_CONFIDENTIALITY,
  ARTEFACT_EVENT,
  canTransitionArtefactStatus,
  computeArtefactContentHash,
  deriveContributionSource,
  assertEvidenceCitesArtefactVersion,
  isArtefactKind,
  isArtefactStatus,
  isArtefactSourceSurface,
} from "@/lib/artefacts/types";
export type {
  ArtefactKind,
  ArtefactStatus,
  ArtefactSourceSurface,
  ArtefactContributionSource,
  ArtefactActorType,
  ArtefactConfidentiality,
  ArtefactRecord,
  ArtefactVersionRecord,
  ArtefactVersionProvenance,
  CreateArtefactInput,
  AddArtefactVersionInput,
} from "@/lib/artefacts/types";
export {
  createArtefact,
  addArtefactVersion,
  transitionArtefactStatus,
  listArtefacts,
  getArtefactDetail,
} from "@/lib/artefacts/store";
export type {
  CreateArtefactResult,
  AddArtefactVersionResult,
} from "@/lib/artefacts/store";
