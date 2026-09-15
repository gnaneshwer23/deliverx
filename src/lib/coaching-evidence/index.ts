export * from "@/lib/coaching-evidence/types";
export * from "@/lib/coaching-evidence/state-machine";
export {
  COACHING_DOES_NOT_GRANT_VERIFIED,
  assertCoachEvidenceShape,
  guardAiAssistedCoachingCitations,
  guardCoachingTrustRails,
  guardHumanConfirmer,
} from "@/lib/coaching-evidence/trust-guards";
export {
  isCoachingEvidenceEnabled,
  isProgrammeEnabled,
  COACHING_EVIDENCE_DISABLED_NOTICE,
  type CoachingEvidenceEnv,
} from "@/lib/coaching-evidence/flag";
export {
  listProgrammesWithExercises,
  createSubmission,
  listSubmissions,
  getSubmission,
  listSubmissionReviews,
  listCoachQueue,
  claimForReview,
  decideSubmission,
  type ServiceResult,
  type ProgrammeWithExercises,
  type CreateSubmissionResult,
  type CoachDecisionResult,
} from "@/lib/coaching-evidence/store";
