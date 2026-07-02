import { NextResponse } from "next/server";
import { validateInviteToken } from "@/services/inviteTokenService";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.json({ error: "token query parameter is required" }, { status: 400 });
  }

  if (process.env.E2E_MOCK_INVITES === "true" && token.startsWith("mock-")) {
    const mockRoles: Record<string, { role: string; viewMode: "full" | "read_only" }> = {
      "mock-ba-invite-token": { role: "ba", viewMode: "full" },
      "mock-sponsor-invite-token": { role: "executive", viewMode: "read_only" },
      "mock-engineer-invite-token": { role: "engineer", viewMode: "full" },
      "mock-qa-invite-token": { role: "qa", viewMode: "full" },
      "mock-product-invite-token": { role: "product_manager", viewMode: "full" },
      "mock-scrum-invite-token": { role: "scrum_master", viewMode: "full" },
    };
    const mapped = mockRoles[token] ?? { role: "ba", viewMode: "full" as const };
    return NextResponse.json({
      ok: true,
      projectId: "22222222-2222-4222-8222-222222222222",
      projectName: "Patient Portal Modernisation",
      role: mapped.role,
      invitedByName: "Jordan Chen",
      viewMode: mapped.viewMode,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  const result = await validateInviteToken(token);

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        reason: result.reason,
        message: result.message,
      },
      { status: result.reason === "invalid" || result.reason === "missing" ? 404 : 410 },
    );
  }

  return NextResponse.json({
    ok: true,
    projectId: result.projectId,
    projectName: result.projectName,
    role: result.role,
    invitedByName: result.invitedByName,
    viewMode: result.viewMode,
    expiresAt: result.expiresAt,
  });
}
