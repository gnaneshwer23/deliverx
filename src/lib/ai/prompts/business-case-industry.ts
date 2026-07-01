/**
 * Organisation industry → business case AI + UI context (G6).
 * Org onboarding field is the source of truth; unknown values fall back to enterprise.
 */

export type BusinessCaseIndustryKey =
  | "healthcare"
  | "education"
  | "fintech"
  | "public_sector"
  | "enterprise";

export type BusinessCaseIndustryContext = {
  key: BusinessCaseIndustryKey;
  label: string;
  promptSnippet: string;
  uploadHeadline: string;
  uploadHelper: string;
  uploadPlaceholder: string;
  uploadTip: string;
};

export type OrganisationIndustryInput = {
  industry?: string | null;
  deliveryType?: string | null;
};

const INDUSTRY_CONTEXT: Record<BusinessCaseIndustryKey, Omit<BusinessCaseIndustryContext, "key">> = {
  healthcare: {
    label: "Healthcare",
    promptSnippet: [
      "Organisation industry: Healthcare.",
      "Tailor extraction and RAID seeds for clinical safety, patient data governance (UK GDPR / Caldicott),",
      "interoperability (FHIR, HL7, SNOMED), and NHS-style assurance (DSPT, DTAC where relevant).",
      "Flag integration risks with EHR/EPR, PAS, and regional shared care records.",
    ].join(" "),
    uploadHeadline: "Healthcare business case",
    uploadHelper:
      "We'll tailor requirements, compliance (IG/Caldicott), and RAID patterns for clinical delivery.",
    uploadPlaceholder:
      "Paste scope, clinical stakeholders, IG constraints, interoperability needs, success criteria…",
    uploadTip:
      "Healthcare BC — AI extracts requirements with clinical safety, FHIR/interoperability, and compliance in mind.",
  },
  education: {
    label: "Education",
    promptSnippet: [
      "Organisation industry: Education.",
      "Tailor extraction for academic governance, student data protection, accessibility (WCAG),",
      "and sector frameworks (e.g. SHAKTI for HE digital, Ofsted/regulatory reporting where relevant).",
      "Emphasise term-time delivery windows, multi-campus rollout, and stakeholder groups (SMT, faculty, students).",
    ].join(" "),
    uploadHeadline: "Education business case",
    uploadHelper:
      "We'll tailor requirements, student-data safeguards, and RAID patterns for academic delivery.",
    uploadPlaceholder:
      "Paste scope, academic stakeholders, term constraints, accessibility needs, success criteria…",
    uploadTip:
      "Education BC — AI extracts requirements with SHAKTI-style governance and student-data protection in mind.",
  },
  fintech: {
    label: "Financial Services",
    promptSnippet: [
      "Organisation industry: Financial Services.",
      "Tailor extraction for regulatory compliance (FCA/PRA, PCI-DSS for payments), fraud/AML controls,",
      "audit trails, and operational resilience. Emphasise third-party/vendor risk and change control.",
    ].join(" "),
    uploadHeadline: "Financial services business case",
    uploadHelper:
      "We'll tailor requirements, regulatory controls (PCI/FCA), and RAID patterns for regulated delivery.",
    uploadPlaceholder:
      "Paste scope, regulatory constraints, payment/data flows, stakeholders, success criteria…",
    uploadTip:
      "Fintech BC — AI extracts requirements with PCI-DSS, auditability, and regulatory RAID patterns in mind.",
  },
  public_sector: {
    label: "Public Sector",
    promptSnippet: [
      "Organisation industry: Public Sector.",
      "Tailor extraction for GDS service standards, accessibility (WCAG 2.2 AA), procurement (CCS frameworks),",
      "and transparency/accountability. Flag ministerial or committee dependencies and SIRO/DPO governance.",
    ].join(" "),
    uploadHeadline: "Public sector business case",
    uploadHelper:
      "We'll tailor requirements, GDS standards, and RAID patterns for government delivery.",
    uploadPlaceholder:
      "Paste scope, policy owners, accessibility targets, procurement constraints, success criteria…",
    uploadTip:
      "Public sector BC — AI extracts requirements with GDS, accessibility, and accountability patterns in mind.",
  },
  enterprise: {
    label: "Enterprise",
    promptSnippet: [
      "Organisation industry: Enterprise (general commercial delivery).",
      "Tailor extraction for standard programme governance: scope boundaries, benefits realisation,",
      "vendor/SI dependencies, and executive steering. Use pragmatic RAID and requirement patterns.",
    ].join(" "),
    uploadHeadline: "Drop your business case here",
    uploadHelper:
      "Works with any business case format — AI extracts requirements, gaps, and risks into the Review Queue.",
    uploadPlaceholder: "Paste scope, budget, stakeholders, and success criteria…",
    uploadTip:
      "Works with any business case format — AI extracts requirements, gaps, and risks into the Review Queue. Nothing is applied until you approve it.",
  },
};

function normalizeIndustryText(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/** Map org onboarding industry (+ delivery type hints) to a prompt key. */
export function resolveBusinessCaseIndustryKey(
  input: OrganisationIndustryInput,
): BusinessCaseIndustryKey {
  const industry = normalizeIndustryText(input.industry);
  const delivery = normalizeIndustryText(input.deliveryType);

  if (
    industry.includes("health") ||
    industry.includes("nhs") ||
    industry.includes("clinical") ||
    delivery.includes("healthcare")
  ) {
    return "healthcare";
  }

  if (
    industry.includes("education") ||
    industry.includes("university") ||
    industry.includes("higher ed") ||
    industry.includes("school") ||
    industry.includes("academic")
  ) {
    return "education";
  }

  if (
    industry.includes("financial") ||
    industry.includes("fintech") ||
    industry.includes("bank") ||
    industry.includes("insurance") ||
    industry.includes("payment")
  ) {
    return "fintech";
  }

  if (
    industry.includes("public sector") ||
    industry.includes("government") ||
    industry.includes("council") ||
    industry.includes("civil service")
  ) {
    return "public_sector";
  }

  if (industry === "healthcare") return "healthcare";
  if (industry === "financial services") return "fintech";
  if (industry === "public sector") return "public_sector";

  return "enterprise";
}

export function buildBusinessCaseIndustryContext(
  input: OrganisationIndustryInput,
): BusinessCaseIndustryContext {
  const key = resolveBusinessCaseIndustryKey(input);
  const base = INDUSTRY_CONTEXT[key];
  return { key, ...base };
}

/** Prompt block injected into business case review / extraction. */
export function businessCaseIndustryPromptBlock(input: OrganisationIndustryInput): string {
  const ctx = buildBusinessCaseIndustryContext(input);
  const lines = [ctx.promptSnippet];
  if (input.deliveryType?.trim()) {
    lines.push(`Organisation delivery type: ${input.deliveryType.trim()}.`);
  }
  return lines.join("\n");
}

/** UI copy for upload zones — uses org label when set. */
export function businessCaseUploadCopy(input: OrganisationIndustryInput): {
  headline: string;
  helper: string;
  placeholder: string;
  tip: string;
  industryLabel: string;
} {
  const ctx = buildBusinessCaseIndustryContext(input);
  const orgLabel = input.industry?.trim();
  const headline =
    orgLabel && ctx.key !== "enterprise"
      ? `${orgLabel} business case`
      : ctx.uploadHeadline;

  return {
    headline,
    helper: ctx.uploadHelper,
    placeholder: ctx.uploadPlaceholder,
    tip: ctx.uploadTip,
    industryLabel: orgLabel || ctx.label,
  };
}
