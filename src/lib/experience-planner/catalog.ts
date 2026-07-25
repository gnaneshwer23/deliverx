/**
 * Multi-company Experience scenario catalogue (Phase 3 expansion).
 * Planner ranks by ScoreRun gaps + industry/role preferences.
 * MediFlow remains the richest engine; others use the shared scenario runtime.
 */

import {
  BRIEFCASE_RUNTIME,
  BRIGHTPATH_RUNTIME,
  CAMPUSFLOW_RUNTIME,
  CAREBRIDGE_RUNTIME,
  LATTICEOPS_RUNTIME,
  MEDIFLOW_RUNTIME,
  NOVADESK_RUNTIME,
  PULSEBOARD_RUNTIME,
  ROADMAPHQ_RUNTIME,
  SCHOLARLINK_RUNTIME,
  SPRINTFORGE_RUNTIME,
  VITALSYNC_RUNTIME,
} from "@/lib/experience-planner/packs";
import type {
  ExperienceEmphasis,
  ExperienceScenarioDef,
} from "@/lib/experience-planner/types";

export const EXPERIENCE_PLANNER_VERSION = "experience-plan-v2";

/** @deprecated use EXPERIENCE_SCENARIO_CATALOG */
export const MEDIFLOW_SCENARIO_CATALOG: ExperienceScenarioDef[] = [];

function base(
  partial: Omit<ExperienceScenarioDef, "promptVersion" | "frameworkSlug" | "frameworkVersion"> &
    Partial<Pick<ExperienceScenarioDef, "promptVersion" | "frameworkSlug" | "frameworkVersion">>,
): ExperienceScenarioDef {
  return {
    promptVersion: EXPERIENCE_PLANNER_VERSION,
    frameworkSlug: "pm-core",
    frameworkVersion: "2026.1",
    ...partial,
  };
}

