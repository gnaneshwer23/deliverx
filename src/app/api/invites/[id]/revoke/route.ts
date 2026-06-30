import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { revokeInviteToken } from "@/services/inviteTokenService";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    if (!id) {
      return NextResponse.json({ error: "Invite id is required" }, { status: 400 });
    }

    await revokeInviteToken(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
