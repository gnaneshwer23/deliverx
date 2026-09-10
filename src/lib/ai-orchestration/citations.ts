/**
 * AI citation requirements (pre-T9 hardening).
 *
 * Any AI output that makes a material professional observation, recommendation,
 * or organisation/project claim MUST cite the structured context supplied to the
 * same `runAgent` call. Missing / empty / fabricated citations fail validation and
 * force a deterministic "insufficient evidence/context" fallback — the platform
 * never silently publishes an unsupported AI claim.
 *
 * Intelligence belongs to the platform, not the model: citations are validated
 * against the exact `contextSources` the runner assembled, not trusted from the
 * model's own assertions.
 */

import {
  isAiCitationSourceType,
  type AiCitation,
  type AiStructuredContext,
} from "@/lib/ai-orchestration/types";

/**
 * Citation class for a given output contract.
 *
 * - `required` — output can carry a material observation/recommendation/claim, so
 *   at least one valid citation resolving to the run context is mandatory.
 * - `optional` — purely conversational acknowledgements or formatting-only output
 *   that asserts no professional fact. Documented narrowly; no current production
 *   contract is optional (kept for machinery + tests only).
 */
export type CitationClass = "required" | "optional";

export type CitationPolicy = {
  contractId: string;
  citationClass: CitationClass;
  /** Field on the validated output object that carries the citations array. */
  field: string;
  /** Which output classification this contract falls under (audit matrix). */
  classification: string;
  reason: string;
};

/**
 * Contract → citation policy. Classification maps to the audit matrix.
 * All six live agents produce material professional content, so all are `required`.
 */
export const CITATION_POLICIES: Record<string, CitationPolicy> = {
  line_manager_briefing_v1: {
    contractId: "line_manager_briefing_v1",
    citationClass: "required",
    field: "citations",
    classification: "coach/manager recommendation tied to project/evidence",
    reason:
      "Line-manager priorities and suggested actions are recommendations tied to the bound project and its evidence.",
  },
  stakeholder_perspective_v1: {
    contractId: "stakeholder_perspective_v1",
    citationClass: "required",
    field: "citations",
    classification: "organisation/project factual answer",
    reason:
      "Stakeholder concerns and questions assert project state and must reference the supplied project context.",
  },
  observer_draft_v1: {
    contractId: "observer_draft_v1",
    citationClass: "required",
    field: "citations",
    classification: "observer finding",
    reason:
      "Observer findings become evidence-ledger drafts; every draft must cite the observed context.",
  },
  coach_hint_v1: {
    contractId: "coach_hint_v1",
    citationClass: "required",
    field: "citations",
    classification: "coach/career recommendation referencing evidence",
    reason:
      "Coach and interview hints reference project/experience/career evidence and must cite it.",
  },
  experience_hiring_question_v1: {
    contractId: "experience_hiring_question_v1",
    citationClass: "required",
    field: "citations",
    classification: "organisation/project factual question tied to Experience sim state",
    reason:
      "Hiring-panel questions assert company, role, and project facts and must cite the supplied Experience context.",
  },
  /**
   * Documented-only optional example. Not attached to any live agent. Exists so
   * the machinery + optional-class test path is exercised without weakening a
   * production surface.
   */
  conversational_ack_v1: {
    contractId: "conversational_ack_v1",
    citationClass: "optional",
    field: "citations",
    classification: "purely conversational acknowledgement (no professional claim)",
    reason:
      "Formatting-only acknowledgements assert no professional fact, so citations are optional.",
  },
};

