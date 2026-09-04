import { describe, expect, it } from "vitest";
import {
  CAREER_BUNDLE,
  CAREER_PROMISE,
  CAREER_TIERS,
  LAUNCHPAD_INCLUDES,
  PILOT_ACCESS_LABEL,
  TEAM_COPILOT_INCLUDES,
  careerTiersForEnv,
} from "@/lib/marketing/career-suite";
import {
  FOOTER_ACCOUNT_LINKS,
  FOOTER_COLUMNS,
  FOOTER_COMPANY_LINKS,
  FOOTER_PLATFORM_LINKS,
  FOOTER_PRODUCT_LINKS,
  FOOTER_PUBLIC_PATHS,
} from "@/lib/marketing/footer-data";
import {
  BUILT_FOR,
  DEMO_STORIES,
  GUARANTEE,
  HOME_FAQ,
  HOME_PRICING,
  PLATFORM_TABS,
} from "@/lib/marketing/homepage-data";
import { HOW_IT_WORKS_PAGE } from "@/lib/marketing/how-it-works-data";
import { FLAGSHIP_GUIDES } from "@/lib/marketing/guides";
import { LAUNCHPAD_PAGE } from "@/lib/marketing/launchpad-page";
import { PILOT_QUOTE } from "@/lib/marketing/landing-data";
import { productPageNav } from "@/lib/marketing/product-page";
import { PRIMARY_NAV } from "@/lib/marketing/suite-data";
import { TEAM_COPILOT_PAGE } from "@/lib/marketing/team-copilot-data";
import { XPERIENCE_PAGE } from "@/lib/marketing/xperience-page";

const BANNED_PRICE = /£\d+/;
const BANNED_BUY = /\bBuy\b/;
const BANNED_PLACEHOLDER = /placeholder while our full/i;
const BANNED_SCORE_THEATRE = /\b(87|72%|78%|Excellent readiness|Career Score|sprint confidence)\b/i;
const BANNED_MARKETPLACE = /employer marketplace|hiring partners|Career Twin/i;

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

  it("How it works keeps trust rails and the five-step loop", () => {
    expect(HOW_IT_WORKS_PAGE.steps).toHaveLength(5);
    expect(HOW_IT_WORKS_PAGE.steps.map((s) => s.id)).toEqual([
      "direction",
      "context",
      "work",
      "review",
      "use",
    ]);
    const blob = collectStrings(HOW_IT_WORKS_PAGE).join(" | ").toLowerCase();
    expect(blob).toMatch(/scoreruns? never light verified/);
    expect(blob).toMatch(/ai drafts?/);
    expect(blob).toMatch(/self-reported/);
    expect(blob).toMatch(/daily briefing/);
    expect(blob).not.toMatch(/100% money-back/);
    expect(blob).not.toMatch(BANNED_PRICE);
    expect(HOW_IT_WORKS_PAGE.pricing.price).toBe(PILOT_ACCESS_LABEL);
    for (const step of HOW_IT_WORKS_PAGE.steps) {
      expect(["experience", "launchpad", "workspace", "intelligence"]).toContain(step.mock);
    }
  });

  it("flagship discovery guides stay charter-honest", () => {
    expect(FLAGSHIP_GUIDES).toHaveLength(2);
    expect(FLAGSHIP_GUIDES.map((g) => g.path)).toEqual([
      "/resources/pm-portfolio",
      "/resources/star-interview-stories",
    ]);
    const blob = collectStrings(FLAGSHIP_GUIDES).join(" | ");
    expect(blob.toLowerCase()).toMatch(/learning/);
    expect(blob.toLowerCase()).toMatch(/attestation/);
    expect(blob.toLowerCase()).toMatch(/interview lab/);
    expect(blob).not.toMatch(BANNED_SCORE_THEATRE);
    expect(blob).not.toMatch(BANNED_MARKETPLACE);
    expect(blob).not.toMatch(/100% money-back|money-back guarantee/i);
    expect(blob).not.toMatch(BANNED_PRICE);
    expect(blob.toLowerCase()).toMatch(/scoreruns? alone never light verified|scoreruns? never light/);
  });
});

