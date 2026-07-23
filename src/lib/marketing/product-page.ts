import type { ReactNode } from "react";
import { PRODUCT_NAV } from "@/lib/marketing/suite-data";

export type ProductHowStep = {
  step: string;
  title: string;
  body: string;
};

export type ProductPriceTier = {
  name: string;
  price: string;
  summary: string;
  features: readonly string[];
  cta: string;
  ctaHref: string;
  featured?: boolean;
  cadence?: string;
  idealFor?: string;
};

export type ProductPageContent = {
  /** Current product path, e.g. /xperience */
  path: string;
  brandEyebrow?: string;
  name: string;
  /** Optional line under the product name in the hero */
  promise: string;
  support?: string;
  primaryCta: { href: string; label: string };
  how: {
    label?: string;
    title: ReactNode;
    subtitle: string;
    steps: readonly ProductHowStep[];
  };
  pricing: {
    title: string;
    subtitle: string;
    tiers: readonly ProductPriceTier[];
  };
  idealFor?: string;
  finalCta: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
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
