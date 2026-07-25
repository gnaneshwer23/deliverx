/**
 * In-code MediFlow scenario catalogue for the Experience planner MVP.
 * DB seed in 0078 mirrors these rows; planner uses this catalog so planning
 * works even before scenarios are fetched from the database.
 */

import type { ExperienceScenarioDef } from "@/lib/experience-planner/types";

export const EXPERIENCE_PLANNER_VERSION = "experience-plan-v1";

export const MEDIFLOW_SCENARIO_CATALOG: ExperienceScenarioDef[] = [
  {
    slug: "mediflow-trustcare-stakeholder",
    title: "MediFlow TrustCare — stakeholder alignment",
    companyKey: "mediflow",
    projectKey: "trustcare",
    emphasis: "stakeholder",
    competencyCodes: ["comp.stakeholder_management"],
    promptVersion: EXPERIENCE_PLANNER_VERSION,
    summary:
      "Practice TrustCare Day 1 with emphasis on executive and sales stakeholder judgement.",
    coachingFocus:
      "Prioritise clarifying commitments with Sarah and James before locking a date.",
    decisionEmphasis: ["discuss_options", "make_decision"],
    frameworkSlug: "pm-core",
    frameworkVersion: "2026.1",
  },
  {
    slug: "mediflow-trustcare-delivery",
    title: "MediFlow TrustCare — delivery under constraint",
    companyKey: "mediflow",
    projectKey: "trustcare",
    emphasis: "delivery",
    competencyCodes: ["comp.delivery_execution"],
    promptVersion: EXPERIENCE_PLANNER_VERSION,
    summary:
      "Practice TrustCare Day 1 with emphasis on engineering capacity and scope realism.",
    coachingFocus:
      "Prioritise Maya's capacity signal and what can actually ship before any commit.",
    decisionEmphasis: ["review_context", "make_decision"],
    frameworkSlug: "pm-core",
    frameworkVersion: "2026.1",
  },
  {
    slug: "mediflow-trustcare-discovery",
    title: "MediFlow TrustCare — discovery before commit",
    companyKey: "mediflow",
    projectKey: "trustcare",
    emphasis: "discovery",
    competencyCodes: ["comp.product_discovery"],
    promptVersion: EXPERIENCE_PLANNER_VERSION,
    summary:
      "Practice TrustCare Day 1 with emphasis on clarifying the problem and evidence before deciding.",
    coachingFocus:
      "Prioritise reviewing the brief and customer pulse before answering Sales.",
    decisionEmphasis: ["review_context", "discuss_options"],
    frameworkSlug: "pm-core",
    frameworkVersion: "2026.1",
  },
  {
    slug: "mediflow-trustcare-balanced",
    title: "MediFlow TrustCare — balanced Day 1",
    companyKey: "mediflow",
    projectKey: "trustcare",
    emphasis: "balanced",
    competencyCodes: [
      "comp.stakeholder_management",
      "comp.delivery_execution",
      "comp.product_discovery",
    ],
    promptVersion: EXPERIENCE_PLANNER_VERSION,
    summary: "Default MediFlow TrustCare Day 1 when gaps are thin or mixed.",
    coachingFocus:
      "Balance fact-gathering, facilitation, and a clear commit-or-renegotiate decision.",
    decisionEmphasis: ["review_context", "discuss_options", "make_decision"],
    frameworkSlug: "pm-core",
    frameworkVersion: "2026.1",
    isFallback: true,
  },
];

export function scenarioBySlug(slug: string): ExperienceScenarioDef | undefined {
  return MEDIFLOW_SCENARIO_CATALOG.find((s) => s.slug === slug);
}

export function scenarioByEmphasis(
  emphasis: ExperienceScenarioDef["emphasis"],
): ExperienceScenarioDef {
  return (
    MEDIFLOW_SCENARIO_CATALOG.find((s) => s.emphasis === emphasis) ??
    MEDIFLOW_SCENARIO_CATALOG.find((s) => s.isFallback)!
  );
}
