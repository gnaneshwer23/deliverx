import { describe, expect, it } from "vitest";
import { defaultPortfolioName, FALLBACK_PORTFOLIO_NAME } from "./portfolio-default";

describe("portfolio-default", () => {
  it("uses org name when present", () => {
    expect(defaultPortfolioName("Acme Delivery")).toBe("Acme Delivery");
  });

  it("falls back when org name is empty", () => {
    expect(defaultPortfolioName("")).toBe(FALLBACK_PORTFOLIO_NAME);
    expect(defaultPortfolioName("   ")).toBe(FALLBACK_PORTFOLIO_NAME);
    expect(defaultPortfolioName(null)).toBe(FALLBACK_PORTFOLIO_NAME);
    expect(defaultPortfolioName(undefined)).toBe(FALLBACK_PORTFOLIO_NAME);
  });
});
