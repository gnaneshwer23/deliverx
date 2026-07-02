import { describe, expect, it } from "vitest";
import {
  clearSsoLookupCache,
  getCachedSsoLookup,
  setCachedSsoLookup,
} from "./sso-lookup-cache";

describe("sso-lookup-cache", () => {
  it("returns undefined on cache miss", () => {
    clearSsoLookupCache();
    expect(getCachedSsoLookup("acme.com")).toBeUndefined();
  });

  it("stores and retrieves SSO lookup results", () => {
    clearSsoLookupCache();
    setCachedSsoLookup("acme.com", {
      domain: "acme.com",
      idpName: "Okta",
      ssoRequired: true,
    });
    expect(getCachedSsoLookup("acme.com")).toEqual({
      domain: "acme.com",
      idpName: "Okta",
      ssoRequired: true,
    });
  });

  it("caches negative lookups", () => {
    clearSsoLookupCache();
    setCachedSsoLookup("example.com", null);
    expect(getCachedSsoLookup("example.com")).toBeNull();
  });
});
