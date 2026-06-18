import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { getQaContext } from "@/services/qaContext";

export async function GET() {
  try {
    const ctx = await getQaContext();
    return NextResponse.json({ ok: true, context: ctx });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
