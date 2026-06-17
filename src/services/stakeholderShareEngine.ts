/**
 * External stakeholder view — pure snapshot shaping (no PII, no internal ops).
 */

import type { DeliveryForecast } from "./forecastEngine";
import type { Health, Confidence } from "./intelligenceEngine";

export type ExternalMilestoneRow = {
  title: string;
  targetDate: string | null;
  status: string;
  confidenceScore: number;
};

export type ExternalRaidRow = {
  type: string;
  title: string;
  severity: string;
};

export type ExternalStakeholderView = {
  projectName: string;
  organisationName: string;
  status: string;
  goal: string | null;
  timeline: string | null;
  deliveryType: string | null;
  health: Pick<Health, "score" | "tier" | "trend" | "factors">;
  confidence: Pick<Confidence, "score" | "tier"> & { summary: string };
  alignment: {
    score: number | null;
    factors: string[];
    computedAt: string | null;
  };
  forecast: {
    prediction: string;
    expectedDate: string;
    confidence: number;
    trend: DeliveryForecast["trend"];
    delayDays: number;
    anchorLabel: string;
  };
  milestones: ExternalMilestoneRow[];
  topRisks: ExternalRaidRow[];
  raidSummary: {
    openRisks: number;
    openIssues: number;
    openDependencies: number;
  };
  latestReport: {
    title: string;
    excerpt: string;
    publishedAt: string;
  } | null;
  generatedAt: string;
};

export function buildRaidSummary(items: ExternalRaidRow[]): ExternalStakeholderView["raidSummary"] {
  return {
    openRisks: items.filter((r) => r.type === "risk").length,
    openIssues: items.filter((r) => r.type === "issue").length,
    openDependencies: items.filter((r) => r.type === "dependency").length,
  };
}

export function sanitizeReportExcerpt(content: string, maxLen = 480): string {
  const text = content.replace(/\s+/g, " ").trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1)}…`;
}

export function isShareLinkExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}
