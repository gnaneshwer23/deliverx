import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { generateInviteToken, type InviteViewMode } from "@/services/inviteTokenService";
import type { PersonaHomeRole } from "@/config/role-home-routing";

type Body = {
  projectId?: string;
  role?: PersonaHomeRole | "team_member";
  viewMode?: InviteViewMode;
  email?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const projectId = body.projectId?.trim();
    const role = body.role;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    if (!role) {
      return NextResponse.json({ error: "role is required" }, { status: 400 });
    }

    const email = body.email?.trim().toLowerCase();
    if (email && !email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const result = await generateInviteToken({
      projectId,
      role,
      viewMode: body.viewMode,
      recipientEmail: email,
    });

    return NextResponse.json({
      ok: true,
      token: result.token,
      joinUrl: result.joinUrl,
      invite: result.invite,
      emailSent: result.emailSent,
      emailReason: result.emailReason,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
