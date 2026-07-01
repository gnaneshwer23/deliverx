import { describe, expect, it } from "vitest";
import {
  buildBusinessCaseIndustryContext,
  businessCaseIndustryPromptBlock,
  businessCaseUploadCopy,
  resolveBusinessCaseIndustryKey,
} from "./business-case-industry";

describe("resolveBusinessCaseIndustryKey", () => {
  it("maps onboarding healthcare industry", () => {
    expect(resolveBusinessCaseIndustryKey({ industry: "Healthcare" })).toBe("healthcare");
  });

  it("maps financial services to fintech", () => {
    expect(resolveBusinessCaseIndustryKey({ industry: "Financial Services" })).toBe("fintech");
  });

  it("maps custom Other values like Higher Education", () => {
    expect(resolveBusinessCaseIndustryKey({ industry: "Higher Education" })).toBe("education");
  });

  it("uses healthcare delivery type as hint", () => {
    expect(
      resolveBusinessCaseIndustryKey({
        industry: "Technology",
        deliveryType: "Healthcare Transformation",
      }),
    ).toBe("healthcare");
  });

  it("falls back to enterprise for unknown industry", () => {
    expect(resolveBusinessCaseIndustryKey({ industry: "Manufacturing" })).toBe("enterprise");
    expect(resolveBusinessCaseIndustryKey({ industry: null })).toBe("enterprise");
  });
});

describe("buildBusinessCaseIndustryContext", () => {
  it("includes FHIR-oriented snippet for healthcare", () => {
    const ctx = buildBusinessCaseIndustryContext({ industry: "Healthcare" });
    expect(ctx.key).toBe("healthcare");
    expect(ctx.promptSnippet).toMatch(/FHIR/i);
  });

  it("includes PCI snippet for fintech", () => {
    const ctx = buildBusinessCaseIndustryContext({ industry: "Financial Services" });
    expect(ctx.promptSnippet).toMatch(/PCI/i);
  });

  it("includes SHAKTI snippet for education", () => {
    const ctx = buildBusinessCaseIndustryContext({ industry: "Higher Education" });
    expect(ctx.promptSnippet).toMatch(/SHAKTI/i);
  });
});

describe("businessCaseIndustryPromptBlock", () => {
  it("appends delivery type when provided", () => {
    const block = businessCaseIndustryPromptBlock({
      industry: "Public Sector",
      deliveryType: "Digital Transformation",
    });
    expect(block).toMatch(/Public Sector/i);
    expect(block).toMatch(/Digital Transformation/);
  });
});

describe("businessCaseUploadCopy", () => {
  it("uses org label in headline for known sectors", () => {
    const copy = businessCaseUploadCopy({ industry: "Healthcare" });
    expect(copy.headline).toBe("Healthcare business case");
    expect(copy.helper).toMatch(/compliance/i);
  });

  it("keeps generic headline for enterprise fallback", () => {
    const copy = businessCaseUploadCopy({ industry: "Retail" });
    expect(copy.headline).toBe("Drop your business case here");
  });
});
