import type { RoleDefinition } from "@/lib/career-intelligence/types";

/** Seed role catalogue for MVP matching — not a job board. */
export const CAREER_ROLE_CATALOGUE: RoleDefinition[] = [
  {
    id: "apm-healthtech",
    title: "Associate Product Manager",
    seniority: "associate",
    industryFit: ["Healthtech", "B2B SaaS"],
    requirements: [
      {
        id: "stakeholder-judgement",
        label: "Stakeholder judgement under conflicting asks",
        competencyHints: ["Stakeholder judgement", "Facilitation"],
        evidenceSourceHints: ["decision", "meeting", "experience_project"],
        weight: 3,
      },
      {
        id: "discovery-basics",
        label: "Product discovery fundamentals",
        competencyHints: ["Discovery", "Artefact craft"],
        evidenceSourceHints: ["artefact", "work_sample", "reflection"],
        weight: 2,
      },
      {
        id: "delivery-practice",
        label: "Delivery practice in a live project context",
        competencyHints: ["Delivery practice"],
        evidenceSourceHints: ["experience_project", "meeting", "decision"],
        weight: 3,
      },
      {
        id: "outcome-ownership",
        label: "Outcome ownership / measurable results",
        competencyHints: ["Outcome ownership"],
        evidenceSourceHints: ["application_outcome", "artefact"],
        weight: 2,
      },
      {
        id: "communication",
        label: "Clear written or spoken product communication",
        competencyHints: ["Facilitation", "Artefact craft"],
        evidenceSourceHints: ["message", "artefact", "launchpad_interview"],
        weight: 2,
      },
    ],
  },
  {
    id: "pm-saas",
    title: "Product Manager",
    seniority: "mid",
    industryFit: ["B2B SaaS", "Fintech", "Healthtech"],
    requirements: [
      {
        id: "strategy-tradeoffs",
        label: "Strategy and prioritisation trade-offs",
        competencyHints: ["Stakeholder judgement", "Delivery practice"],
        evidenceSourceHints: ["decision", "experience_project"],
        weight: 3,
      },
      {
        id: "cross-functional",
        label: "Cross-functional leadership",
        competencyHints: ["Facilitation", "Stakeholder judgement"],
        evidenceSourceHints: ["meeting", "decision"],
        weight: 3,
      },
      {
        id: "metrics",
        label: "Metrics-informed decisions",
        competencyHints: ["Outcome ownership"],
        evidenceSourceHints: ["application_outcome", "artefact", "decision"],
        weight: 2,
      },
      {
        id: "discovery-depth",
        label: "Discovery depth with customers",
        competencyHints: ["Discovery"],
        evidenceSourceHints: ["artefact", "reflection", "experience_project"],
        weight: 2,
      },
      {
        id: "external-signal",
        label: "External or outcome-validated signal",
        competencyHints: ["Outcome ownership"],
        evidenceSourceHints: ["external_verification", "application_outcome"],
        weight: 2,
      },
    ],
  },
];
