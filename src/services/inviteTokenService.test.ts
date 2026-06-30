import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getInviteJwtSecret,
  hashInviteToken,
  signInviteJwt,
  verifyInviteJwt,
  type InviteJwtPayload,
} from "@/services/inviteTokenService";

const samplePayload: InviteJwtPayload = {
  invite_id: "11111111-1111-4111-8111-111111111111",
  project_id: "22222222-2222-4222-8222-222222222222",
  project_name: "NHS EHR Transformation",
  role: "product_manager",
  invited_by: "33333333-3333-4333-8333-333333333333",
  invited_by_name: "Sarah Johnson",
  view_mode: "full",
  expires_at: "2099-01-01T00:00:00.000Z",
};

describe("inviteTokenService", () => {
  beforeEach(() => {
    process.env.INVITE_JWT_SECRET = "test-invite-secret";
  });

  afterEach(() => {
    delete process.env.INVITE_JWT_SECRET;
  });

  it("returns a configured secret", () => {
    expect(getInviteJwtSecret()).toBe("test-invite-secret");
  });

  it("hashes tokens deterministically", () => {
    const hashA = hashInviteToken("abc123");
    const hashB = hashInviteToken("abc123");
    expect(hashA).toBe(hashB);
    expect(hashA).not.toBe(hashInviteToken("different"));
  });

  it("signs and verifies JWT payloads", () => {
    const token = signInviteJwt(samplePayload);
    expect(token.split(".")).toHaveLength(3);

    const verified = verifyInviteJwt(token);
    expect(verified).toEqual(samplePayload);
  });

  it("rejects tampered JWT signatures", () => {
    const token = signInviteJwt(samplePayload);
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1]}.invalidsignature`;
    expect(verifyInviteJwt(tampered)).toBeNull();
  });

  it("rejects malformed JWT strings", () => {
    expect(verifyInviteJwt("not-a-jwt")).toBeNull();
    expect(verifyInviteJwt("")).toBeNull();
  });

  it("reconstructs stable join URLs from invite metadata", async () => {
    const { buildJoinUrlFromInviteRow } = await import("@/services/inviteTokenService");
    const url = await buildJoinUrlFromInviteRow({
      id: samplePayload.invite_id,
      project_id: samplePayload.project_id,
      role: samplePayload.role,
      invited_by: samplePayload.invited_by,
      view_mode: samplePayload.view_mode,
      expires_at: samplePayload.expires_at,
      projects: { name: samplePayload.project_name },
      users: { name: samplePayload.invited_by_name },
    });

    expect(url).toContain("/join?token=");
    const token = new URL(url, "http://localhost:3000").searchParams.get("token");
    expect(verifyInviteJwt(token!)).toEqual(samplePayload);
  });

  it("validates rehydrated tokens when inviter display name differs from original", async () => {
    const originalToken = signInviteJwt(samplePayload);
    const rehydratedToken = signInviteJwt({
      ...samplePayload,
      invited_by_name: "Project Manager",
      project_name: "Renamed project",
    });
    expect(rehydratedToken).not.toBe(originalToken);
    expect(verifyInviteJwt(rehydratedToken)?.invite_id).toBe(samplePayload.invite_id);
  });
});
