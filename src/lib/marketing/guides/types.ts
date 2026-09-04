/** Shared shape for marketing discovery guides (Phase 2). */

export type GuideLink = {
  href: string;
  label: string;
};

export type GuideSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
};

export type MarketingGuide = {
  slug: string;
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  lede: string;
  updatedLabel: string;
  sections: readonly GuideSection[];
  related: readonly GuideLink[];
  primaryCta: GuideLink;
  secondaryCta: GuideLink;
};
