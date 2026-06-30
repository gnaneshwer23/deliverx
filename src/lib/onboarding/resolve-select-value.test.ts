import { describe, expect, it } from "vitest";
import {
  OTHER_OPTION,
  OTHER_SPEC_MAX_LENGTH,
  resolveSelectWithOther,
  validateOrganisationFormInput,
} from "@/lib/onboarding/resolve-select-value";

describe("resolveSelectWithOther", () => {
  it("returns the selected value when not Other", () => {
    expect(resolveSelectWithOther("Healthcare", null, "Industry")).toEqual({
      value: "Healthcare",
    });
  });

  it("returns null when nothing is selected", () => {
    expect(resolveSelectWithOther("", null, "Industry")).toEqual({ value: null });
  });

  it("requires a specification when Other is selected", () => {
    expect(resolveSelectWithOther(OTHER_OPTION, "  ", "Industry")).toEqual({
      value: null,
      error: "Tell us your industry when you choose Other.",
    });
  });

  it("stores the custom value when Other is specified", () => {
    expect(resolveSelectWithOther(OTHER_OPTION, " Higher Education ", "Industry")).toEqual({
      value: "Higher Education",
    });
  });

  it("rejects overly long Other values", () => {
    const long = "x".repeat(OTHER_SPEC_MAX_LENGTH + 1);
    expect(resolveSelectWithOther(OTHER_OPTION, long, "Delivery type")).toEqual({
      value: null,
      error: `Delivery type must be ${OTHER_SPEC_MAX_LENGTH} characters or fewer.`,
    });
  });
});

describe("validateOrganisationFormInput", () => {
  it("requires organisation name", () => {
    expect(
      validateOrganisationFormInput({
        name: "  ",
        industry: "Technology",
        industryOther: null,
        teamSize: "1-10",
        deliveryType: "Product Delivery",
        deliveryTypeOther: null,
      }),
    ).toEqual({ ok: false, error: "Organisation name is required." });
  });

  it("resolves Other fields into stored values", () => {
    const result = validateOrganisationFormInput({
      name: "Acme Delivery Office",
      industry: OTHER_OPTION,
      industryOther: "Defence",
      teamSize: "20-50",
      deliveryType: OTHER_OPTION,
      deliveryTypeOther: "ERP rollout",
    });

    expect(result).toEqual({
      ok: true,
      resolved: {
        name: "Acme Delivery Office",
        industry: "Defence",
        teamSize: "20-50",
        deliveryType: "ERP rollout",
      },
    });
  });

  it("blocks submit when delivery type Other is missing a specification", () => {
    expect(
      validateOrganisationFormInput({
        name: "Acme Delivery Office",
        industry: "Public Sector",
        industryOther: null,
        teamSize: null,
        deliveryType: OTHER_OPTION,
        deliveryTypeOther: "",
      }),
    ).toEqual({
      ok: false,
      error: "Tell us your delivery type when you choose Other.",
    });
  });
});
