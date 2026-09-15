/**
 * Phase 3 — owner-facing Verified Portfolio share controls.
 *
 * Kill-switch: `DELIVERX_PORTFOLIO_SHARE_CONTROLS` ships default OFF. Set it to
 * on/1/true/enabled to expose the owner controls + API. When off the owner panel
 * is hidden and the API returns a disabled (404) response; the existing public
 * share view (`/portfolio/v/[token]`) and its expiry/view-count rails are
 * unaffected either way.
 *
 * These are pure view-model helpers over the already-existing `vpp_shares` rails
 * (`store.ts` create/list/revoke, `public.ts` expiry + view-count). No schema
 * change and no trust-rail write: creating/revoking a share never touches
 * capability, evidence strength, `verifier_status`, or `deliverxVerified`.
 */

import type { PortfolioShare } from "@/lib/verified-portfolio/types";

export type ShareControlsEnv = {
  DELIVERX_PORTFOLIO_SHARE_CONTROLS?: string;
  [key: string]: string | undefined;
};

export function isPortfolioShareControlsEnabled(
  env: ShareControlsEnv = process.env as ShareControlsEnv,
): boolean {
  const value = (env.DELIVERX_PORTFOLIO_SHARE_CONTROLS ?? "").trim().toLowerCase();
  return value === "on" || value === "1" || value === "true" || value === "enabled";
}

/** Selectable expiry windows for a new share link. `null` days = no expiry. */
export const SHARE_EXPIRY_WINDOWS: ReadonlyArray<{ days: number | null; label: string }> = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: null, label: "No expiry" },
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Convert a chosen expiry window (in whole days) to an absolute ISO timestamp.
 * Returns `null` for a no-expiry selection or a non-positive window.
 */
export function expiryFromWindowDays(
  days: number | null | undefined,
  now: Date = new Date(),
): string | null {
  if (days == null || !Number.isFinite(days) || days <= 0) return null;
  return new Date(now.getTime() + Math.floor(days) * MS_PER_DAY).toISOString();
}

export type EffectiveShareStatus = "active" | "revoked" | "expired";

/**
 * Owner-facing effective status. The public read path (`public.ts`) only flips a
 * lapsed share to `expired` on visit, so for the owner list we also treat an
 * `active` share whose `expiresAt` has passed as `expired`.
 */
export function effectiveShareStatus(
  share: Pick<PortfolioShare, "status" | "expiresAt">,
  now: Date = new Date(),
): EffectiveShareStatus {
  if (share.status === "revoked") return "revoked";
  if (share.status === "expired") return "expired";
  if (share.expiresAt && new Date(share.expiresAt).getTime() <= now.getTime()) {
    return "expired";
  }
  return "active";
}

export const SHARE_STATUS_LABELS: Record<EffectiveShareStatus, string> = {
  active: "Active",
  revoked: "Revoked",
  expired: "Expired",
};

function relativeDayLabel(iso: string, now: Date): string {
  const diffMs = new Date(iso).getTime() - now.getTime();
  const abs = Math.abs(diffMs);
  const days = Math.round(abs / MS_PER_DAY);
  if (days === 0) {
    const hours = Math.max(1, Math.round(abs / (60 * 60 * 1000)));
    const unit = hours === 1 ? "hour" : "hours";
    return diffMs >= 0 ? `in ${hours} ${unit}` : `${hours} ${unit} ago`;
  }
  const unit = days === 1 ? "day" : "days";
  return diffMs >= 0 ? `in ${days} ${unit}` : `${days} ${unit} ago`;
}

export type ShareControlView = {
  id: string;
  token: string;
  label: string | null;
  shareUrl: string;
  status: EffectiveShareStatus;
  statusLabel: string;
  viewCount: number;
  lastViewedAt: string | null;
  lastViewedLabel: string;
  expiresAt: string | null;
  expiresLabel: string;
  isActive: boolean;
  canRevoke: boolean;
};

/** Map a stored share into an owner-facing display row. Pure; no I/O. */
export function describeShareControl(
  share: PortfolioShare,
  now: Date = new Date(),
): ShareControlView {
  const status = effectiveShareStatus(share, now);
  const expiresLabel = share.expiresAt
    ? status === "expired"
      ? `Expired ${relativeDayLabel(share.expiresAt, now)}`
      : `Expires ${relativeDayLabel(share.expiresAt, now)}`
    : "No expiry";
  const lastViewedLabel = share.lastViewedAt
    ? `Last viewed ${relativeDayLabel(share.lastViewedAt, now)}`
    : "Not viewed yet";
  return {
    id: share.id,
    token: share.token,
    label: share.label,
    shareUrl: share.shareUrl,
    status,
    statusLabel: SHARE_STATUS_LABELS[status],
    viewCount: share.viewCount,
    lastViewedAt: share.lastViewedAt,
    lastViewedLabel,
    expiresAt: share.expiresAt,
    expiresLabel,
    isActive: status === "active",
    canRevoke: share.status === "active",
  };
}
