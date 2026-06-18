import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { getFounderContext } from "@/services/founderContext";

export async function GET() {
  try {
    const context = await getFounderContext();
    return NextResponse.json({ context });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
