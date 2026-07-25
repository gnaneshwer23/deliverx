/**
 * Calibration analysis — honest, diagnostic pattern detection over real-world outcomes.
 *
 * This detects patterns like "N interviews, 0 offers" or "seniority target unsupported"
 * and surfaces DIAGNOSTIC guidance only. It never assigns, raises or lowers a capability
 * level. Every finding carries sample sizes (metrics) and is suppressed below the volume
 * floor for statistical honesty (G7). Findings are evidence-linked and challengeable.
 */

import {
  CALIBRATION_VOLUME_FLOOR,
  type CalibrationFinding,
  type OutcomeEventRecord,
} from "@/lib/real-world-outcomes/types";
import { summariseOutcomes } from "@/lib/real-world-outcomes/outcomes";

export type CalibrationContext = {
  /** Latest ScoreRun gaps (read-only) used to link diagnostics to evidence gaps. */
  gaps?: string[];
  /** Target seniority from identity/profile. */
  targetSeniority?: string | null;
  /** Number of interview-lab / communication evidence items (weak-evidence signal). */
  communicationEvidenceCount?: number;
};

const COMMUNICATION_KEYWORDS =
  /communicat|clarity|articulat|storytell|presentation|stakeholder|influenc|listen/i;
const SENIOR_SENIORITY = /senior|lead|principal|staff|head|director|manager/i;

function communicationGapImplicated(gaps: string[]): string[] {
  return gaps.filter((g) => COMMUNICATION_KEYWORDS.test(g));
}

/**
 * Detect calibration findings from a person's own outcomes.
 * Pure — no I/O, no capability writes.
 */
