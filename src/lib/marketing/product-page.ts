import type { ReactNode } from "react";
import { PRODUCT_NAV } from "@/lib/marketing/suite-data";

export type ProductHowStep = {
  step: string;
  title: string;
  body: string;
};

export type ProductNarrativeSection = {
  id: string;
  label?: string;
  title: string;
  body: string;
  items?: readonly string[];
  tone?: "white" | "cream" | "green-tint";
};

export type ProductFaqItem = {
  question: string;
  answer: string;
};

export type ProductPageContent = {
  /** Current product path, e.g. /experience */
  path: string;
  /** Stage in the career progression, shown in hero */
  stage: string;
  brandEyebrow?: string;
  name: string;
  /** Primary hero headline — outcome-led */
  heroTitle: string;
  /** Supporting sentence under the headline */
  promise: string;
  primaryCta: { href: string; label: string };
  /** Secondary hero CTA — typically See pricing or Bundle */
  secondaryCta?: { href: string; label: string };
  /** Editorial sections between hero and pricing */
  sections: readonly ProductNarrativeSection[];
  faq?: {
    label?: string;
    title?: string;
    items: readonly ProductFaqItem[];
  };
  /** @deprecated Prefer sections — kept for gradual migration */
  problem?: {
    label?: string;
    title: string;
    body: string;
  };
  /** @deprecated Prefer sections */
  how?: {
    label?: string;
    title: ReactNode;
    subtitle: string;
    steps: readonly ProductHowStep[];
  };
  /** @deprecated Prefer sections */
  includes?: {
    label?: string;
    title: string;
    subtitle?: string;
    items: readonly string[];
    highlightCount?: number;
  };
  /** @deprecated Prefer sections */
  idealFor?: {
    label?: string;
    title?: string;
    body: string;
  };
  pricing: {
    label?: string;
    title: string;
    subtitle: string;
    price: string;
    cadence: string;
    summary: string;
    cta: string;
    ctaHref: string;
    /** Link copy under the product CTA */
    bundleLabel?: string;
    bundleHref?: string;
  };
  finalCta: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  };
  footerCta: {
    title: string;
    subtitle: string;
    href: string;
    label: string;
  };
};

export function productPageNav(currentPath: string) {
  return [
    { href: "/", label: "Home" },
    ...PRODUCT_NAV.filter((link) => link.href !== currentPath),
  ] as const;
}