/** Distinct company/project scenarios (≥10). */
export const EXPERIENCE_SCENARIO_CATALOG: ExperienceScenarioDef[] = [
  base({
    slug: "mediflow-trustcare",
    title: "MediFlow — TrustCare pilot commitment",
    companyKey: "mediflow",
    companyName: "MediFlow",
    projectKey: "trustcare",
    projectName: "TrustCare Pilot — Metro Clinic",
    industry: "healthcare",
    industryLabels: ["healthcare", "healthtech", "health", "clinic", "care"],
    roleFamily: "product_manager",
    candidateRole: "Associate Product Manager",
    problem:
      "Sales floated a TrustCare pilot date before engineering confirmed capacity.",
    objectives: [
      "Hold or consciously renegotiate the pilot date",
      "Protect engineering capacity and brand trust",
    ],
    emphasis: "balanced",
    competencyCodes: [
      "comp.stakeholder_management",
      "comp.delivery_execution",
      "comp.product_discovery",
    ],
    summary:
      "Healthcare Day 1: commit or renegotiate TrustCare with Metro Clinic under sales pressure.",
    coachingFocus:
      "Balance fact-gathering, facilitation, and a clear commit-or-renegotiate decision.",
    decisionEmphasis: ["review_context", "discuss_options", "make_decision"],
    engine: "mediflow",
    runtime: MEDIFLOW_RUNTIME,
    isFallback: true,
  }),
  base({
    slug: "vitalsync-ehr-rollout",
    title: "VitalSync — EHR cutover sequencing",
    companyKey: "vitalsync",
    companyName: "VitalSync",
    projectKey: "ehr-rollout",
    projectName: "Regional EHR Go-Live",
    industry: "healthcare",
    industryLabels: ["healthcare", "healthtech", "hospital", "ehr", "clinical"],
    roleFamily: "product_manager",
    candidateRole: "Product Manager",
    problem:
      "Board wants a hard EHR go-live date while dry-runs and night-shift training are red.",
    objectives: [
      "Protect clinical safety in cutover sequencing",
      "Give the board a credible, gated date",
    ],
    emphasis: "delivery",
    competencyCodes: ["comp.delivery_execution", "comp.stakeholder_management"],
    summary:
      "Healthcare: sequence a hospital EHR go-live under board pressure without unsafe cutover.",
    coachingFocus:
      "Protect dry-run quality and clinical sign-off before any public date.",
    decisionEmphasis: ["review_context", "make_decision", "discuss_options"],
    engine: "shared",
    runtime: VITALSYNC_RUNTIME,
  }),
  base({
    slug: "carebridge-referral",
    title: "CareBridge — referral network pilot",
    companyKey: "carebridge",
    companyName: "CareBridge",
    projectKey: "referral-pilot",
    projectName: "Regional Referral Network Pilot",
    industry: "healthcare",
    industryLabels: ["healthcare", "healthtech", "clinic", "network"],
    roleFamily: "technical_product_manager",
    candidateRole: "Technical Product Manager",
    problem:
      "Partnerships wants five 'live' partners for press while APIs are still sandbox.",
    objectives: [
      "Align public partner count with technical readiness",
      "Protect clinic trust on referral loops",
    ],
    emphasis: "stakeholder",
    competencyCodes: ["comp.stakeholder_management", "comp.product_discovery"],
    summary:
      "Healthcare: launch a referral network pilot with honest partner SLAs.",
    coachingFocus:
      "Protect the public narrative without overstating live partner readiness.",
    decisionEmphasis: ["discuss_options", "make_decision", "review_context"],
    engine: "shared",
    runtime: CAREBRIDGE_RUNTIME,
  }),
  base({
    slug: "brightpath-adaptive",
    title: "BrightPath — adaptive learning MVP",
    companyKey: "brightpath",
    companyName: "BrightPath Academy",
    projectKey: "adaptive-mvp",
    projectName: "Adaptive Practice MVP",
    industry: "education",
    industryLabels: ["education", "edtech", "learning", "school", "academy"],
    roleFamily: "product_manager",
    candidateRole: "Education Product Manager",
    problem:
      "Growth demo claims multi-subject AI tutoring while only one strand is ready.",
    objectives: [
      "Ship a Monday-ready teacher flow",
      "Avoid overclaimed learning outcomes",
    ],
    emphasis: "discovery",
    competencyCodes: ["comp.product_discovery", "comp.delivery_execution"],
    summary:
      "Education: scope an adaptive learning MVP without overclaiming outcomes.",
    coachingFocus:
      "Separate evidence-backed MVP scope from demo narrative pressure.",
    decisionEmphasis: ["review_context", "discuss_options", "make_decision"],
    engine: "shared",
    runtime: BRIGHTPATH_RUNTIME,
  }),
  base({
    slug: "campusflow-onboarding",
    title: "CampusFlow — student intake go-live",
    companyKey: "campusflow",
    companyName: "CampusFlow",
    projectKey: "student-onboarding",
    projectName: "Autumn Intake Onboarding",
    industry: "education",
    industryLabels: ["education", "university", "higher education", "campus"],
    roleFamily: "project_manager",
    candidateRole: "Project Manager",
    problem:
      "Housing self-serve was marketed while the payment critical path slipped.",
    objectives: [
      "Protect intake critical path",
      "Publish honest registrar communications",
    ],
    emphasis: "delivery",
    competencyCodes: ["comp.delivery_execution", "comp.stakeholder_management"],
    summary:
      "Education: recover a university onboarding release before hard intake.",
    coachingFocus:
      "Protect payment critical path before housing niceties; rewrite parent comms.",
    decisionEmphasis: ["review_context", "make_decision", "discuss_options"],
    engine: "shared",
    runtime: CAMPUSFLOW_RUNTIME,
  }),
  base({
    slug: "scholarlink-portal",
    title: "ScholarLink — research portal redesign",
    companyKey: "scholarlink",
    companyName: "ScholarLink",
    projectKey: "portal-redesign",
    projectName: "Faculty Research Portal Redesign",
    industry: "education",
    industryLabels: ["education", "university", "research", "higher education"],
    roleFamily: "product_manager",
    candidateRole: "Product Manager",
    problem:
      "Vendor kickoff is booked before discovery synthesis; grant forms cannot break.",
    objectives: [
      "Gate redesign on discovery evidence",
      "Protect grant submission path",
    ],
    emphasis: "discovery",
    competencyCodes: ["comp.product_discovery", "comp.stakeholder_management"],
    summary:
      "Education: prioritise discovery before a research-portal vendor kickoff.",
    coachingFocus:
      "Keep grant submission out of cosmetic scope; delay full IA rewrite.",
    decisionEmphasis: ["review_context", "discuss_options", "make_decision"],
    engine: "shared",
    runtime: SCHOLARLINK_RUNTIME,
  }),
  base({
    slug: "novadesk-sla",
    title: "NovaDesk — enterprise SLA commitment",
    companyKey: "novadesk",
    companyName: "NovaDesk",
    projectKey: "enterprise-sla",
    projectName: "Contoso Renewal SLA",
    industry: "saas",
    industryLabels: ["saas", "b2b", "software", "enterprise", "helpdesk"],
    roleFamily: "product_manager",
    candidateRole: "Associate Product Manager",
    problem:
      "Enterprise renewal demands a custom SLA that would fork the platform.",
    objectives: [
      "Protect renewal without a one-off fork",
      "Keep support operability as a hard gate",
    ],
    emphasis: "stakeholder",
    competencyCodes: ["comp.stakeholder_management", "comp.delivery_execution"],
    summary:
      "SaaS: decide an enterprise SLA ask without collapsing the platform roadmap.",
    coachingFocus:
      "Prefer configurable entitlements and dated commitments over custom forks.",
    decisionEmphasis: ["discuss_options", "make_decision", "review_context"],
    engine: "shared",
    runtime: NOVADESK_RUNTIME,
  }),
  base({
    slug: "pulseboard-launch",
    title: "PulseBoard — analytics launch pack",
    companyKey: "pulseboard",
    companyName: "PulseBoard",
    projectKey: "launch-pack",
    projectName: "Conference Analytics Launch Pack",
    industry: "saas",
    industryLabels: ["saas", "analytics", "b2b", "software", "startup"],
    roleFamily: "product_manager",
    candidateRole: "Product Manager",
    problem:
      "Marketing printed 12 charts while half time out on big tenants before conference.",
    objectives: [
      "Ship a demo-safe launch pack",
      "Protect onboarding time-to-value",
    ],
    emphasis: "delivery",
    competencyCodes: ["comp.delivery_execution", "comp.product_discovery"],
    summary:
      "SaaS: cut an analytics launch pack to green charts before conference.",
    coachingFocus:
      "Cut to demo-critical green charts; protect onboarding TTV as a launch gate.",
    decisionEmphasis: ["review_context", "make_decision", "discuss_options"],
    engine: "shared",
    runtime: PULSEBOARD_RUNTIME,
  }),
  base({
    slug: "latticeops-permissions",
    title: "LatticeOps — multi-tenant permissions",
    companyKey: "latticeops",
    companyName: "LatticeOps",
    projectKey: "permissions-redesign",
    projectName: "RBAC Audit Remediation",
    industry: "saas",
    industryLabels: ["saas", "b2b", "security", "ops", "software"],
    roleFamily: "technical_product_manager",
    candidateRole: "Technical Product Manager",
    problem:
      "Audit findings demand a permissions redesign while Product resists a feature freeze.",
    objectives: [
      "Close critical findings with evidence",
      "Limit freeze to security-critical surfaces",
    ],
    emphasis: "discovery",
    competencyCodes: ["comp.product_discovery", "comp.delivery_execution"],
    summary:
      "SaaS: scope a multi-tenant permissions redesign under audit pressure.",
    coachingFocus:
      "Map critical surfaces; require migration tooling before legacy cutover.",
    decisionEmphasis: ["review_context", "discuss_options", "make_decision"],
    engine: "shared",
    runtime: LATTICEOPS_RUNTIME,
  }),
  base({
    slug: "roadmaphq-cut",
    title: "RoadmapHQ — Q3 roadmap cut",
    companyKey: "roadmaphq",
    companyName: "RoadmapHQ",
    projectKey: "q3-cut",
    projectName: "Q3 Board Roadmap Cut",
    industry: "product_management",
    industryLabels: [
      "product management",
      "product",
      "roadmap",
      "saas",
      "software",
    ],
    roleFamily: "product_manager",
    candidateRole: "Senior Product Manager",
    problem:
      "Board wants a ruthless cut while Sales already sold two over-capacity epics.",
    objectives: [
      "Cut to ≤100% capacity with outcome logic",
      "Renegotiate sold work explicitly",
    ],
    emphasis: "stakeholder",
    competencyCodes: ["comp.stakeholder_management", "comp.product_discovery"],
    summary:
      "Product management: lead a transparent Q3 roadmap cut under board pressure.",
    coachingFocus:
      "Make capacity visible; renegotiate sold work — don't hide cuts.",
    decisionEmphasis: ["discuss_options", "make_decision", "review_context"],
    engine: "shared",
    runtime: ROADMAPHQ_RUNTIME,
  }),
  base({
    slug: "sprintforge-recovery",
    title: "SprintForge — release train recovery",
    companyKey: "sprintforge",
    companyName: "SprintForge",
    projectKey: "release-recovery",
    projectName: "Cross-Team Release Train Recovery",
    industry: "project_management",
    industryLabels: [
      "project management",
      "programme",
      "delivery",
      "agile",
      "saas",
    ],
    roleFamily: "project_manager",
    candidateRole: "Project Manager",
    problem:
      "A public launch date sits on a thrashing multi-team train with no single critical path.",
    objectives: [
      "Publish one critical path with owners",
      "Cut WIP and align external status",
    ],
    emphasis: "delivery",
    competencyCodes: ["comp.delivery_execution", "comp.stakeholder_management"],
    summary:
      "Project management: recover a red cross-team release train before launch.",
    coachingFocus:
      "Create one critical path; cut WIP visibly; publish honest status.",
    decisionEmphasis: ["review_context", "make_decision", "discuss_options"],
    engine: "shared",
    runtime: SPRINTFORGE_RUNTIME,
  }),
  base({
    slug: "briefcase-pricing",
    title: "Briefcase — packaging & pricing cut",
    companyKey: "briefcase",
    companyName: "Briefcase",
    projectKey: "pricing-packaging",
    projectName: "PLG Packaging Decision",
    industry: "product_management",
    industryLabels: [
      "product management",
      "pricing",
      "saas",
      "product",
      "b2b",
    ],
    roleFamily: "product_manager",
    candidateRole: "Product Manager",
    problem:
      "Sales wants five SKUs while interviews and entitlements support three packages.",
    objectives: [
      "Lock ≤3 packages mapped to jobs",
      "Document a discount policy CFO will approve",
    ],
    emphasis: "discovery",
    competencyCodes: ["comp.product_discovery", "comp.stakeholder_management"],
    summary:
      "Product management: choose packaging that sales can sell and ops can provision.",
    coachingFocus:
      "Anchor packages in interview jobs; make entitlements and discount policy gates.",
    decisionEmphasis: ["review_context", "discuss_options", "make_decision"],
    engine: "shared",
    runtime: BRIEFCASE_RUNTIME,
  }),
];

