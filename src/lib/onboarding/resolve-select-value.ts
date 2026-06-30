/** Shared validation for onboarding selects with an "Other" free-text option. */

export const OTHER_OPTION = "Other";
export const OTHER_SPEC_MAX_LENGTH = 120;

export function resolveSelectWithOther(
  selected: string | null | undefined,
  otherValue: string | null | undefined,
  fieldLabel: string,
): { value: string | null; error?: string } {
  const sel = String(selected ?? "").trim();
  if (!sel) return { value: null };
  if (sel !== OTHER_OPTION) return { value: sel };

  const spec = String(otherValue ?? "").trim();
  if (!spec) {
    return {
      value: null,
      error: `Tell us your ${fieldLabel.toLowerCase()} when you choose Other.`,
    };
  }
  if (spec.length > OTHER_SPEC_MAX_LENGTH) {
    return {
      value: null,
      error: `${fieldLabel} must be ${OTHER_SPEC_MAX_LENGTH} characters or fewer.`,
    };
  }
  return { value: spec };
}

export type OrganisationFormInput = {
  name: string;
  industry: string | null;
  industryOther: string | null;
  teamSize: string | null;
  deliveryType: string | null;
  deliveryTypeOther: string | null;
};

export function validateOrganisationFormInput(input: OrganisationFormInput): {
  ok: boolean;
  error?: string;
  resolved?: {
    name: string;
    industry: string | null;
    teamSize: string | null;
    deliveryType: string | null;
  };
} {
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Organisation name is required." };
  }

  const industryResult = input.industry
    ? resolveSelectWithOther(input.industry, input.industryOther, "Industry")
    : { value: null as string | null };
  if (industryResult.error) return { ok: false, error: industryResult.error };

  const deliveryResult = input.deliveryType
    ? resolveSelectWithOther(input.deliveryType, input.deliveryTypeOther, "Delivery type")
    : { value: null as string | null };
  if (deliveryResult.error) return { ok: false, error: deliveryResult.error };

  return {
    ok: true,
    resolved: {
      name,
      industry: industryResult.value,
      teamSize: input.teamSize?.trim() || null,
      deliveryType: deliveryResult.value,
    },
  };
}
