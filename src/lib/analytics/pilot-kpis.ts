export const PILOT_KPI_CATALOGUE = {
  account_created: {
    kpi: "activation",
    properties: ["method", "product_intent"],
  },
  onboarding_pi_completed: {
    kpi: "activation",
    properties: ["chosen_path", "baseline_opt_in"],
  },
  experience_started: {
    kpi: "core_evidence_loop",
    properties: ["source"],
  },
  experience_plan_generated: {
    kpi: "core_evidence_loop",
    properties: ["created"],
  },
  capability_assessment_completed: {
    kpi: "judgement_coverage",
    properties: ["run_kind", "rubric_source", "framework_pinned"],
  },
  evidence_appended: {
    kpi: "evidence_density",
    properties: ["source_type", "category", "actor_type"],
  },
  artefact_version_created: {
    kpi: "core_evidence_loop",
    properties: ["kind", "source_surface", "version_number"],
  },
  recommendation_viewed: {
    kpi: "recommendation_engagement",
    properties: ["surface", "count"],
  },
  recommendation_accepted: {
    kpi: "recommendation_engagement",
    properties: ["surface"],
  },
  outcome_event_recorded: {
    kpi: "career_outcomes",
    properties: ["outcome_type", "has_artefact"],
  },
} as const;

export type PilotKpiEventName = keyof typeof PILOT_KPI_CATALOGUE;
export type PilotKpiPropertyValue = string | number | boolean;

export type PilotKpiProperties = {
  account_created: {
    method: "password";
    product_intent?: string;
  };
  onboarding_pi_completed: {
    chosen_path: string;
    baseline_opt_in: boolean;
  };
  experience_started: {
    source: "xperience";
  };
  experience_plan_generated: {
    created: boolean;
  };
  capability_assessment_completed: {
    run_kind: "standard" | "baseline";
    rubric_source: "db" | "in_code_fallback";
    framework_pinned: boolean;
  };
  evidence_appended: {
    source_type: string;
    category: string;
    actor_type: string;
  };
  artefact_version_created: {
    kind: string;
    source_surface: string;
    version_number: number;
  };
  recommendation_viewed: {
    surface: "profile" | "career" | "unknown";
    count: number;
  };
  recommendation_accepted: {
    surface: "profile" | "career" | "unknown";
  };
  outcome_event_recorded: {
    outcome_type: string;
    has_artefact: boolean;
  };
};

const FORBIDDEN_KEY_PATTERN =
  /(^|_)(email|e_mail|name|full_name|first_name|last_name|phone|address|title|summary|content|raw_content|evidence_body)($|_)/i;
const MAX_STRING_LENGTH = 128;

export const PILOT_KPI_PRIVACY_RULES = [
  "Only catalogue-approved properties are emitted.",
  "No email, name, phone, address, free-text evidence, title, summary, or content.",
  "No user identifier is required for pilot KPI aggregation.",
  "Strings are bounded to 128 characters; nested values are discarded.",
] as const;

export function sanitizePilotKpiProperties<E extends PilotKpiEventName>(
  eventName: E,
  input: PilotKpiProperties[E] | Record<string, unknown>,
): Record<string, PilotKpiPropertyValue> {
  const allowed = new Set<string>(PILOT_KPI_CATALOGUE[eventName].properties);
  const output: Record<string, PilotKpiPropertyValue> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!allowed.has(key) || FORBIDDEN_KEY_PATTERN.test(key)) continue;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) output[key] = trimmed.slice(0, MAX_STRING_LENGTH);
      continue;
    }
    if (typeof value === "number") {
      if (Number.isFinite(value)) output[key] = value;
      continue;
    }
    if (typeof value === "boolean") output[key] = value;
  }

  return output;
}
