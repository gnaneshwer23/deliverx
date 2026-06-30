import { NextResponse } from "next/server";
import { validateInviteToken } from "@/services/inviteTokenService";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.json({ error: "token query parameter is required" }, { status: 400 });
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
