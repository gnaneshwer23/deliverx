import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { listVoiceProjectLogs } from "@/services/voiceProjectUpdate";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);
    const logs = await listVoiceProjectLogs(id);
    return NextResponse.json({ ok: true, logs });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