/** Legacy MediFlow emphasis-only slugs still resolvable for existing plans. */
export const LEGACY_MEDIFLOW_EMPHASIS_SLUGS: Record<
  string,
  ExperienceEmphasis
> = {
  "mediflow-trustcare-stakeholder": "stakeholder",
  "mediflow-trustcare-delivery": "delivery",
  "mediflow-trustcare-discovery": "discovery",
  "mediflow-trustcare-balanced": "balanced",
};

const mediflowPrimary = () =>
  EXPERIENCE_SCENARIO_CATALOG.find((s) => s.slug === "mediflow-trustcare")!;

export function scenarioBySlug(slug: string): ExperienceScenarioDef | undefined {
  const direct = EXPERIENCE_SCENARIO_CATALOG.find((s) => s.slug === slug);
  if (direct) return direct;
  const legacyEmphasis = LEGACY_MEDIFLOW_EMPHASIS_SLUGS[slug];
  if (legacyEmphasis) {
    const primary = mediflowPrimary();
    return {
      ...primary,
      slug,
      emphasis: legacyEmphasis,
      title: `MediFlow TrustCare — ${legacyEmphasis}`,
      legacyEmphasisVariant: true,
      isFallback: legacyEmphasis === "balanced",
      competencyCodes:
        legacyEmphasis === "stakeholder"
          ? ["comp.stakeholder_management"]
          : legacyEmphasis === "delivery"
            ? ["comp.delivery_execution"]
            : legacyEmphasis === "discovery"
              ? ["comp.product_discovery"]
              : primary.competencyCodes,
    };
  }
  return undefined;
}

export function scenarioByEmphasis(
  emphasis: ExperienceEmphasis,
): ExperienceScenarioDef {
  return (
    EXPERIENCE_SCENARIO_CATALOG.find(
      (s) => s.companyKey === "mediflow" && s.emphasis === emphasis,
    ) ??
    EXPERIENCE_SCENARIO_CATALOG.find((s) => s.isFallback) ??
    EXPERIENCE_SCENARIO_CATALOG[0]!
  );
}

export function listPublishedScenarios(): ExperienceScenarioDef[] {
  return EXPERIENCE_SCENARIO_CATALOG;
}

export function distinctCompanyCount(): number {
  return new Set(EXPERIENCE_SCENARIO_CATALOG.map((s) => s.companyKey)).size;
}

// Keep deprecated export populated for any leftover imports expecting array length.
MEDIFLOW_SCENARIO_CATALOG.push(
  ...EXPERIENCE_SCENARIO_CATALOG.filter((s) => s.companyKey === "mediflow"),
);