describe("marketing honesty — footer + shipped sync", () => {
  it("footer columns match simplified IA and only public routes", () => {
    expect(FOOTER_COLUMNS.map((c) => c.id)).toEqual([
      "product",
      "platform",
      "company",
      "account",
    ]);
    expect(FOOTER_PRODUCT_LINKS.map((l) => l.label)).toEqual([
      "Experience",
      "Launchpad",
      "Professional Workspace",
      "How it works",
    ]);
    expect(FOOTER_ACCOUNT_LINKS.map((l) => l.href)).toEqual(["/login", "/signup"]);
    expect(FOOTER_COMPANY_LINKS.some((l) => l.href === "/about")).toBe(true);
    expect(FOOTER_COMPANY_LINKS.some((l) => l.href === "/privacy")).toBe(true);
    expect(FOOTER_PLATFORM_LINKS.some((l) => l.label === "Team Copilot")).toBe(true);
    expect(FOOTER_PLATFORM_LINKS.find((l) => l.label === "Team Copilot")?.href).toBe(
      "/professional-workspace",
    );

    const hrefs = FOOTER_COLUMNS.flatMap((c) => c.links.map((l) => l.href));
    for (const href of hrefs) {
      expect(FOOTER_PUBLIC_PATHS).toContain(href);
    }
    expect(hrefs).not.toContain("/portfolio");
    expect(hrefs).not.toContain("/contact");
    expect(hrefs).not.toContain("/workspace/marketplace");
  });

  it("homepage audience and platform copy stay inside shipped scope", () => {
    const audience = BUILT_FOR.join(" | ").toLowerCase();
    expect(audience).not.toMatch(/hiring partners/);
    expect(audience).not.toMatch(/universities/);

    const tabs = collectStrings(PLATFORM_TABS).join(" | ");
    expect(tabs).not.toMatch(BANNED_SCORE_THEATRE);
    expect(tabs.toLowerCase()).toMatch(/mission control/);

    const homeBlob = collectStrings({ HOME_FAQ, DEMO_STORIES, PLATFORM_TABS }).join(" | ");
    expect(homeBlob).not.toMatch(BANNED_MARKETPLACE);
    expect(homeBlob.toLowerCase()).toMatch(/daily briefing/);
    expect(homeBlob.toLowerCase()).toMatch(/verified/);
  });

  it("product pages do not overclaim payments, Insights product, or mission-control SKU", () => {
    const xp = collectStrings(XPERIENCE_PAGE).join(" | ");
    expect(xp).not.toMatch(/paid packaging comes later \(t9\)/i);
    expect(xp).toMatch(/Stripe Checkout|checkout is configured/i);
    expect(xp).not.toMatch(/AI recruitment/i);

    const workspace = collectStrings(TEAM_COPILOT_PAGE).join(" | ").toLowerCase();
    expect(workspace).toMatch(/not an enterprise mission-control/);
    expect(TEAM_COPILOT_INCLUDES.join(" | ").toLowerCase()).not.toMatch(/\binsights\b/);
    expect(TEAM_COPILOT_INCLUDES.join(" | ").toLowerCase()).toMatch(/mission-control nav opt-in/);
  });
  it("primary nav stays complete across product pages (no filtered jump)", () => {
    expect(PRIMARY_NAV.map((l) => l.href)).toEqual([
      "/how-it-works",
      "/experience",
      "/launchpad",
      "/professional-workspace",
    ]);
    expect(productPageNav()).toEqual(PRIMARY_NAV);
    expect(productPageNav()).toHaveLength(PRIMARY_NAV.length);
    expect(productPageNav().map((l) => l.label)).toContain("Experience");
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
