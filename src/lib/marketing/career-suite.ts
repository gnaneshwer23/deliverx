/**
 * Career progression packaging for DeliverX.
 * Build the experience → Land the opportunity → Succeed in the role.
 *
 * Commercial honesty (PD-2026-07-26d / T9): £ prices and purchase CTAs appear
 * only when Stripe Checkout is configured (price IDs + secret). Otherwise
 * pilot access labels remain. No money-back guarantee.
 */

import {
  isCheckoutReady,
  marketingPriceForSku,
  type BillingEnv,
} from "@/lib/billing/catalog";

export const COMPANY_POSITIONING = "AI Product Experience Company";

export const COMPANY_MISSION =
  "DeliverX is an AI-powered professional growth platform that supports Product Managers from their first practical experience through to successful product delivery in real organisations.";

export const CAREER_PROGRESSION_LINE =
  "Build the experience → Land the opportunity → Succeed in the role.";

export const CAREER_STORY_LINE =
  "DeliverX helps you gain practical experience, secure career opportunities and thrive in real product teams through three connected products.";

export const XPERIENCE_SIGNUP_HREF = "/signup?product=xperience";
export const LAUNCHPAD_SIGNUP_HREF = "/signup?product=launchpad";
export const TEAM_COPILOT_SIGNUP_HREF = "/signup?product=team-copilot";
export const PROFESSIONAL_WORKSPACE_SIGNUP_HREF = "/signup?product=professional-workspace";
export const BUNDLE_SIGNUP_HREF = "/signup?product=bundle";

export const XPERIENCE_CHECKOUT_HREF = "/billing/checkout?sku=experience";
export const LAUNCHPAD_CHECKOUT_HREF = "/billing/checkout?sku=launchpad";
export const BUNDLE_CHECKOUT_HREF = "/billing/checkout?sku=professional";

/** Shared access label when Stripe checkout is not configured. */
export const PILOT_ACCESS_LABEL = "Pilot access";
export const PILOT_ACCESS_CADENCE = "Open during the pilot · paid plans not yet live";

export const XPERIENCE_INCLUDES = [
  "Experience planner across seeded AI companies",
  "Day-1 company workspace and product challenges",
  "Customer discovery and stakeholder scenarios",
  "Strategy, PRD and delivery artefacts from real work",
  "AI coaching drafts — you decide and submit",
  "Performance feedback that feeds your evidence ledger",
  "Professional portfolio packaging from completed work",
  "Interview-ready evidence grounded in what you did",
  "Career intelligence that carries into Launchpad",
] as const;

/** Matches Career Intelligence as shipped (not aspirational twin/marketplace depth). */
export const LAUNCHPAD_INCLUDES = [
  "Role readiness with labelled source (assessment, mixed, or heuristic)",
  "Personalised roadmap from capability gaps",
  "Evidence-backed CV packaging into Verified Portfolio",
  "Career profile grounded in Professional Intelligence",
  "Interview lab — STAR stories and practice sessions",
  "Application tracking for roles you pursue",
  "Honest labels when readiness is heuristic, not assessment-backed",
] as const;

export const TEAM_COPILOT_INCLUDES = [
  "Professional Workspace shared shell",
  "Experience + delivery project switcher",
  "Role-based AI teammates (draft only)",
  "Meetings, Inbox, Tasks, Artefacts",
  "Decisions, Risks, Timeline, Coach",
  "Evidence Review and contribution trails",
  "Observation consent default OFF",
  "Legacy mission-control nav opt-in only",
] as const;

export const BUNDLE_INCLUDES = [
  "Experience planner and company workspaces",
  "Launchpad Career Intelligence modules",
  "Professional Workspace for delivery practice",
  "Shared Professional Intelligence evidence ledger",
  "Privacy export and delete controls",
  "Entitled access across the connected journey",
] as const;

export type CareerTierId = "xperience" | "launchpad" | "team-copilot" | "bundle";

export type CareerTier = {
  id: CareerTierId;
  productName: string;
  stage: string;
  designedFor: string;
  headline: string;
  /** Access label or honest £ price when checkout is wired. */
  price: string;
  cadence: string;
  summary: string;
  idealFor: string;
  includes: readonly string[];
  cta: string;
  ctaHref: string;
  href: string;
  featured?: boolean;
  checkoutReady?: boolean;
};

