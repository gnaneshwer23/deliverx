import { describe, expect, it } from "vitest";
import { assertPiAccess } from "@/lib/access/gate";

describe("assertPiAccess", () => {
  it("allows everyone when allowlist is empty", () => {
    const decision = assertPiAccess({
      userId: "u1",
      email: "a@example.com",
      surface: "profile",
      env: {},
    });
    expect(decision).toEqual({ allowed: true });
  });

  it("restricts to allowlisted emails or ids", () => {
    const env = { DELIVERX_PI_ALLOWLIST: "pilot@deliverx.app, u-special" };
    expect(
      assertPiAccess({
        userId: "other",
        email: "pilot@deliverx.app",
        surface: "evidence",
        env,
      }).allowed,
    ).toBe(true);
    expect(
      assertPiAccess({
        userId: "u-special",
        email: "x@y.com",
        surface: "evidence",
        env,
      }).allowed,
    ).toBe(true);
    expect(
      assertPiAccess({
        userId: "nope",
        email: "nope@example.com",
        surface: "evidence",
        env,
      }).allowed,
    ).toBe(false);
  });

  it("can disable the gate entirely", () => {
    const decision = assertPiAccess({
      userId: "u1",
      email: "blocked@example.com",
      surface: "profile",
      env: {
        DELIVERX_PI_ALLOWLIST: "only@example.com",
        DELIVERX_PI_GATE: "off",
      },
    });
    expect(decision).toEqual({ allowed: true });
  });

  it("honours per-surface allowlist when set", () => {
    const env = { DELIVERX_PI_SURFACES: "profile,evidence,baseline" };
    expect(
      assertPiAccess({
        userId: "u1",
        surface: "profile",
        env,
      }).allowed,
    ).toBe(true);
    expect(
      assertPiAccess({
        userId: "u1",
        surface: "baseline",
        env,
      }).allowed,
    ).toBe(true);
    expect(
      assertPiAccess({
        userId: "u1",
        surface: "career",
        env,
      }).allowed,
    ).toBe(false);
  });
});
