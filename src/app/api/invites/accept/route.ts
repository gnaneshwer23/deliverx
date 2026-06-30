import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { acceptInviteToken } from "@/services/workspaceMemberService";

type Body = {
  token?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const token = body.token?.trim();

    if (!token) {
      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }

    const result = await acceptInviteToken(token);

    return NextResponse.json({
      ok: true,
      member: result.member,
      redirectPath: result.redirectPath,
      projectId: result.projectId,
      projectName: result.projectName,
      role: result.role,
      viewMode: result.viewMode,
      bootstrap: result.bootstrap,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
