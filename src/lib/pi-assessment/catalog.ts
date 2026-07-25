/**
 * Baseline assessment catalog for pm-core pilot.
 * Prefer pi_cf_assessment_content when available; fall back to this pinned set
 * so local/dev without migration 0077 seed still works.
 */

import type { AssessmentCatalogItem, AssessmentItemKind } from "@/lib/pi-assessment/types";
import { PM_CORE_FINAL_CATALOG } from "@/lib/pi-assessment/transfer-catalog";

/** In-code fallback catalog — mirrors 0077 seed; not a second SoT for scoring. */
export const PM_CORE_BASELINE_CATALOG: AssessmentCatalogItem[] = [
  {
    slug: "interview-stakeholder-tradeoff",
    kind: "interview",
    title: "Stakeholder trade-off interview",
    prompt:
      "Describe a time you had to choose between two important stakeholder needs. What did you decide, and why?",
    competencyCodes: ["comp.stakeholder_management"],
    indicatorCodes: ["ind.stakeholder_judgement"],
    sortOrder: 10,
    cfKind: "question",
  },
  {
    slug: "interview-delivery-constraint",
    kind: "interview",
    title: "Delivery under constraint interview",
    prompt:
      "A critical launch date slips by two weeks. Walk through how you would re-plan scope, communication, and risk.",
    competencyCodes: ["comp.delivery_execution"],
    indicatorCodes: ["ind.delivery_judgement"],
    sortOrder: 11,
    cfKind: "question",
  },
  {
    slug: "interview-discovery-hypothesis",
    kind: "interview",
    title: "Discovery hypothesis interview",
    prompt:
      "You suspect users abandon onboarding because of unclear value. How would you form and test a hypothesis before building?",
    competencyCodes: ["comp.product_discovery"],
    indicatorCodes: ["ind.discovery_practice"],
    sortOrder: 12,
    cfKind: "question",
  },
  {
    slug: "conflicting-stakeholders",
    kind: "scenario",
    title: "Conflicting stakeholder asks",
    prompt:
      "Two executives disagree on scope and timeline. Decide how to proceed. State your decision, trade-offs, and how you would communicate it.",
    competencyCodes: ["comp.stakeholder_management"],
    indicatorCodes: ["ind.stakeholder_judgement"],
    sortOrder: 19,
    cfKind: "scenario",
  },
  {
    slug: "scope-cut-under-pressure",
    kind: "scenario",
    title: "Scope cut under executive pressure",
    prompt:
      "Engineering says the committed feature set cannot ship. Sales has already promised it. Decide what to cut, what to keep, and how you communicate.",
    competencyCodes: ["comp.delivery_execution", "comp.stakeholder_management"],
    indicatorCodes: ["ind.delivery_judgement", "ind.stakeholder_judgement"],
    sortOrder: 20,
    cfKind: "scenario",
  },
  {
    slug: "discovery-pivot-signal",
    kind: "scenario",
    title: "Discovery pivot signal",
    prompt:
      "Five customer interviews contradict the roadmap assumption. Decide whether to pivot, dig deeper, or stay the course — and what evidence would change your mind.",
    competencyCodes: ["comp.product_discovery"],
    indicatorCodes: ["ind.discovery_practice"],
    sortOrder: 21,
    cfKind: "scenario",
  },
  {
    slug: "one-pager-decision",
    kind: "work_sample",
    title: "Decision one-pager work sample",
    prompt:
      "Paste or upload a short decision record / one-pager (problem, options, recommendation, risks). If you do not have one, draft a concise sample for a product decision you know well.",
    competencyCodes: ["comp.delivery_execution", "comp.product_discovery"],
    indicatorCodes: ["ind.delivery_judgement", "ind.discovery_practice"],
    acceptsUpload: true,
    sortOrder: 30,
    cfKind: "work_sample",
  },
  {
    slug: "reflection-evidence-limits",
    kind: "reflection",
    title: "Reflection on evidence limits",
    prompt:
      "Looking back at your answers: which claims feel strongest, which are thin, and what practice would produce better evidence? This is self-report — not a verified level.",
    competencyCodes: [
      "comp.stakeholder_management",
      "comp.delivery_execution",
      "comp.product_discovery",
    ],
    indicatorCodes: [
      "ind.stakeholder_judgement",
      "ind.delivery_judgement",
      "ind.discovery_practice",
    ],
    sortOrder: 40,
    cfKind: "question",
  },
];

