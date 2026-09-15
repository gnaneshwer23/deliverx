import { describe, expect, it } from "vitest";
import type { PortfolioShare } from "@/lib/verified-portfolio/types";
import {
  describeShareControl,
  effectiveShareStatus,
  expiryFromWindowDays,
  isPortfolioShareControlsEnabled,
  SHARE_EXPIRY_WINDOWS,
} from "@/lib/verified-portfolio/share-controls";

function makeShare(overrides: Partial<PortfolioShare> = {}): PortfolioShare {
  return {
    id: "share-1",
    entryId: "entry-1",
    versionId: null,
    token: "tok_abc",
    label: "APM application",
    status: "active",
    expiresAt: null,
    hiddenFields: [],
    viewCount: 0,
    lastViewedAt: null,
    shareUrl: "http://localhost:3000/portfolio/v/tok_abc",
    ...overrides,
  };
}

describe("isPortfolioShareControlsEnabled", () => {
  it("defaults to off when unset or empty", () => {
    expect(isPortfolioShareControlsEnabled({})).toBe(false);
    expect(isPortfolioShareControlsEnabled({ DELIVERX_PORTFOLIO_SHARE_CONTROLS: "" })).toBe(false);
  });

  it("stays off for off/0/false/disabled", () => {
    for (const v of ["off", "0", "false", "disabled", "no"]) {
      expect(isPortfolioShareControlsEnabled({ DELIVERX_PORTFOLIO_SHARE_CONTROLS: v })).toBe(false);
    }
  });

  it("enables for on/1/true/enabled (case/space-insensitive)", () => {
    for (const v of ["on", "1", "true", "enabled", " ON ", "True"]) {
      expect(isPortfolioShareControlsEnabled({ DELIVERX_PORTFOLIO_SHARE_CONTROLS: v })).toBe(true);
    }
  });
});

describe("expiryFromWindowDays", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");

  it("returns null for no-expiry / non-positive windows", () => {
    expect(expiryFromWindowDays(null, now)).toBeNull();
    expect(expiryFromWindowDays(undefined, now)).toBeNull();
    expect(expiryFromWindowDays(0, now)).toBeNull();
    expect(expiryFromWindowDays(-5, now)).toBeNull();
  });

  it("adds the chosen number of days", () => {
    expect(expiryFromWindowDays(90, now)).toBe("2026-04-01T00:00:00.000Z");
    expect(expiryFromWindowDays(7, now)).toBe("2026-01-08T00:00:00.000Z");
  });

  it("offers 7/30/90/no-expiry windows", () => {
    expect(SHARE_EXPIRY_WINDOWS.map((w) => w.days)).toEqual([7, 30, 90, null]);
  });
});

describe("effectiveShareStatus", () => {
  const now = new Date("2026-01-15T00:00:00.000Z");

  it("reports active for a live, non-expired share", () => {
    expect(effectiveShareStatus(makeShare({ expiresAt: "2026-02-01T00:00:00.000Z" }), now)).toBe(
      "active",
    );
    expect(effectiveShareStatus(makeShare({ expiresAt: null }), now)).toBe("active");
  });

  it("reports revoked regardless of expiry", () => {
    expect(
      effectiveShareStatus(makeShare({ status: "revoked", expiresAt: "2099-01-01T00:00:00.000Z" }), now),
    ).toBe("revoked");
  });

  it("treats a lapsed active share as expired before any public visit flips it", () => {
    expect(
      effectiveShareStatus(makeShare({ status: "active", expiresAt: "2026-01-01T00:00:00.000Z" }), now),
    ).toBe("expired");
  });

  it("honours a stored expired status", () => {
    expect(effectiveShareStatus(makeShare({ status: "expired" }), now)).toBe("expired");
  });
});

describe("describeShareControl", () => {
  const now = new Date("2026-01-15T00:00:00.000Z");

  it("maps an active share with view stats and expiry", () => {
    const view = describeShareControl(
      makeShare({
        expiresAt: "2026-01-25T00:00:00.000Z",
        viewCount: 4,
        lastViewedAt: "2026-01-13T00:00:00.000Z",
      }),
      now,
    );
    expect(view.status).toBe("active");
    expect(view.statusLabel).toBe("Active");
    expect(view.isActive).toBe(true);
    expect(view.canRevoke).toBe(true);
    expect(view.viewCount).toBe(4);
    expect(view.expiresLabel).toMatch(/^Expires in 10 days$/);
    expect(view.lastViewedLabel).toMatch(/^Last viewed 2 days ago$/);
  });

  it("marks a revoked share not revocable", () => {
    const view = describeShareControl(makeShare({ status: "revoked" }), now);
    expect(view.status).toBe("revoked");
    expect(view.canRevoke).toBe(false);
    expect(view.isActive).toBe(false);
  });

  it("labels a lapsed active share as expired and blocks a no-op revoke", () => {
    const view = describeShareControl(
      makeShare({ status: "active", expiresAt: "2026-01-05T00:00:00.000Z" }),
      now,
    );
    expect(view.status).toBe("expired");
    expect(view.expiresLabel).toMatch(/^Expired 10 days ago$/);
    // The DB row is still "active", so the owner may still revoke to hard-invalidate it.
    expect(view.canRevoke).toBe(true);
  });

  it("shows no-expiry and not-viewed placeholders", () => {
    const view = describeShareControl(makeShare({ expiresAt: null, lastViewedAt: null }), now);
    expect(view.expiresLabel).toBe("No expiry");
    expect(view.lastViewedLabel).toBe("Not viewed yet");
  });
});
