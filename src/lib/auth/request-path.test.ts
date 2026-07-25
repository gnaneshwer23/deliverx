import { describe, expect, it } from "vitest";
import { resolveRequestPathFromHeaderMap } from "@/lib/auth/request-path";

describe("resolveRequestPathFromHeaderMap", () => {
  it("prefers proxy x-pathname + x-search", () => {
    expect(
      resolveRequestPathFromHeaderMap({
        "x-pathname": "/workspace/coach",
        "x-search": "?project=abc",
        "x-matched-path": "/workspace",
      }),
    ).toBe("/workspace/coach?project=abc");
  });

  it("falls back to x-matched-path when proxy headers are absent (TD-002)", () => {
    expect(
      resolveRequestPathFromHeaderMap({
        "x-matched-path": "/workspace/coach",
      }),
    ).toBe("/workspace/coach");
  });

  it("ignores internal Next matched paths", () => {
    expect(
      resolveRequestPathFromHeaderMap({
        "x-matched-path": "/_next/static/chunks/foo.js",
      }),
    ).toBeNull();
  });

  it("returns null when no usable path headers exist", () => {
    expect(resolveRequestPathFromHeaderMap({})).toBeNull();
  });
});