function mapCfKindToItemKind(
  cfKind: string,
  payload: Record<string, unknown>,
): AssessmentItemKind {
  const tagged = payload.itemKind;
  if (
    tagged === "interview" ||
    tagged === "scenario" ||
    tagged === "work_sample" ||
    tagged === "reflection" ||
    tagged === "decision" ||
    tagged === "transfer"
  ) {
    return tagged;
  }
  if (cfKind === "scenario") return "scenario";
  if (cfKind === "work_sample") return "work_sample";
  if (cfKind === "transfer_task") return "transfer";
  return "interview";
}

/**
 * Load assessment content for a published framework version.
 * Falls back to the in-code pm-core catalog when DB content is missing/thin.
 */
export async function loadAssessmentCatalog(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { from: (table: string) => any },
  opts: { frameworkVersionId: string | null; frameworkSlug: string },
): Promise<{ items: AssessmentCatalogItem[]; source: "db" | "in_code" }> {
  if (!opts.frameworkVersionId) {
    return { items: [...PM_CORE_BASELINE_CATALOG], source: "in_code" };
  }

  const { data: rows, error } = await supabase
    .from("pi_cf_assessment_content")
    .select(
      "id, kind, slug, title, body, payload, competency_ids, indicator_ids, sort_order",
    )
    .eq("framework_version_id", opts.frameworkVersionId)
    .order("sort_order", { ascending: true });

  if (error || !rows?.length) {
    return { items: [...PM_CORE_BASELINE_CATALOG], source: "in_code" };
  }

  const competencyIds = [
    ...new Set(rows.flatMap((r: { competency_ids?: string[] }) => r.competency_ids ?? [])),
  ];
  const indicatorIds = [
    ...new Set(rows.flatMap((r: { indicator_ids?: string[] }) => r.indicator_ids ?? [])),
  ];

  const [{ data: comps }, { data: inds }] = await Promise.all([
    competencyIds.length
      ? supabase
          .from("pi_cf_competencies")
          .select("id, code")
          .in("id", competencyIds)
      : Promise.resolve({ data: [] }),
    indicatorIds.length
      ? supabase.from("pi_cf_indicators").select("id, code").in("id", indicatorIds)
      : Promise.resolve({ data: [] }),
  ]);

  const compById = new Map(
    (comps ?? []).map((c: { id: string; code: string }) => [c.id, c.code]),
  );
  const indById = new Map(
    (inds ?? []).map((i: { id: string; code: string }) => [i.id, i.code]),
  );

  const items: AssessmentCatalogItem[] = rows.map(
    (r: {
      id: string;
      kind: string;
      slug: string;
      title: string;
      body: string;
      payload: Record<string, unknown> | null;
      competency_ids: string[] | null;
      indicator_ids: string[] | null;
      sort_order: number;
    }) => {
      const payload = (r.payload ?? {}) as Record<string, unknown>;
      const kind = mapCfKindToItemKind(r.kind, payload);
      return {
        slug: r.slug,
        kind,
        title: r.title,
        prompt: r.body || r.title,
        competencyCodes: (r.competency_ids ?? [])
          .map((id) => compById.get(id))
          .filter((c): c is string => Boolean(c)),
        indicatorCodes: (r.indicator_ids ?? [])
          .map((id) => indById.get(id))
          .filter((c): c is string => Boolean(c)),
        catalogRef: `pi_cf_assessment_content:${r.id}`,
        acceptsUpload: Boolean(payload.acceptsUpload) || kind === "work_sample",
        sortOrder: r.sort_order ?? 0,
        cfKind: r.kind as AssessmentCatalogItem["cfKind"],
        industry:
          typeof payload.industry === "string" ? payload.industry : undefined,
        phase:
          payload.phase === "final" || payload.phase === "baseline"
            ? payload.phase
            : undefined,
      };
    },
  );

  // Prefer baseline-tagged items; if none, keep all for the framework version.
  const baselineTagged = items.filter((i) => {
    const row = rows.find((r: { slug: string }) => r.slug === i.slug) as
      | { payload?: Record<string, unknown> }
      | undefined;
    const phase = row?.payload?.phase;
    return phase === "baseline" || (Boolean(row?.payload?.itemKind) && phase !== "final");
  });

  const selected = baselineTagged.length >= 4 ? baselineTagged : items;
  if (selected.length < 4 && opts.frameworkSlug === "pm-core") {
    return { items: [...PM_CORE_BASELINE_CATALOG], source: "in_code" };
  }

  return { items: selected, source: "db" };
}

