import { describe, expect, it } from "vitest";
import {
  isProductSuiteNavActive,
  productSuiteNav,
} from "./product-suite-nav";

describe("product suite navigation", () => {
  it.each([
    ["/hub", "hub"],
    ["/profile/evidence", "profile"],
    ["/learning", "profile"],
    ["/career/outcomes", "profile"],
    ["/experience/app", "experience"],
    ["/launchpad/app/interview", "launchpad"],
    ["/workspace/stakeholders", "workspace"],
    ["/project/123/tasks", "workspace"],
    ["/portfolio", "portfolio"],
  ])("marks %s as %s", (pathname, expectedId) => {
    const active = productSuiteNav.filter((item) =>
      isProductSuiteNavActive(item, pathname),
    );
    expect(active.map((item) => item.id)).toEqual([expectedId]);
  });

  it("keeps primary labels and destinations unique", () => {
    expect(new Set(productSuiteNav.map((item) => item.label)).size).toBe(
      productSuiteNav.length,
    );
    expect(new Set(productSuiteNav.map((item) => item.href)).size).toBe(
      productSuiteNav.length,
    );
  });
});
