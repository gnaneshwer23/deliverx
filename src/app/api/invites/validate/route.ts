import { NextResponse } from "next/server";
import { validateInviteToken } from "@/services/inviteTokenService";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.json({ error: "token query parameter is required" }, { status: 400 });
  }

  if (process.env.E2E_MOCK_INVITES === "true" && token.startsWith("mock-")) {
    const sponsor = token.includes("sponsor");
    return NextResponse.json({
      ok: true,
      projectId: "22222222-2222-4222-8222-222222222222",
      projectName: "Patient Portal Modernisation",
      role: sponsor ? "executive" : "ba",
      invitedByName: "Jordan Chen",
      viewMode: sponsor ? "read_only" : "full",
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
