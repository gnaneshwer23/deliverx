import { describe, expect, it } from "vitest";
import {
  normalizeDomain,
  parseDomainList,
  parseEmailDomain,
  runSsoEngineSmokeTest,
  validateSsoSettings,
} from "./ssoEngine";

describe("ssoEngine", () => {
  it("passes smoke test", () => {
    const result = runSsoEngineSmokeTest();
    expect(result.ok).toBe(true);
    expect(result.sampleDomain).toBe("acme-corp.com");
  });

  it("parses email domains", () => {
    expect(parseEmailDomain("Alex@Company.COM")).toBe("company.com");
    expect(parseEmailDomain("invalid")).toBeNull();
  });

  it("normalizes domain lists", () => {
    expect(parseDomainList(" acme.com , ACME.com\nnhs.uk ")).toEqual(["acme.com", "nhs.uk"]);
    expect(normalizeDomain("@example.org")).toBe("example.org");
  });

  it("validates SSO settings", () => {
    expect(validateSsoSettings({ enabled: false, allowedDomains: [] }).ok).toBe(true);
    expect(validateSsoSettings({ enabled: true, allowedDomains: [] }).ok).toBe(false);
    expect(validateSsoSettings({ enabled: true, allowedDomains: ["acme.com"] }).ok).toBe(true);
  });
});