export function detectCalibrationFindings(
  events: OutcomeEventRecord[],
  context: CalibrationContext = {},
): CalibrationFinding[] {
  const summary = summariseOutcomes(events);
  const gaps = context.gaps ?? [];
  const findings: CalibrationFinding[] = [];

  const interviewEvents = events.filter((e) => e.eventType === "interview_attended");
  const feedbackEvents = events.filter(
    (e) => e.eventType === "interview_feedback" || e.eventType === "performance_feedback",
  );
  const rejectionEvents = events.filter((e) => e.eventType === "rejection");

  // Volume floor: below the floor, do not make conversion claims — say so honestly.
  // Count all market decisions (applications, interviews, rejections, offers).
  const decisionVolume =
    summary.applications + summary.interviews + summary.rejections + summary.offers;
  if (decisionVolume < CALIBRATION_VOLUME_FLOOR) {
    findings.push({
      findingType: "insufficient_data",
      severity: "info",
      title: "Not enough real-world outcomes to calibrate yet",
      detail: `Logged ${summary.total} outcome${summary.total === 1 ? "" : "s"} (${summary.applications} application${summary.applications === 1 ? "" : "s"}, ${summary.interviews} interview${summary.interviews === 1 ? "" : "s"}). Calibration patterns appear once you have at least ${CALIBRATION_VOLUME_FLOOR} applications/interviews.`,
      evidenceIds: evidenceIdsOf(events),
      implicatedGaps: [],
      metrics: {
        applications: summary.applications,
        interviews: summary.interviews,
        offers: summary.offers,
        volumeFloor: CALIBRATION_VOLUME_FLOOR,
      },
      diagnosticOnly: true,
      capabilityAssigned: false,
    });
    return findings;
  }

  // Interview conversion: enough interviews, zero offers → interview evidence may be weak.
  if (summary.interviews >= CALIBRATION_VOLUME_FLOOR && summary.offers === 0) {
    findings.push({
      findingType: "interview_conversion_low",
      severity: "action",
      title: `${summary.interviews} interviews, no offers yet`,
      detail:
        "A pattern of interviews without offers suggests interview evidence is weak — often communication, seniority signalling, or concrete commercial examples rather than capability itself. This is a diagnostic signal, not a capability judgement. Consider Interview Lab practice and adding outcome-backed examples.",
      evidenceIds: evidenceIdsOf([...interviewEvents, ...rejectionEvents]),
      implicatedGaps: communicationGapImplicated(gaps),
      metrics: {
        interviews: summary.interviews,
        offers: summary.offers,
        rejections: summary.rejections,
      },
      diagnosticOnly: true,
      capabilityAssigned: false,
    });
  } else if (summary.offers > 0) {
    // Healthy conversion — report it honestly too (with sample size).
    findings.push({
      findingType: "conversion_healthy",
      severity: "info",
      title: `${summary.offers} offer${summary.offers === 1 ? "" : "s"} from ${summary.interviews} interview${summary.interviews === 1 ? "" : "s"}`,
      detail:
        "Your real-world conversion is producing offers. Consider linking these outcomes to portfolio claims where they genuinely validate the work.",
      evidenceIds: evidenceIdsOf(
        events.filter(
          (e) => e.eventType === "offer_received" || e.eventType === "job_started",
        ),
      ),
      implicatedGaps: [],
      metrics: { interviews: summary.interviews, offers: summary.offers },
      diagnosticOnly: true,
      capabilityAssigned: false,
    });
  }

  // Seniority mismatch: targeting senior roles, repeated rejections, ScoreRun gaps.
  if (
    context.targetSeniority &&
    SENIOR_SENIORITY.test(context.targetSeniority) &&
    summary.rejections >= CALIBRATION_VOLUME_FLOOR &&
    summary.offers === 0
  ) {
    findings.push({
      findingType: "seniority_unsupported",
      severity: "watch",
      title: "Seniority target may be ahead of current evidence",
      detail: `You are targeting ${context.targetSeniority} roles with ${summary.rejections} rejections and no offers. The evidence supporting this seniority may be limited. This is diagnostic guidance — capability levels come only from capability assessment on practice evidence, never from rejections.`,
      evidenceIds: evidenceIdsOf(rejectionEvents),
      implicatedGaps: gaps.slice(0, 3),
      metrics: {
        rejections: summary.rejections,
        offers: summary.offers,
        targetSeniority: context.targetSeniority,
      },
      diagnosticOnly: true,
      capabilityAssigned: false,
    });
  }

  // Limited commercial examples: applying/interviewing but no delivered/outcome-backed work.
  if (
    summary.applications + summary.interviews >= CALIBRATION_VOLUME_FLOOR &&
    summary.externalProjects === 0 &&
    summary.documentSupported === 0
  ) {
    findings.push({
      findingType: "limited_commercial_examples",
      severity: "watch",
      title: "Few concrete, outcome-backed examples",
      detail:
        "Your outcomes are self-reported activity without delivered projects or artefact-backed examples. Adding an external project or attaching supporting artefacts strengthens the story. Diagnostic only — not a capability judgement.",
      evidenceIds: evidenceIdsOf(events),
      implicatedGaps: gaps.filter((g) => /deliver|commercial|impact|outcome|example/i.test(g)),
      metrics: {
        applications: summary.applications,
        interviews: summary.interviews,
        externalProjects: summary.externalProjects,
        documentSupported: summary.documentSupported,
      },
      diagnosticOnly: true,
      capabilityAssigned: false,
    });
  }

  // Communication gap: negative interview/performance feedback mentioning communication.
  const commFeedback = feedbackEvents.filter(
    (e) =>
      e.sentiment === "negative" &&
      COMMUNICATION_KEYWORDS.test(`${e.title} ${e.detail}`),
  );
  const commGaps = communicationGapImplicated(gaps);
  if (commFeedback.length > 0 || (commGaps.length > 0 && summary.interviews >= CALIBRATION_VOLUME_FLOOR && summary.offers === 0)) {
    findings.push({
      findingType: "communication_gap",
      severity: commFeedback.length > 0 ? "action" : "watch",
      title: "Communication may be limiting outcomes",
      detail:
        "Feedback and/or evidence gaps point to communication (clarity, stakeholder influence, storytelling) as a limiter. Diagnostic signal — practise in Interview Lab and Workspace so assessment can interpret real practice evidence.",
      evidenceIds: evidenceIdsOf(commFeedback),
      implicatedGaps: commGaps,
      metrics: {
        negativeCommunicationFeedback: commFeedback.length,
        interviews: summary.interviews,
      },
      diagnosticOnly: true,
      capabilityAssigned: false,
    });
  }

  // Role targeting mismatch: rejections across many distinct role titles.
  const distinctRejectedRoles = new Set(
    rejectionEvents.map((e) => (e.roleTitle ?? "").trim().toLowerCase()).filter(Boolean),
  );
  if (distinctRejectedRoles.size >= CALIBRATION_VOLUME_FLOOR && summary.offers === 0) {
    findings.push({
      findingType: "role_targeting_mismatch",
      severity: "watch",
      title: "Applications may be too broadly targeted",
      detail: `Rejections span ${distinctRejectedRoles.size} distinct role titles with no offers. Narrowing to roles your evidence best supports usually improves conversion. Diagnostic only.`,
      evidenceIds: evidenceIdsOf(rejectionEvents),
      implicatedGaps: [],
      metrics: {
        distinctRejectedRoles: distinctRejectedRoles.size,
        rejections: summary.rejections,
        offers: summary.offers,
      },
      diagnosticOnly: true,
      capabilityAssigned: false,
    });
  }

  return findings;
}

function evidenceIdsOf(events: OutcomeEventRecord[]): string[] {
  const ids = events.map((e) => e.evidenceId).filter((id): id is string => Boolean(id));
  return Array.from(new Set(ids));
}