export function getCitationPolicy(contractId: string): CitationPolicy | null {
  return CITATION_POLICIES[contractId] ?? null;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Build the set of citable source ids the runner actually supplied for this call.
 * Nothing outside this set is a valid citation.
 */
export function buildCitationIndex(context: AiStructuredContext): {
  ids: Set<string>;
  typeById: Map<string, string>;
} {
  const ids = new Set<string>();
  const typeById = new Map<string, string>();

  const add = (rawId: unknown, sourceType: string) => {
    if (typeof rawId !== "string") return;
    const id = rawId.trim();
    if (!id) return;
    ids.add(id);
    if (!typeById.has(id)) typeById.set(id, sourceType);
  };

  for (const c of context.evidenceCitations ?? []) {
    add(c.evidenceId, "evidence");
  }

  for (const [key, value] of Object.entries(context.boundRef ?? {})) {
    const inferred = /project/i.test(key)
      ? "project"
      : /task/i.test(key)
        ? "task"
        : /meeting/i.test(key)
          ? "meeting"
          : /artefact/i.test(key)
            ? "artefact"
            : "other";
    add(value, inferred);
  }

  if (context.frameworkPin) {
    add(context.frameworkPin.frameworkVersionId, "framework");
    add(context.frameworkPin.code, "framework");
  }

  for (const source of context.sources ?? []) {
    if (source.ref) add(source.ref, mapSourceKindToType(source.kind));
  }

  return { ids, typeById };
}

function mapSourceKindToType(kind: string): string {
  switch (kind) {
    case "evidence_citation":
      return "evidence";
    case "project":
      return "project";
    case "observation":
      return "observation";
    case "framework_pin":
      return "framework";
    case "org_snapshot":
      return "org_snapshot";
    case "career_goal":
      return "career_goal";
    case "experience_state":
      return "experience_state";
    default:
      return "other";
  }
}

/** Accept legacy `string[]` citations or structured objects; coerce to `AiCitation[]`. */
export function normaliseCitations(raw: unknown): AiCitation[] {
  if (!Array.isArray(raw)) return [];
  const out: AiCitation[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const id = item.trim();
      if (id) out.push({ sourceType: "other", sourceId: id });
      continue;
    }
    if (isRecord(item)) {
      const sourceId =
        typeof item.sourceId === "string"
          ? item.sourceId.trim()
          : typeof item.evidenceId === "string"
            ? (item.evidenceId as string).trim()
            : typeof item.id === "string"
              ? (item.id as string).trim()
              : "";
      if (!sourceId) continue;
      const rawType = typeof item.sourceType === "string" ? item.sourceType : "other";
      out.push({
        sourceType: isAiCitationSourceType(rawType) ? rawType : "other",
        sourceId,
        excerpt: typeof item.excerpt === "string" ? item.excerpt : undefined,
        hash: typeof item.hash === "string" ? item.hash : undefined,
        label: typeof item.label === "string" ? item.label : undefined,
      });
    }
  }
  return out;
}

export type CitationEnforcementResult =
  | {
      ok: true;
      citations: AiCitation[];
      citationSourceIds: string[];
      flags: string[];
    }
  | {
      ok: false;
      reason: "insufficient_evidence" | "unknown_source";
      errors: string[];
      flags: string[];
    };

/**
 * Enforce the citation policy for a validated agent output against the exact
 * structured context supplied to the run.
 */
export function enforceCitations(input: {
  contractId: string;
  output: Record<string, unknown>;
  context: AiStructuredContext;
}): CitationEnforcementResult {
  const policy = getCitationPolicy(input.contractId);
  const citationClass: CitationClass = policy?.citationClass ?? "required";
  const field = policy?.field ?? "citations";
  const citations = normaliseCitations(input.output[field]);

  if (citationClass === "optional") {
    return {
      ok: true,
      citations,
      citationSourceIds: citations.map((c) => c.sourceId),
      flags: citations.length === 0 ? ["citation_optional"] : [],
    };
  }

  if (citations.length === 0) {
    return {
      ok: false,
      reason: "insufficient_evidence",
      errors: [
        `Citation required for contract ${input.contractId} but none were provided.`,
      ],
      flags: ["citation_required_missing"],
    };
  }

  const index = buildCitationIndex(input.context);
  const resolved: AiCitation[] = [];
  const unknown: string[] = [];

  for (const citation of citations) {
    if (index.ids.has(citation.sourceId)) {
      const indexedType = index.typeById.get(citation.sourceId);
      resolved.push({
        ...citation,
        sourceType: isAiCitationSourceType(indexedType ?? "")
          ? (indexedType as AiCitation["sourceType"])
          : citation.sourceType,
      });
    } else {
      unknown.push(citation.sourceId);
    }
  }

  if (resolved.length === 0) {
    return {
      ok: false,
      reason: "unknown_source",
      errors: [
        `Citations reference sources not supplied to this run: ${unknown.join(", ") || "(none resolvable)"}.`,
      ],
      flags: ["citation_unknown_source"],
    };
  }

  const flags: string[] = [];
  if (unknown.length > 0) flags.push("citation_partial_unknown");

  return {
    ok: true,
    citations: resolved,
    citationSourceIds: resolved.map((c) => c.sourceId),
    flags,
  };
}

/** Short human-readable citation labels for calm UI surfacing. */
export function formatCitationLabels(citations: AiCitation[]): string[] {
  return citations.map((c) => {
    const base = `${citationTypeLabel(c.sourceType)}: ${c.sourceId}`;
    return c.label ? `${c.label} (${base})` : base;
  });
}

function citationTypeLabel(sourceType: string): string {
  switch (sourceType) {
    case "evidence":
      return "Evidence";
    case "project":
      return "Project";
    case "observation":
      return "Observation";
    case "framework":
      return "Framework";
    case "org_snapshot":
      return "Org context";
    case "career_goal":
      return "Career goal";
    case "experience_state":
      return "Experience";
    case "artefact":
      return "Artefact";
    case "assessment":
      return "Assessment";
    case "task":
      return "Task";
    case "meeting":
      return "Meeting";
    default:
      return "Source";
  }
}
