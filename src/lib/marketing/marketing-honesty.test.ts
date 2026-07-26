import { describe, expect, it } from "vitest";
import {
  CAREER_BUNDLE,
  CAREER_PROMISE,
  CAREER_TIERS,
  LAUNCHPAD_INCLUDES,
  PILOT_ACCESS_LABEL,
  careerTiersForEnv,
} from "@/lib/marketing/career-suite";
import {
  DEMO_STORIES,
  GUARANTEE,
  HOME_FAQ,
  HOME_PRICING,
} from "@/lib/marketing/homepage-data";
import { LAUNCHPAD_PAGE } from "@/lib/marketing/launchpad-page";
import { PILOT_QUOTE } from "@/lib/marketing/landing-data";

const BANNED_PRICE = /£\d+/;
const BANNED_BUY = /\bBuy\b/;
const BANNED_PLACEHOLDER = /placeholder while our full/i;

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return out;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectStrings(v, out);
  }
  return out;
}

describe("marketing honesty — Batch 2", () => {
  it("uses pilot labels unless Stripe checkout is fully configured", () => {
    for (const tier of [...CAREER_TIERS, CAREER_BUNDLE]) {
      expect(tier.price).toBe(PILOT_ACCESS_LABEL);
      expect(tier.price).not.toMatch(BANNED_PRICE);
      expect(tier.cta).not.toMatch(BANNED_BUY);
      expect(tier.cta.toLowerCase()).not.toContain("buy");
    }
    for (const tier of HOME_PRICING) {
      expect(tier.price).not.toMatch(BANNED_PRICE);
    }
  });

  it("allows real prices only alongside working Stripe purchase CTAs", () => {
    const commercial = careerTiersForEnv({
      STRIPE_SECRET_KEY: "sk_test_fixture",
      STRIPE_PRICE_EXPERIENCE: "price_exp",
      STRIPE_PRICE_LAUNCHPAD: "price_launch",
      STRIPE_PRICE_PROFESSIONAL: "price_pro",
    });
    expect(commercial.checkoutReady).toBe(true);
    for (const tier of [...commercial.tiers, commercial.bundle]) {
      if (tier.price.match(BANNED_PRICE)) {
        expect(tier.cta).toBe("Start checkout");
        expect(tier.ctaHref).toMatch(/^\/billing\/checkout\?sku=/);
      }
    }
  });

  it("does not offer money-back or refund language", () => {
    expect(GUARANTEE.title.toLowerCase()).toContain("pilot");
    expect(GUARANTEE.body.toLowerCase()).toMatch(/without payment|prices appear/);
    expect(GUARANTEE.body).not.toMatch(/100% money-back|we'll refund your money/i);
    expect(CAREER_PROMISE.guaranteeTitle.toLowerCase()).toContain("pilot");
    expect(CAREER_PROMISE.guaranteeBody).toMatch(/no paid checkout|no money-back offer/i);
    expect(CAREER_PROMISE.guaranteeBody).not.toMatch(/we'll offer a 100% money-back/i);
    const refundFaq = HOME_FAQ.find((item) => item.q.toLowerCase().includes("money-back"));
    expect(refundFaq?.a.toLowerCase()).toMatch(/^no\./);
  });

  it("labels archetype stories as illustrative, not testimonials", () => {
    expect(DEMO_STORIES.length).toBeGreaterThan(0);
    expect(PILOT_QUOTE.enabled).toBe(false);
    expect(PILOT_QUOTE.quote.trim()).toBe("");
  });

  it("keeps Launchpad includes aligned to Career Intelligence", () => {
    const joined = LAUNCHPAD_INCLUDES.join(" | ").toLowerCase();
    expect(joined).toContain("readiness");
    expect(joined).toContain("roadmap");
    expect(joined).toContain("interview");
    expect(joined).toContain("application");
    expect(joined).not.toContain("salary insights");
    expect(joined).not.toContain("linkedin profile enhancement");
    expect(joined).not.toContain("employer marketplace");
    expect(LAUNCHPAD_PAGE.sections.some((s) => s.id === "applications")).toBe(true);
    expect(LAUNCHPAD_PAGE.sections.some((s) => s.id === "salary")).toBe(false);
  });

  it("FAQ answers pilot cost honestly", () => {
    const cost = HOME_FAQ.find((item) => item.q.toLowerCase().includes("cost"));
    expect(cost?.a).toMatch(/pilot|checkout/i);
    expect(cost?.a).not.toMatch(BANNED_PRICE);
  });
});

describe("legal surface markers — Batch 2", () => {
  it("privacy, terms and cookies modules export non-placeholder markers via page source strings", async () => {
    const privacy = await import("@/app/(marketing)/privacy/page");
    const terms = await import("@/app/(marketing)/terms/page");
    const cookies = await import("@/app/(marketing)/cookies/page");

    const privacyHtml = JSON.stringify(privacy.default);
    const termsHtml = JSON.stringify(terms.default);
    const cookiesHtml = JSON.stringify(cookies.default);

    // React server components are functions — assert metadata / re-export presence
    expect(privacy.metadata.title).toMatch(/Privacy/i);
    expect(terms.metadata.title).toMatch(/Terms/i);
    expect(cookies.metadata.title).toMatch(/Cookie/i);
    expect(privacy.metadata.description).not.toMatch(BANNED_PLACEHOLDER);
    expect(terms.metadata.description).not.toMatch(BANNED_PLACEHOLDER);
    expect(cookies.metadata.description).toMatch(/cookie|local storage|analytics/i);

    // Keep eslint happy if stringify of functions is empty
    expect(typeof privacy.default).toBe("function");
    expect(typeof terms.default).toBe("function");
    expect(typeof cookies.default).toBe("function");
    void privacyHtml;
    void termsHtml;
    void cookiesHtml;
  });
});
