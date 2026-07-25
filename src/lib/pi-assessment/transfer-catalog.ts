/**
 * Final assessment + transfer packs.
 * Transfer industries are deliberately outside Experience catalogue industries
 * so transfer validity is measurable (practice ≠ familiarity).
 */

import type {
  AssessmentCatalogItem,
  TransferIndustry,
} from "@/lib/pi-assessment/types";
import { TRANSFER_INDUSTRIES } from "@/lib/pi-assessment/types";

/** Experience catalogue industries (must not be used for transfer packs). */
export const EXPERIENCE_INDUSTRIES = [
  "healthcare",
  "education",
  "saas",
  "product_management",
  "project_management",
] as const;

export type ExperienceIndustryToken = (typeof EXPERIENCE_INDUSTRIES)[number];

/** In-code final + transfer catalog — mirrors 0081 seed. */
export const PM_CORE_FINAL_CATALOG: AssessmentCatalogItem[] = [
  {
    slug: "final-interview-post-project",
    kind: "interview",
    title: "Post-project reflection interview",
    prompt:
      "Looking back at your Experience project: what decision most changed the outcome, what evidence supported it, and what would you do differently under similar pressure?",
    competencyCodes: ["comp.stakeholder_management", "comp.delivery_execution"],
    indicatorCodes: ["ind.stakeholder_judgement", "ind.delivery_judgement"],
    sortOrder: 110,
    cfKind: "question",
    phase: "final",
  },
  {
    slug: "final-work-sample-independent",
    kind: "work_sample",
    title: "Independent work sample",
    prompt:
      "Paste a short decision record or one-pager from (or modelled on) your recent practice: problem, options, recommendation, risks, and how you would know you were wrong.",
    competencyCodes: ["comp.delivery_execution", "comp.product_discovery"],
    indicatorCodes: ["ind.delivery_judgement", "ind.discovery_practice"],
    acceptsUpload: true,
    sortOrder: 120,
    cfKind: "work_sample",
    phase: "final",
  },
  {
    slug: "transfer-civic-budget-cut",
    kind: "transfer",
    title: "Transfer: civic budget cut trade-off",
    prompt:
      "You are advising a city digital services team (not your Experience industry). Mid-year budget cut forces choosing between accessibility remediation and a mayor-facing dashboard. Decide, name trade-offs, and how you communicate to elected officials and engineering.",
    competencyCodes: ["comp.stakeholder_management", "comp.delivery_execution"],
    indicatorCodes: ["ind.stakeholder_judgement", "ind.delivery_judgement"],
    sortOrder: 130,
    cfKind: "transfer_task",
    industry: "civic_tech",
    phase: "final",
  },
  {
    slug: "transfer-fintech-compliance-hold",
    kind: "transfer",
    title: "Transfer: fintech compliance hold",
    prompt:
      "You join a payments startup (unfamiliar context). Compliance flags a launch feature 10 days before go-live. Sales has demos booked. Decide whether to delay, ship with controls, or cut scope — and how you brief the founder.",
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
    sortOrder: 131,
    cfKind: "transfer_task",
    industry: "fintech",
    phase: "final",
  },
  {
    slug: "transfer-logistics-route-pivot",
    kind: "transfer",
    title: "Transfer: logistics route discovery pivot",
    prompt:
      "A freight logistics platform (new industry for you) sees pilot customers reject the core routing assumption. Decide whether to pivot discovery, dig deeper, or stay the course — and what evidence would change your mind.",
    competencyCodes: ["comp.product_discovery"],
    indicatorCodes: ["ind.discovery_practice"],
    sortOrder: 132,
    cfKind: "transfer_task",
    industry: "logistics",
    phase: "final",
  },
  {
    slug: "transfer-retail-omnishop-cut",
    kind: "transfer",
    title: "Transfer: retail omnichannel scope cut",
    prompt:
      "A national retailer (different context) cannot ship both click-and-collect and loyalty redesign this quarter. Decide what to cut, what to keep, and how you communicate to store ops and the CMO.",
    competencyCodes: ["comp.delivery_execution", "comp.stakeholder_management"],
    indicatorCodes: ["ind.delivery_judgement", "ind.stakeholder_judgement"],
    sortOrder: 133,
    cfKind: "transfer_task",
    industry: "retail",
    phase: "final",
  },
  {
    slug: "final-reflection-transfer-limits",
    kind: "reflection",
    title: "Reflection on transfer limits",
    prompt:
      "Which parts of your answer relied on Experience familiarity versus transferable judgement? Where is evidence still thin? This is self-report — not a verified level.",
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
    sortOrder: 140,
    cfKind: "question",
    phase: "final",
  },
];