function buildTiers(env: BillingEnv = process.env as BillingEnv): {
  tiers: CareerTier[];
  bundle: CareerTier;
  checkoutReady: boolean;
} {
  const checkoutReady = isCheckoutReady(env);
  const experiencePrice = marketingPriceForSku("experience", env);
  const launchpadPrice = marketingPriceForSku("launchpad", env);
  const professionalPrice = marketingPriceForSku("professional", env);

  const tiers: CareerTier[] = [
    {
      id: "xperience",
      productName: "Experience",
      stage: "Build the experience",
      designedFor: "Aspiring Product Managers building practical experience",
      headline: "Build the experience employers expect",
      price: experiencePrice.price,
      cadence: experiencePrice.cadence,
      summary:
        "Join an AI-powered company and work as a Product Manager from day one. Every project, decision and conversation builds genuine professional evidence — not another certificate.",
      idealFor:
        "Career switchers, graduates and aspiring Product Managers who want practical experience before applying for roles.",
      includes: XPERIENCE_INCLUDES,
      cta: checkoutReady ? "Start checkout" : "Join the pilot",
      ctaHref: checkoutReady ? XPERIENCE_CHECKOUT_HREF : XPERIENCE_SIGNUP_HREF,
      href: "/experience",
      checkoutReady,
    },
    {
      id: "launchpad",
      productName: "Launchpad",
      stage: "Land the opportunity",
      designedFor: "Professionals ready to turn experience into interviews",
      headline: "Turn your experience into opportunities",
      price: launchpadPrice.price,
      cadence: launchpadPrice.cadence,
      summary:
        "Career Intelligence for product professionals — labelled readiness, evidence-backed packaging, interview prep and application tracking grounded in what you can prove.",
      idealFor:
        "Professionals actively preparing for Product Management interviews and career transitions.",
      includes: LAUNCHPAD_INCLUDES,
      cta: checkoutReady ? "Start checkout" : "Join the pilot",
      ctaHref: checkoutReady ? LAUNCHPAD_CHECKOUT_HREF : LAUNCHPAD_SIGNUP_HREF,
      href: "/launchpad",
      checkoutReady,
    },
    {
      id: "team-copilot",
      productName: "Professional Workspace",
      stage: "Succeed in the role",
      designedFor: "Professionals delivering multidisciplinary work with AI teammates",
      headline: "Deliver with AI teammates — you own the work",
      price: checkoutReady ? "Included" : PILOT_ACCESS_LABEL,
      cadence: checkoutReady
        ? "With Complete Journey · not sold alone"
        : PILOT_ACCESS_CADENCE,
      summary:
        "A Professional Workspace for multidisciplinary delivery — collaborate with role-based AI teammates, run meetings, manage stakeholders, create artefacts, decide, and generate observable evidence. AI drafts; humans submit.",
      idealFor:
        "Product Managers, Delivery Managers, Project Managers, Business Analysts and cross-functional product teams.",
      includes: TEAM_COPILOT_INCLUDES,
      cta: checkoutReady ? "See Complete Journey" : "Get started",
      ctaHref: checkoutReady ? BUNDLE_CHECKOUT_HREF : PROFESSIONAL_WORKSPACE_SIGNUP_HREF,
      href: "/professional-workspace",
      checkoutReady,
    },
  ];

  const bundle: CareerTier = {
    id: "bundle",
    productName: "Complete Journey",
    stage: "The full path",
    designedFor: "People who want experience, opportunity and delivery in one commitment",
    headline: "Everything in Experience, Launchpad and Professional Workspace",
    price: professionalPrice.price,
    cadence: professionalPrice.cadence,
    summary:
      "The connected professional growth path — build experience, prepare for opportunity and practise delivery with shared Professional Intelligence.",
    idealFor:
      "People who want the full path: company experience, career readiness and delivery tools in one subscription.",
    includes: BUNDLE_INCLUDES,
    cta: checkoutReady ? "Start checkout" : "Join the pilot",
    ctaHref: checkoutReady ? BUNDLE_CHECKOUT_HREF : BUNDLE_SIGNUP_HREF,
    href: "/pricing#bundle",
    featured: true,
    checkoutReady,
  };

  return { tiers, bundle, checkoutReady };
}

const built = buildTiers();

export const CAREER_TIERS: readonly CareerTier[] = built.tiers;
export const CAREER_BUNDLE: CareerTier = built.bundle;
export const COMMERCIAL_CHECKOUT_READY = built.checkoutReady;

/** Rebuild tiers for tests with a custom env. */
export function careerTiersForEnv(env: BillingEnv): {
  tiers: readonly CareerTier[];
  bundle: CareerTier;
  checkoutReady: boolean;
} {
  return buildTiers(env);
}

export const CAREER_PROMISE = {
  title: "Build the experience before you get the opportunity.",
  body: "We believe capability should be demonstrated through experience, not just qualifications. That’s why every project, decision, conversation and outcome contributes to your professional development.",
  guaranteeTitle: built.checkoutReady ? "Commercial terms" : "Pilot promise",
  guaranteeBody: built.checkoutReady
    ? "Paid plans use Stripe Checkout and Customer Portal. There is no money-back guarantee. Cancel anytime via Settings → Billing; access continues through the paid period then entitlements revoke."
    : "During the open pilot there is no paid checkout and no money-back offer — access is free while we harden the product with early users. Paid plans appear on this page only when Stripe Checkout is configured.",
  outcomes: [
    "Meaningful Product Management practice",
    "Evidence you can cite in interviews",
    "Clearer readiness signals with source labels",
    "Delivery habits you can take into real teams",
  ] as const,
  disclaimer:
    "DeliverX does not guarantee interviews or job offers. Outcomes depend on your market, effort and how you use the evidence you build. Verified badges require independent third-party attestation — not self-report or a capability assessment alone.",
} as const;

export function careerTierById(id: CareerTierId): CareerTier {
  if (id === "bundle") return CAREER_BUNDLE;
  const tier = CAREER_TIERS.find((item) => item.id === id);
  if (!tier) throw new Error(`Unknown career tier: ${id}`);
  return tier;
}
