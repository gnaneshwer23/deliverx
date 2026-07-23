import type { ReactNode } from "react";
import { PRODUCT_NAV } from "@/lib/marketing/suite-data";

export type ProductHowStep = {
  step: string;
  title: string;
  body: string;
};

export type ProductPageContent = {
  /** Current product path, e.g. /xperience */
  path: string;
  /** Stage in the career progression, shown in hero */
  stage: string;
  brandEyebrow?: string;
  name: string;
  /** Hero promise — outcome-led, one sentence */
  promise: string;
  primaryCta: { href: string; label: string };
  /** Secondary hero CTA — typically See pricing or Bundle */
  secondaryCta?: { href: string; label: string };
  problem: {
    label?: string;
    title: string;
    body: string;
  };
  how: {
    label?: string;
    title: ReactNode;
    subtitle: string;
    steps: readonly ProductHowStep[];
  };
  includes: {
    label?: string;
    title: string;
    subtitle?: string;
    items: readonly string[];
    highlightCount?: number;
  };
  idealFor: {
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