function normalizeIndustry(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

/**
 * True when the candidate industry collides with Experience practice industry.
 * Transfer packs use civic/fintech/logistics/retail — never Experience industries.
 */
export function industriesCollide(
  experienceIndustry: string | null | undefined,
  transferIndustry: string | null | undefined,
): boolean {
  const exp = normalizeIndustry(experienceIndustry);
  const transfer = normalizeIndustry(transferIndustry);
  if (!exp || !transfer) return false;
  if (exp === transfer) return true;
  // Fuzzy: healthcare vs health_tech etc.
  if (exp.includes(transfer) || transfer.includes(exp)) return true;
  return false;
}

/** Assert transfer industry is outside Experience catalogue and ≠ practised industry. */
export function assertValidTransferIndustry(input: {
  experienceIndustry: string | null | undefined;
  transferIndustry: string;
}): { ok: true } | { ok: false; reason: string } {
  const transfer = normalizeIndustry(input.transferIndustry);
  if (!(TRANSFER_INDUSTRIES as readonly string[]).includes(transfer)) {
    return {
      ok: false,
      reason: `Transfer industry "${input.transferIndustry}" is not a valid transfer pack (expected one of ${TRANSFER_INDUSTRIES.join(", ")}).`,
    };
  }
  if (
    (EXPERIENCE_INDUSTRIES as readonly string[]).includes(
      transfer as ExperienceIndustryToken,
    )
  ) {
    return {
      ok: false,
      reason: "Transfer industry must not be an Experience catalogue industry.",
    };
  }
  if (industriesCollide(input.experienceIndustry, transfer)) {
    return {
      ok: false,
      reason: `Transfer industry "${transfer}" collides with Experience industry "${input.experienceIndustry}".`,
    };
  }
  return { ok: true };
}

/**
 * Pick a transfer pack whose industry differs from the Experience industry.
 * Deterministic: stable sort by slug, then first non-colliding pack.
 */
export function selectTransferPack(input: {
  catalog: AssessmentCatalogItem[];
  experienceIndustry: string | null | undefined;
  preferredTransferIndustry?: TransferIndustry | null;
}): {
  pack: AssessmentCatalogItem;
  transferIndustry: TransferIndustry;
  reason: string;
} {
  const transfers = input.catalog
    .filter((i) => i.kind === "transfer" || i.cfKind === "transfer_task")
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));

  if (!transfers.length) {
    throw new Error("No transfer packs available in final assessment catalog");
  }

  if (input.preferredTransferIndustry) {
    const preferred = transfers.find(
      (t) => normalizeIndustry(t.industry) === input.preferredTransferIndustry,
    );
    if (preferred) {
      const check = assertValidTransferIndustry({
        experienceIndustry: input.experienceIndustry,
        transferIndustry: String(preferred.industry ?? input.preferredTransferIndustry),
      });
      if (check.ok) {
        return {
          pack: preferred,
          transferIndustry: input.preferredTransferIndustry,
          reason: `preferred_transfer:${input.preferredTransferIndustry}`,
        };
      }
    }
  }

  for (const pack of transfers) {
    const industry = normalizeIndustry(pack.industry) as TransferIndustry;
    const check = assertValidTransferIndustry({
      experienceIndustry: input.experienceIndustry,
      transferIndustry: industry || String(pack.industry ?? ""),
    });
    if (check.ok && industry) {
      return {
        pack,
        transferIndustry: industry,
        reason: `auto_transfer_differs_from_experience:${normalizeIndustry(input.experienceIndustry) || "none"}→${industry}`,
      };
    }
  }

  // Fallback: first transfer pack (still outside Experience catalogue by construction)
  const fallback = transfers[0]!;
  const industry = (normalizeIndustry(fallback.industry) ||
    "civic_tech") as TransferIndustry;
  return {
    pack: fallback,
    transferIndustry: industry,
    reason: `fallback_transfer:${industry}`,
  };
}

/** Build the ordered final session item list: interview → work_sample → transfer → reflection. */
export function selectFinalSessionItems(input: {
  catalog: AssessmentCatalogItem[];
  experienceIndustry: string | null | undefined;
  preferredTransferIndustry?: TransferIndustry | null;
}): {
  items: Array<AssessmentCatalogItem & { selectionReason: string }>;
  transferIndustry: TransferIndustry;
  experienceIndustry: string | null;
} {
  const interview =
    input.catalog.find((i) => i.kind === "interview" && i.phase !== "baseline") ??
    input.catalog.find((i) => i.kind === "interview");
  const workSample =
    input.catalog.find((i) => i.kind === "work_sample" && i.phase !== "baseline") ??
    input.catalog.find((i) => i.kind === "work_sample");
  const reflection =
    input.catalog.find((i) => i.kind === "reflection" && i.phase !== "baseline") ??
    input.catalog.find((i) => i.kind === "reflection");

  const { pack, transferIndustry, reason } = selectTransferPack(input);

  const items: Array<AssessmentCatalogItem & { selectionReason: string }> = [];
  if (interview) {
    items.push({
      ...interview,
      selectionReason: "final_post_project_interview|prompt_version:final-select-v1",
    });
  }
  if (workSample) {
    items.push({
      ...workSample,
      selectionReason: "final_independent_work_sample|prompt_version:final-select-v1",
    });
  }
  items.push({
    ...pack,
    selectionReason: `${reason}|prompt_version:final-select-v1`,
  });
  if (reflection) {
    items.push({
      ...reflection,
      selectionReason: "final_closing_reflection|prompt_version:final-select-v1",
    });
  }

  return {
    items,
    transferIndustry,
    experienceIndustry: input.experienceIndustry
      ? normalizeIndustry(input.experienceIndustry)
      : null,
  };
}