/**
 * Load final/transfer assessment content for a published framework version.
 * Falls back to in-code transfer catalog when DB content is missing/thin.
 */
export async function loadFinalAssessmentCatalog(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { from: (table: string) => any },
  opts: { frameworkVersionId: string | null; frameworkSlug: string },
): Promise<{ items: AssessmentCatalogItem[]; source: "db" | "in_code" }> {
  if (!opts.frameworkVersionId) {
    return { items: [...PM_CORE_FINAL_CATALOG], source: "in_code" };
  }

  const { data: rows, error } = await supabase
    .from("pi_cf_assessment_content")
    .select(
      "id, kind, slug, title, body, payload, competency_ids, indicator_ids, sort_order",
    )
    .eq("framework_version_id", opts.frameworkVersionId)
    .order("sort_order", { ascending: true });

  if (error || !rows?.length) {
    return { items: [...PM_CORE_FINAL_CATALOG], source: "in_code" };
  }

  const competencyIds = [
    ...new Set(rows.flatMap((r: { competency_ids?: string[] }) => r.competency_ids ?? [])),
  ];
  const indicatorIds = [
    ...new Set(rows.flatMap((r: { indicator_ids?: string[] }) => r.indicator_ids ?? [])),
  ];

  const [{ data: comps }, { data: inds }] = await Promise.all([
    competencyIds.length
      ? supabase
          .from("pi_cf_competencies")
          .select("id, code")
          .in("id", competencyIds)
      : Promise.resolve({ data: [] }),
    indicatorIds.length
      ? supabase.from("pi_cf_indicators").select("id, code").in("id", indicatorIds)
      : Promise.resolve({ data: [] }),
  ]);

  const compById = new Map(
    (comps ?? []).map((c: { id: string; code: string }) => [c.id, c.code]),
  );
  const indById = new Map(
    (inds ?? []).map((i: { id: string; code: string }) => [i.id, i.code]),
  );

  const items: AssessmentCatalogItem[] = (
    rows as Array<{
      id: string;
      kind: string;
      slug: string;
      title: string;
      body: string;
      payload: Record<string, unknown> | null;
      competency_ids: string[] | null;
      indicator_ids: string[] | null;
      sort_order: number;
    }>
  )
    .map((r) => {
      const payload = (r.payload ?? {}) as Record<string, unknown>;
      if (payload.phase !== "final" && r.kind !== "transfer_task") return null;
      const kind = mapCfKindToItemKind(r.kind, payload);
      const item: AssessmentCatalogItem = {
        slug: r.slug,
        kind,
        title: r.title,
        prompt: r.body || r.title,
        competencyCodes: (r.competency_ids ?? [])
          .map((id) => compById.get(id))
          .filter((c): c is string => Boolean(c)),
        indicatorCodes: (r.indicator_ids ?? [])
          .map((id) => indById.get(id))
          .filter((c): c is string => Boolean(c)),
        catalogRef: `pi_cf_assessment_content:${r.id}`,
        acceptsUpload: Boolean(payload.acceptsUpload) || kind === "work_sample",
        sortOrder: r.sort_order ?? 0,
        cfKind: r.kind as AssessmentCatalogItem["cfKind"],
        industry: typeof payload.industry === "string" ? payload.industry : undefined,
        phase: "final",
      };
      return item;
    })
    .filter((i): i is AssessmentCatalogItem => i !== null);

  if (items.length < 3 && opts.frameworkSlug === "pm-core") {
    return { items: [...PM_CORE_FINAL_CATALOG], source: "in_code" };
  }

  return { items, source: "db" };
}
