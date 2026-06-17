import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { listPendingProposals } from "@/services/proposedActions";

export async function GET() {
  try {
    const proposals = await listPendingProposals(50);
    return NextResponse.json({ proposals });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
